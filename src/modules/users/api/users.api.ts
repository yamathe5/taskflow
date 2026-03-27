import { apiClient } from '../../../shared/api/client';
import type { User, UsersResponse } from '../types/user.types';

type SingleUserResponse = {
  success: boolean;
  message: string;
  data: User;
};

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'project_manager' | 'developer';
  avatarUrl?: string | null;
};

type UpdateUserPayload = {
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'developer';
  avatarUrl?: string | null;
};

type UpdateProfilePayload = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

type DeleteUserResponse = {
  success: boolean;
  message: string;
};

export async function getUsers(): Promise<UsersResponse> {
  const response = await apiClient.get<UsersResponse>('/users');
  return response.data;
}

export async function getAssignableUsers(): Promise<UsersResponse> {
  const response = await apiClient.get<UsersResponse>('/users/assignable');
  return response.data;
}

export async function getMyProfile(): Promise<SingleUserResponse> {
  const response = await apiClient.get<SingleUserResponse>('/users/me');
  return response.data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<SingleUserResponse> {
  const response = await apiClient.patch<SingleUserResponse>('/users/me', payload);
  return response.data;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<SingleUserResponse> {
  const response = await apiClient.post<SingleUserResponse>('/auth/register', payload);
  return response.data;
}

export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<SingleUserResponse> {
  const response = await apiClient.patch<SingleUserResponse>(`/users/${userId}`, payload);
  return response.data;
}

export async function deleteUser(userId: number): Promise<DeleteUserResponse> {
  const response = await apiClient.delete<DeleteUserResponse>(`/users/${userId}`);
  return response.data;
}