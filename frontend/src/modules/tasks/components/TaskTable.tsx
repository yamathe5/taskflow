import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task, TaskStatus } from '../types/task.types';
import type { User } from '../../users/types/user.types';

type TaskTableProps = {
  tasks: Task[];
  users: User[];
  canManageTasks: boolean;
  canDeleteTasks: boolean;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  onEdit: (task: Task) => void;
  onChangeStatus: (taskId: number, nextStatus: TaskStatus) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
};

function getAssignedLabel(assignedTo: number | null, users: User[]): string {
  if (assignedTo === null) {
    return 'Unassigned';
  }

  const user = users.find((item) => item.id === assignedTo);

  if (!user) {
    return `User #${assignedTo}`;
  }

  return `${user.role} - ${user.name}`;
}

export function TaskTable({
  tasks,
  users,
  canManageTasks,
  canDeleteTasks,
  isUpdatingStatus,
  isDeleting,
  onEdit,
  onChangeStatus,
  onDelete,
}: TaskTableProps) {
  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Project</th>
            <th>Assigned To</th>
            <th>Due Date</th>
            {(canManageTasks || canDeleteTasks) && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>
                <div className="status-cell">
                  <TaskStatusBadge status={task.status} />

                  {canManageTasks ? (
                    <select
                      className="status-select"
                      value={task.status}
                      disabled={isUpdatingStatus}
                      onChange={(event) =>
                        void onChangeStatus(task.id, event.target.value as TaskStatus)
                      }
                    >
                      <option value="todo">todo</option>
                      <option value="in_progress">in progress</option>
                      <option value="in_review">in review</option>
                      <option value="done">done</option>
                    </select>
                  ) : null}
                </div>
              </td>
              <td>{task.priority}</td>
              <td>{task.projectId}</td>
              <td>{getAssignedLabel(task.assignedTo, users)}</td>
              <td>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
              </td>

              {(canManageTasks || canDeleteTasks) && (
                <td className="table-actions">
                  {canManageTasks && (
                    <button
                      className="button button--small button--secondary"
                      type="button"
                      onClick={() => onEdit(task)}
                    >
                      Edit
                    </button>
                  )}

                  {canDeleteTasks && (
                    <button
                      className="button button--small button--danger"
                      type="button"
                      disabled={isDeleting}
                      onClick={() => void onDelete(task.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}