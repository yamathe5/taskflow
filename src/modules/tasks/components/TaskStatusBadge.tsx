import type { TaskStatus } from '../types/task.types';

type TaskStatusBadgeProps = {
  status: TaskStatus;
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const className = `status-badge status-badge--${status.replace('_', '-')}`;

  return <span className={className}>{status.replace('_', ' ')}</span>;
}