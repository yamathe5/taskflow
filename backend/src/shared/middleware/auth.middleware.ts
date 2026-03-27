import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { AppError } from '../errors/app-error';

type JwtPayload = {
  userId: number;
  email: string;
  role: 'admin' | 'project_manager' | 'developer';
  iat?: number;
  exp?: number;
};

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw new AppError('Authorization header is required', 401);
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Invalid authorization format', 401);
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    req.user = {
      userId: Number(decoded.userId),
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}