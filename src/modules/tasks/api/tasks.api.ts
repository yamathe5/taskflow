import { apiClient } from '../../../shared/api/client';
import type { TasksResponse } from '../types/task.types';

export async function getTasks(): Promise<TasksResponse> {
  const response = await apiClient.get<TasksResponse>('/tasks');
  return response.data;
}