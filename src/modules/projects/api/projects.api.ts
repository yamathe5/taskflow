import { apiClient } from '../../../shared/api/client';
import type { Project, ProjectsResponse } from '../types/project.types';

type CreateProjectPayload = {
  name: string;
  description?: string | null;
};

type UpdateProjectPayload = {
  name: string;
  description?: string | null;
  status?: 'active' | 'archived';
};

type SingleProjectResponse = {
  success: boolean;
  message: string;
  data: Project;
};

type ActionResponse = {
  success: boolean;
  message: string;
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

export async function updateProject(
  projectId: number,
  payload: UpdateProjectPayload,
): Promise<SingleProjectResponse> {
  const response = await apiClient.patch<SingleProjectResponse>(
    `/projects/${projectId}`,
    payload,
  );
  return response.data;
}

export async function archiveProject(
  projectId: number,
): Promise<SingleProjectResponse> {
  const response = await apiClient.patch<SingleProjectResponse>(
    `/projects/${projectId}/archive`,
  );
  return response.data;
}

export async function deleteProject(
  projectId: number,
): Promise<ActionResponse> {
  const response = await apiClient.delete<ActionResponse>(`/projects/${projectId}`);
  return response.data;
}