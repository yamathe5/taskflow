import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from './app-error';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  console.error('Unhandled error:', error);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}