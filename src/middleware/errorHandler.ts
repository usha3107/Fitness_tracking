
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        layer: 'runtime',
        errors: err.errors.map((e) => ({
          field: e.path.join('.'),
          rule: e.code,
          message: e.message,
          value: (req.body && e.path[0]) ? req.body[e.path[0]] : 'N/A',
        })),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
       return res.status(400).json({
        success: false,
        error: {
          layer: 'database',
          errors: [
            {
              field: (err.meta?.target as string[])?.join('.') || 'unknown',
              rule: 'unique_constraint',
              message: 'Unique constraint violation',
              value: 'N/A'
            },
          ],
        },
      });
    }
     // Add more Prisma error handling as needed
  }

  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal Server Error' });
};
