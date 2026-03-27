import { AppError } from '../../shared/errors/app-error';
import type { CreateProjectInput, UpdateProjectInput } from './projects.schema';
import { ProjectsRepository, type ProjectRow } from './projects.repository';

type ProjectRole = 'admin' | 'project_manager' | 'developer';

export type PublicProject = {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'archived';
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
};

export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async createProject(input: CreateProjectInput, ownerId: number): Promise<PublicProject> {
    const project = await this.projectsRepository.createProject({
      name: input.name.trim(),
      description: input.description ?? null,
      ownerId,
    });

    return this.toPublicProject(project);
  }

  async listProjects(currentUser: {
    userId: number;
    role: ProjectRole;
  }): Promise<PublicProject[]> {
    let projects: ProjectRow[] = [];

    if (currentUser.role === 'admin') {
      projects = await this.projectsRepository.findAll();
    } else if (currentUser.role === 'project_manager') {
      projects = await this.projectsRepository.findByOwnerId(currentUser.userId);
    } else {
      projects = await this.projectsRepository.findAssignedToDeveloper(currentUser.userId);
    }

    return projects.map((project) => this.toPublicProject(project));
  }

  async getProjectById(
    id: number,
    currentUser: {
      userId: number;
      role: ProjectRole;
    },
  ): Promise<PublicProject> {
    const project = await this.projectsRepository.findById(id);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (currentUser.role === 'admin') {
      return this.toPublicProject(project);
    }

    if (currentUser.role === 'project_manager') {
      if (Number(project.ownerId) !== currentUser.userId) {
        throw new AppError('You do not have permission to access this project', 403);
      }

      return this.toPublicProject(project);
    }

    const hasAssignedTask = await this.projectsRepository.existsDeveloperAssignment(
      id,
      currentUser.userId,
    );

    if (!hasAssignedTask) {
      throw new AppError('You do not have permission to access this project', 403);
    }

    return this.toPublicProject(project);
  }

  async updateProject(id: number, input: UpdateProjectInput): Promise<PublicProject> {
    const existingProject = await this.projectsRepository.findById(id);

    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    const updatedProject = await this.projectsRepository.updateProject({
      id,
      name: input.name?.trim() ?? existingProject.name,
      description:
        input.description !== undefined ? input.description : existingProject.description,
      status: input.status ?? existingProject.status,
    });

    return this.toPublicProject(updatedProject);
  }

  async archiveProject(id: number): Promise<PublicProject> {
    const existingProject = await this.projectsRepository.findById(id);

    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    if (existingProject.status === 'archived') {
      throw new AppError('Project is already archived', 400);
    }

    const archivedProject = await this.projectsRepository.archiveProject(id);

    if (!archivedProject) {
      throw new AppError('Project could not be archived', 400);
    }

    return this.toPublicProject(archivedProject);
  }

  async deleteProject(id: number): Promise<void> {
    const project = await this.projectsRepository.findById(id);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const deleted = await this.projectsRepository.deleteProject(id);

    if (!deleted) {
      throw new AppError('Project could not be deleted', 400);
    }
  }

  private toPublicProject(project: ProjectRow): PublicProject {
    return {
      id: Number(project.id),
      name: project.name,
      description: project.description,
      status: project.status,
      ownerId: Number(project.ownerId),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

const projectsRepository = new ProjectsRepository();
export const projectsService = new ProjectsService(projectsRepository);