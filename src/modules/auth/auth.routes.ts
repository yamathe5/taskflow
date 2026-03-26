import { Router } from 'express';

import { validate } from '../../shared/middleware/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);

export { authRouter };