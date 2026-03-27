import type { Request, Response } from 'express';

import { AppError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/utils/async-handler';
import { usersService } from './users.service';

class UsersController {
  listUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await usersService.listUsers();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  });

  listAssignableUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await usersService.listDevelopers();

    res.status(200).json({
      success: true,
      message: 'Assignable users retrieved successfully',
      data: users,
    });
  });

  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const user = await usersService.getMyProfile(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    });
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const updatedUser = await usersService.updateMyProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const user = await usersService.getUserById(userId);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const updatedUser = await usersService.updateUser(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  });

  softDeleteUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const userId = Number(req.params.id);
    await usersService.softDeleteUser(userId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  });
}

export const usersController = new UsersController();