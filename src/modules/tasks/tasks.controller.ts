import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/async-handler';
import { tasksService } from './tasks.service';

class TasksController {
  listTasks = asyncHandler(async (_req: Request, res: Response) => {
    const tasks = await tasksService.listTasks();

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks,
    });
  });

  getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    const task = await tasksService.getTaskById(taskId);

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task,
    });
  });

  createTask = asyncHandler(async (req: Request, res: Response) => {
    const createdBy = req.user!.userId;
    const task = await tasksService.createTask(req.body, createdBy);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    const task = await tasksService.updateTask(taskId, req.body);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  });

  updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    const task = await tasksService.updateTaskStatus(taskId, req.body);

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: task,
    });
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    await tasksService.deleteTask(taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  });
}

export const tasksController = new TasksController();