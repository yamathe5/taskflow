import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app-error';

type Role = 'admin' | 'project_manager' | 'developer';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
}