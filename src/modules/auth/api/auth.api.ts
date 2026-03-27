import { apiClient } from '../../../shared/api/client';
import type { AuthResponse, LoginRequest } from '../types/auth.types';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}