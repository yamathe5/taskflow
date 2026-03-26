import { Router } from 'express';

import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.routes';
import { authenticate } from '../shared/middleware/auth.middleware';
import { authorize } from '../shared/middleware/role.middleware';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);

router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully',
    data: req.user,
  });
});

router.get('/admin-only', authenticate, authorize('admin'), (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted',
  });
});

export { router };