import type { Request, Response } from 'express';

import { AppError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import { tasksService } from './tasks.service';

class TasksController {
  listTasks = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const tasks = await tasksService.listTasks(req.user);

    res.status(200).json(
      successResponse({
        message: 'Tasks retrieved successfully',
        data: tasks,
      }),
    );
  });

  getTaskById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const taskId = Number(req.params.id);
    const task = await tasksService.getTaskById(taskId, req.user);

    res.status(200).json(
      successResponse({
        message: 'Task retrieved successfully',
        data: task,
      }),
    );
  });

  createTask = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const task = await tasksService.createTask(req.body, req.user);

    res.status(201).json(
      successResponse({
        message: 'Task created successfully',
        data: task,
      }),
    );
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const taskId = Number(req.params.id);
    const task = await tasksService.updateTask(taskId, req.body, req.user);

    res.status(200).json(
      successResponse({
        message: 'Task updated successfully',
        data: task,
      }),
    );
  });

  updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const taskId = Number(req.params.id);
    const task = await tasksService.updateTaskStatus(taskId, req.body, req.user);

    res.status(200).json(
      successResponse({
        message: 'Task status updated successfully',
        data: task,
      }),
    );
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    const taskId = Number(req.params.id);
    await tasksService.deleteTask(taskId, req.user);

    res.status(200).json(
      successResponse({
        message: 'Task deleted successfully',
        data: null,
      }),
    );
  });
}

export const tasksController = new TasksController();