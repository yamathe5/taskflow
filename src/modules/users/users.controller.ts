import type { Request, Response } from 'express';

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
    const userId = Number(req.params.id);
    await usersService.softDeleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  });
}

export const usersController = new UsersController();