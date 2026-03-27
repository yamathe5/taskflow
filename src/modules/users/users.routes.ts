import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { usersController } from './users.controller';
import { updateUserSchema, userIdParamSchema } from './users.schema';

const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get(
  '/assignable',
  authorize('admin', 'project_manager'),
  usersController.listAssignableUsers,
);

usersRouter.get('/', authorize('admin'), usersController.listUsers);
usersRouter.get('/:id', authorize('admin'), validate(userIdParamSchema), usersController.getUserById);
usersRouter.patch('/:id', authorize('admin'), validate(updateUserSchema), usersController.updateUser);
usersRouter.delete('/:id', authorize('admin'), validate(userIdParamSchema), usersController.softDeleteUser);

export { usersRouter };