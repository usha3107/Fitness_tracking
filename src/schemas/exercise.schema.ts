
import { z } from 'zod';

const baseExerciseSchema = z.object({
  notes: z.string().optional(),
});

const strengthSchema = baseExerciseSchema.extend({
  type: z.literal('strength'),
  data: z.object({
    reps: z.number().int().positive(),
    sets: z.number().int().positive(),
    weight: z.number().positive().optional(),
  }),
});

const cardioSchema = baseExerciseSchema.extend({
  type: z.literal('cardio'),
  data: z.object({
    duration: z.number().positive(), // minutes
    distance: z.number().positive().optional(), // km
    calories: z.number().positive().optional(),
  }),
});

// Discriminated Union
export const createExerciseSchema = z.discriminatedUnion('type', [
  strengthSchema,
  cardioSchema,
]);

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
