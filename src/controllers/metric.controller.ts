
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createMetricSchema } from '../schemas/metric.schema';

const prisma = new PrismaClient();

export const logMetric = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;
    const { type, value } = createMetricSchema.parse(req.body);

    // Runtime Validation:
    // 1. Bounds Check (Heart Rate 30-220)
    if (type === 'heart_rate') {
      if (value < 30 || value > 220) {
        throw new Error('Heart rate must be between 30 and 220');
      }
    }

    // 2. Temporal Check (Weight cannot change > 5kg in last 24h)
    if (type === 'weight') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const lastWeight = await prisma.metric.findFirst({
        where: {
          memberId,
          type: 'weight',
          timestamp: { gte: oneDayAgo }
        },
        orderBy: { timestamp: 'desc' }
      });

      if (lastWeight) {
        const diff = Math.abs(lastWeight.value - value);
        if (diff > 5) {
             throw new Error('Weight cannot change by more than 5kg in 24 hours');
        }
      }
    }

    const metric = await prisma.metric.create({
      data: {
        memberId,
        type,
        value,
      },
    });

    res.status(201).json(metric);
  } catch (error) {
    next(error);
  }
};
