
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { enrollMemberSchema } from '../schemas/member.schema';

const prisma = new PrismaClient();

export const enrollMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;
    const { gymId, membershipTier } = enrollMemberSchema.parse(req.body);

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check gym capacity
      const gym = await tx.gym.findUnique({
        where: { id: gymId },
        include: {
          members: true // or _count
        }
      });

      if (!gym) {
        throw new Error('Gym not found');
      }

      // We need accurate count.
      const currentCount = await tx.member.count({
        where: { gymId }
      });

      if (currentCount >= gym.capacity) {
        throw new Error('Gym is at full capacity');
      }

      // 2. Create enrollment (update member or create member? Requirement says "enroll a member", implies member exists? Or create enrollment record?)
      // Requirement: "The API must expose an endpoint to enroll a member... members/:memberId/enrollments"
      // "Request Body: { gymId, membershipTier }"
      // "Success Response: The new enrollment record."
      // Database Schema: Member has gymId. So enrolling = updating Member's gymId?
      // Or is `Enrollment` a separate table?
      // My schema: Member has `gymId`. `gym` relation.
      // So "enrollment" means updating the Member to belong to this Gym?
      // Or creating a many-to-many?
      // Requirement says "Member to Gym" ... "Members table".
      // Schema model: `Member` has `gymId`. So 1 Member -> 1 Gym (current model).
      // If the requirement implies history, I'd need an Enrollment table.
      // "The new enrollment record" -> Returns the updated Member or an Enrollment object?
      // Given my schema (simple 1:N), I will update the Member.
      // Wait, "The new enrollment record" suggests I might need an `Enrollment` model?
      // "Referential Integrity: All relationships (e.g., Member to Gym, Workout to Member)..."
      // My schema: Member -> Gym.
      // Let's assume updating Member is sufficient for "Enrollment".
      // If member doesn't exist? "members/:memberId".
      // I'll assume member exists or I create them? The params has memberId.
      // I'll assume updating the Member's gymId.
      
      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
            gymId,
            membershipTier
        }
      });
      
      return updatedMember;
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Gym is at full capacity') {
        return res.status(400).json({
            success: false,
            error: {
                layer: "application",
                errors: [{
                    field: "gymId",
                    rule: "capacity_limit",
                    message: "Gym is at full capacity",
                    value: req.body.gymId
                }]
            }
        });
    }
    next(error);
  }
};
