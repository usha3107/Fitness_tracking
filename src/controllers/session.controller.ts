
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createExerciseSchema } from '../schemas/exercise.schema';

const prisma = new PrismaClient();

export const addExercise = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const body = createExerciseSchema.parse(req.body);

    // Polymorphic saving
    // body is { type: 'strength', data: { ... } }
    // type aligns with Exercise.type
    // data aligns with Exercise.data (Json)

    const exercise = await prisma.exercise.create({
      data: {
        sessionId,
        type: body.type,
        data: body.data,
      },
    });

    res.status(201).json(exercise);
  } catch (error) {
    next(error);
  }
};
