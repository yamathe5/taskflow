import { apiClient } from '../../../shared/api/client';
import type { Task, TasksResponse, TaskStatus } from '../types/task.types';

type SingleTaskResponse = {
  success: boolean;
  message: string;
  data: Task;
};

type CreateTaskPayload = {
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: number;
  assignedTo?: number | null;
  dueDate?: string | null;
};

type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: number | null;
  dueDate?: string | null;
};

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function getTasks(): Promise<TasksResponse> {
  const response = await apiClient.get<TasksResponse>('/tasks');
  return response.data;
}

export async function createTask(
  payload: CreateTaskPayload,
): Promise<SingleTaskResponse> {
  const response = await apiClient.post<SingleTaskResponse>('/tasks', payload);
  return response.data;
}

export async function updateTask(
  taskId: number,
  payload: UpdateTaskPayload,
): Promise<SingleTaskResponse> {
  const response = await apiClient.patch<SingleTaskResponse>(`/tasks/${taskId}`, payload);
  return response.data;
}

export async function updateTaskStatus(
  taskId: number,
  status: TaskStatus,
): Promise<SingleTaskResponse> {
  const response = await apiClient.patch<SingleTaskResponse>(
    `/tasks/${taskId}/status`,
    { status },
  );

  return response.data;
}

export async function deleteTask(taskId: number): Promise<ActionResponse> {
  const response = await apiClient.delete<ActionResponse>(`/tasks/${taskId}`);
  return response.data;
}