import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodObject, ZodRawShape } from 'zod';

import { AppError } from '../errors/app-error';

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'general';

    if (!formatted[path]) {
      formatted[path] = [];
    }

    formatted[path].push(issue.message);
  }

  return formatted;
}

export function validate(schema: ZodObject<ZodRawShape>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return next(new AppError('Validation error', 400, errors));
    }

    req.body = result.data.body ?? req.body;
    req.params = (result.data.params ?? req.params) as Request['params'];

    next();
  };
}