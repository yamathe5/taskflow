import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { usersController } from './users.controller';
import { updateUserSchema, userIdParamSchema } from './users.schema';

const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.use(authorize('admin'));

usersRouter.get('/', usersController.listUsers);
usersRouter.get('/:id', validate(userIdParamSchema), usersController.getUserById);
usersRouter.patch('/:id', validate(updateUserSchema), usersController.updateUser);
usersRouter.delete('/:id', validate(userIdParamSchema), usersController.softDeleteUser);

export { usersRouter };