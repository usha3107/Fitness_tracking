
import { z } from 'zod';

export const enrollMemberSchema = z.object({
  gymId: z.string().min(1, "Gym ID is required"),
  membershipTier: z.string().min(1, "Membership tier is required"),
});

export type EnrollMemberInput = z.infer<typeof enrollMemberSchema>;
