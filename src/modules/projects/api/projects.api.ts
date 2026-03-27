import { apiClient } from '../../../shared/api/client';
import type { ProjectsResponse } from '../types/project.types';

export async function getProjects(): Promise<ProjectsResponse> {
  const response = await apiClient.get<ProjectsResponse>('/projects');
  return response.data;
}