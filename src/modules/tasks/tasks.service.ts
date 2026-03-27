import { AppError } from '../../shared/errors/app-error';
import { ProjectsRepository } from '../projects/projects.repository';
import { UsersRepository } from '../users/users.repository';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from './tasks.schema';
import { TasksRepository, type TaskRow } from './tasks.repository';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type UserRole = 'admin' | 'project_manager' | 'developer';

type CurrentUser = {
  userId: number;
  role: UserRole;
};

export type PublicTask = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assignedTo: number | null;
  createdBy: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const allowedStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['in_review'],
  in_review: ['done'],
  done: [],
};

export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async listTasks(currentUser: CurrentUser): Promise<PublicTask[]> {
    let tasks: TaskRow[] = [];

    if (currentUser.role === 'admin') {
      tasks = await this.tasksRepository.findAll();
    } else if (currentUser.role === 'project_manager') {
      tasks = await this.tasksRepository.findByProjectOwnerId(currentUser.userId);
    } else {
      tasks = await this.tasksRepository.findByAssignedTo(currentUser.userId);
    }

    return tasks.map((task) => this.toPublicTask(task));
  }

  async getTaskById(id: number, currentUser: CurrentUser): Promise<PublicTask> {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    await this.assertTaskAccess(task, currentUser);

    return this.toPublicTask(task);
  }

  async createTask(input: CreateTaskInput, currentUser: CurrentUser): Promise<PublicTask> {
    const project = await this.projectsRepository.findById(input.projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (currentUser.role === 'project_manager' && Number(project.ownerId) !== currentUser.userId) {
      throw new AppError('You do not have permission to create tasks in this project', 403);
    }

    if (currentUser.role === 'developer') {
      if (!input.assignedTo || input.assignedTo !== currentUser.userId) {
        throw new AppError('Developers can only create tasks assigned to themselves', 403);
      }
    }

    if (input.assignedTo !== undefined && input.assignedTo !== null) {
      const assignedUser = await this.usersRepository.findActiveById(input.assignedTo);

      if (!assignedUser) {
        throw new AppError('Assigned user not found', 404);
      }
    }

    const task = await this.tasksRepository.createTask({
      title: input.title.trim(),
      description: input.description ?? null,
      priority: input.priority ?? 'medium',
      projectId: input.projectId,
      assignedTo: input.assignedTo ?? null,
      createdBy: currentUser.userId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });

    return this.toPublicTask(task);
  }

  async updateTask(
    id: number,
    input: UpdateTaskInput,
    currentUser: CurrentUser,
  ): Promise<PublicTask> {
    const existingTask = await this.tasksRepository.findById(id);

    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }

    await this.assertTaskEditAccess(existingTask, currentUser);

    if (input.assignedTo !== undefined && input.assignedTo !== null) {
      const assignedUser = await this.usersRepository.findActiveById(input.assignedTo);

      if (!assignedUser) {
        throw new AppError('Assigned user not found', 404);
      }
    }

    if (
      currentUser.role === 'developer' &&
      input.assignedTo !== undefined &&
      input.assignedTo !== currentUser.userId
    ) {
      throw new AppError('Developers can only keep tasks assigned to themselves', 403);
    }

    const updatedTask = await this.tasksRepository.updateTask({
      id,
      title: input.title?.trim() ?? existingTask.title,
      description: input.description !== undefined ? input.description : existingTask.description,
      priority: input.priority ?? existingTask.priority,
      assignedTo:
        input.assignedTo !== undefined
          ? input.assignedTo
          : existingTask.assignedTo !== null
            ? Number(existingTask.assignedTo)
            : null,
      dueDate:
        input.dueDate !== undefined
          ? input.dueDate
            ? new Date(input.dueDate)
            : null
          : existingTask.dueDate,
    });

    return this.toPublicTask(updatedTask);
  }

  async updateTaskStatus(
    id: number,
    input: UpdateTaskStatusInput,
    currentUser: CurrentUser,
  ): Promise<PublicTask> {
    const existingTask = await this.tasksRepository.findById(id);

    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }

    await this.assertTaskStatusAccess(existingTask, currentUser);

    if (existingTask.status === input.status) {
      throw new AppError('Task already has this status', 400);
    }

    const allowedNextStatuses = allowedStatusTransitions[existingTask.status];

    if (!allowedNextStatuses.includes(input.status)) {
      throw new AppError(
        `Invalid status transition from ${existingTask.status} to ${input.status}`,
        400,
      );
    }

    const updatedTask = await this.tasksRepository.updateTaskStatus(id, input.status);

    if (!updatedTask) {
      throw new AppError('Task status could not be updated', 400);
    }

    return this.toPublicTask(updatedTask);
  }

  async deleteTask(id: number, currentUser: CurrentUser): Promise<void> {
    const existingTask = await this.tasksRepository.findById(id);

    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }

    if (currentUser.role === 'developer') {
      throw new AppError('You do not have permission to delete tasks', 403);
    }

    if (currentUser.role === 'project_manager') {
      const project = await this.projectsRepository.findById(Number(existingTask.projectId));

      if (!project || Number(project.ownerId) !== currentUser.userId) {
        throw new AppError('You do not have permission to delete this task', 403);
      }
    }

    const deleted = await this.tasksRepository.deleteTask(id);

    if (!deleted) {
      throw new AppError('Task could not be deleted', 400);
    }
  }

  private async assertTaskAccess(task: TaskRow, currentUser: CurrentUser): Promise<void> {
    if (currentUser.role === 'admin') {
      return;
    }

    if (currentUser.role === 'developer') {
      if (task.assignedTo === null || Number(task.assignedTo) !== currentUser.userId) {
        throw new AppError('You do not have permission to access this task', 403);
      }
      return;
    }

    const project = await this.projectsRepository.findById(Number(task.projectId));

    if (!project || Number(project.ownerId) !== currentUser.userId) {
      throw new AppError('You do not have permission to access this task', 403);
    }
  }

  private async assertTaskEditAccess(task: TaskRow, currentUser: CurrentUser): Promise<void> {
    if (currentUser.role === 'admin') {
      return;
    }

    if (currentUser.role === 'developer') {
      if (task.assignedTo === null || Number(task.assignedTo) !== currentUser.userId) {
        throw new AppError('You do not have permission to edit this task', 403);
      }
      return;
    }

    const project = await this.projectsRepository.findById(Number(task.projectId));

    if (!project || Number(project.ownerId) !== currentUser.userId) {
      throw new AppError('You do not have permission to edit this task', 403);
    }
  }

  private async assertTaskStatusAccess(task: TaskRow, currentUser: CurrentUser): Promise<void> {
    if (currentUser.role === 'admin') {
      return;
    }

    if (currentUser.role === 'developer') {
      if (task.assignedTo === null || Number(task.assignedTo) !== currentUser.userId) {
        throw new AppError('You do not have permission to change this task status', 403);
      }
      return;
    }

    const project = await this.projectsRepository.findById(Number(task.projectId));

    if (!project || Number(project.ownerId) !== currentUser.userId) {
      throw new AppError('You do not have permission to change this task status', 403);
    }
  }

  private toPublicTask(task: TaskRow): PublicTask {
    return {
      id: Number(task.id),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: Number(task.projectId),
      assignedTo: task.assignedTo !== null ? Number(task.assignedTo) : null,
      createdBy: Number(task.createdBy),
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

const tasksRepository = new TasksRepository();
const projectsRepository = new ProjectsRepository();
const usersRepository = new UsersRepository();

export const tasksService = new TasksService(
  tasksRepository,
  projectsRepository,
  usersRepository,
);