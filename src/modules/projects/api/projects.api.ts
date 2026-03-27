import { apiClient } from '../../../shared/api/client';
import type { Project, ProjectsResponse } from '../types/project.types';

type CreateProjectPayload = {
  name: string;
  description?: string | null;
};

type SingleProjectResponse = {
  success: boolean;
  message: string;
  data: Project;
};

export async function getProjects(): Promise<ProjectsResponse> {
  const response = await apiClient.get<ProjectsResponse>('/projects');
  return response.data;
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<SingleProjectResponse> {
  const response = await apiClient.post<SingleProjectResponse>('/projects', payload);
  return response.data;
}