import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { tasksController } from './tasks.controller';
import {
  createTaskSchema,
  taskIdParamSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from './tasks.schema';

const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get('/', authorize('admin', 'project_manager', 'developer'), tasksController.listTasks);
tasksRouter.get(
  '/:id',
  authorize('admin', 'project_manager', 'developer'),
  validate(taskIdParamSchema),
  tasksController.getTaskById,
);
tasksRouter.post(
  '/',
  authorize('admin', 'project_manager', 'developer'),
  validate(createTaskSchema),
  tasksController.createTask,
);
tasksRouter.patch(
  '/:id',
  authorize('admin', 'project_manager', 'developer'),
  validate(updateTaskSchema),
  tasksController.updateTask,
);
tasksRouter.patch(
  '/:id/status',
  authorize('admin', 'project_manager', 'developer'),
  validate(updateTaskStatusSchema),
  tasksController.updateTaskStatus,
);
tasksRouter.delete(
  '/:id',
  authorize('admin', 'project_manager'),
  validate(taskIdParamSchema),
  tasksController.deleteTask,
);

export { tasksRouter };