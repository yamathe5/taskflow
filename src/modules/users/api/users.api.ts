import { apiClient } from '../../../shared/api/client';
import type { UsersResponse } from '../types/user.types';

export async function getUsers(): Promise<UsersResponse> {
  const response = await apiClient.get<UsersResponse>('/users');
  return response.data;
}

export async function getAssignableUsers(): Promise<UsersResponse> {
  const response = await apiClient.get<UsersResponse>('/users/assignable');
  return response.data;
}