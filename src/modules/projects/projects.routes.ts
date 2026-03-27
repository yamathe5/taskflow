import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { projectsController } from './projects.controller';
import {
  archiveProjectSchema,
  createProjectSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from './projects.schema';

const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get('/', authorize('admin', 'project_manager'), projectsController.listProjects);
projectsRouter.get(
  '/:id',
  authorize('admin', 'project_manager'),
  validate(projectIdParamSchema),
  projectsController.getProjectById,
);
projectsRouter.post(
  '/',
  authorize('admin', 'project_manager'),
  validate(createProjectSchema),
  projectsController.createProject,
);
projectsRouter.patch(
  '/:id',
  authorize('admin', 'project_manager'),
  validate(updateProjectSchema),
  projectsController.updateProject,
);
projectsRouter.patch(
  '/:id/archive',
  authorize('admin', 'project_manager'),
  validate(archiveProjectSchema),
  projectsController.archiveProject,
);
projectsRouter.delete(
  '/:id',
  authorize('admin'),
  validate(projectIdParamSchema),
  projectsController.deleteProject,
);

export { projectsRouter };