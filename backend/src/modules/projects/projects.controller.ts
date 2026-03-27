import type { Request, Response } from 'express';

import { successResponse } from '../../shared/utils/api-response';
import { asyncHandler } from '../../shared/utils/async-handler';
import { projectsService } from './projects.service';

class ProjectsController {
  createProject = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.user!.userId;
    const project = await projectsService.createProject(req.body, ownerId);

    res.status(201).json(
      successResponse({
        message: 'Project created successfully',
        data: project,
      }),
    );
  });

  listProjects = asyncHandler(async (req: Request, res: Response) => {
    const projects = await projectsService.listProjects(req.user!);

    res.status(200).json(
      successResponse({
        message: 'Projects retrieved successfully',
        data: projects,
      }),
    );
  });

  getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    const project = await projectsService.getProjectById(projectId, req.user!);

    res.status(200).json(
      successResponse({
        message: 'Project retrieved successfully',
        data: project,
      }),
    );
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    const project = await projectsService.updateProject(projectId, req.body);

    res.status(200).json(
      successResponse({
        message: 'Project updated successfully',
        data: project,
      }),
    );
  });

  archiveProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    const project = await projectsService.archiveProject(projectId);

    res.status(200).json(
      successResponse({
        message: 'Project archived successfully',
        data: project,
      }),
    );
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    await projectsService.deleteProject(projectId);

    res.status(200).json(
      successResponse({
        message: 'Project deleted successfully',
        data: null,
      }),
    );
  });
}

export const projectsController = new ProjectsController();