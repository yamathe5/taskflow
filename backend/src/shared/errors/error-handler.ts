import type { NextFunction, Request, Response } from 'express';

import { AppError } from './app-error';
import { errorResponse } from '../utils/api-response';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      errorResponse({
        message: error.message,
        errors: error.errors,
      }),
    );
    return;
  }

  console.error('Unhandled error:', error);

  res.status(500).json(
    errorResponse({
      message: 'Internal server error',
    }),
  );
}