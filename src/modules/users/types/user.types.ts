export type UserRole = 'admin' | 'project_manager' | 'developer';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UsersResponse = {
  success: boolean;
  message: string;
  data: User[];
};