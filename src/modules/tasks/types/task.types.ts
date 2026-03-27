export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assignedTo: number | null;
  createdBy: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TasksResponse = {
  success: boolean;
  message: string;
  data: Task[];
};