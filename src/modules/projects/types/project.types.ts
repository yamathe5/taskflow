export type ProjectStatus = 'active' | 'archived';

export type Project = {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectsResponse = {
  success: boolean;
  message: string;
  data: Project[];
};