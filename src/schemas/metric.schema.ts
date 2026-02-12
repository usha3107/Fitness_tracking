
import { z } from 'zod';

export const createMetricSchema = z.object({
  type: z.enum(['heart_rate', 'weight', 'systolic_bp', 'diastolic_bp']),
  value: z.number(),
});

export type CreateMetricInput = z.infer<typeof createMetricSchema>;
