import axios from 'axios';
import { useEffect, useState } from 'react';

import { getTasks } from '../api/tasks.api';
import { TaskTable } from '../components/TaskTable';
import type { Task } from '../types/task.types';

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await getTasks();
        setTasks(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data?.message ?? 'Unable to load tasks.');
        } else {
          setErrorMessage('Unexpected error while loading tasks.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadTasks();
  }, []);

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>Tasks</h2>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-card">
        <h2>Tasks</h2>
        <p className="server-error">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-section__header">
        <h2>Tasks</h2>
        <p>Review tasks according to your current role permissions.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="page-card">
          <p>No tasks found.</p>
        </div>
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </div>
  );
}