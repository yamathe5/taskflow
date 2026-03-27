import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import { authService } from './auth.service';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.status(201).json(
      successResponse({
        message: 'User registered successfully',
        data: result,
      }),
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    res.status(200).json(
      successResponse({
        message: 'Login successful',
        data: result,
      }),
    );
  });
}

export const authController = new AuthController();