import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task } from '../types/task.types';

type TaskTableProps = {
  tasks: Task[];
};

export function TaskTable({ tasks }: TaskTableProps) {
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
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>
                <TaskStatusBadge status={task.status} />
              </td>
              <td>{task.priority}</td>
              <td>{task.projectId}</td>
              <td>{task.assignedTo ?? 'Unassigned'}</td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}