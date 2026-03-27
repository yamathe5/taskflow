import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { getProjects } from '../modules/projects/api/projects.api';
import type { Project } from '../modules/projects/types/project.types';
import { getTasks } from '../modules/tasks/api/tasks.api';
import type { Task } from '../modules/tasks/types/task.types';
import { getUsers } from '../modules/users/api/users.api';
import type { User } from '../modules/users/types/user.types';

type UserRole = 'admin' | 'project_manager' | 'developer';

type StoredAuthData = {
  token: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

type DashboardData = {
  users: User[];
  projects: Project[];
  tasks: Task[];
};

function getStoredAuthData(): StoredAuthData | null {
  const rawAuthData = localStorage.getItem('auth_data');

  if (!rawAuthData) {
    return null;
  }

  try {
    return JSON.parse(rawAuthData) as StoredAuthData;
  } catch {
    return null;
  }
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'No due date';
  }

  return new Date(value).toLocaleDateString();
}

export function DashboardPage() {
  const authData = useMemo(() => getStoredAuthData(), []);
  const currentUser = authData?.user ?? null;

  const [data, setData] = useState<DashboardData>({
    users: [],
    projects: [],
    tasks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        if (!currentUser) {
          setErrorMessage('User session not found.');
          return;
        }

        if (currentUser.role === 'admin') {
          const [usersResponse, projectsResponse, tasksResponse] = await Promise.all([
            getUsers(),
            getProjects(),
            getTasks(),
          ]);

          setData({
            users: usersResponse.data,
            projects: projectsResponse.data,
            tasks: tasksResponse.data,
          });

          return;
        }

        const [projectsResponse, tasksResponse] = await Promise.all([
          getProjects(),
          getTasks(),
        ]);

        setData({
          users: [],
          projects: projectsResponse.data,
          tasks: tasksResponse.data,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? 'Unable to load dashboard data.',
          );
        } else {
          setErrorMessage('Unexpected error while loading dashboard data.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [currentUser]);

  const statusStats = useMemo(() => {
    return {
      todo: data.tasks.filter((task) => task.status === 'todo').length,
      inProgress: data.tasks.filter((task) => task.status === 'in_progress').length,
      inReview: data.tasks.filter((task) => task.status === 'in_review').length,
      done: data.tasks.filter((task) => task.status === 'done').length,
    };
  }, [data.tasks]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();

    return [...data.tasks]
      .filter((task) => task.dueDate)
      .filter((task) => new Date(task.dueDate as string) >= now)
      .sort(
        (a, b) =>
          new Date(a.dueDate as string).getTime() -
          new Date(b.dueDate as string).getTime(),
      )
      .slice(0, 5);
  }, [data.tasks]);

  const recentTasks = useMemo(() => {
    return [...data.tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5);
  }, [data.tasks]);

  const projectSummary = useMemo(() => {
    return {
      total: data.projects.length,
      active: data.projects.filter((project) => project.status === 'active').length,
      archived: data.projects.filter((project) => project.status === 'archived').length,
    };
  }, [data.projects]);

  const dashboardIntro = useMemo(() => {
    if (!currentUser) {
      return 'Dashboard overview';
    }

    if (currentUser.role === 'admin') {
      return 'Global system overview.';
    }

    if (currentUser.role === 'project_manager') {
      return 'Overview of your projects and their tasks.';
    }

    return 'Overview of your assigned tasks.';
  }, [currentUser]);

  const primaryCards = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (currentUser.role === 'admin') {
      return [
        { label: 'Active Users', value: data.users.length },
        { label: 'Projects', value: data.projects.length },
        { label: 'Tasks', value: data.tasks.length },
        { label: 'Completed Tasks', value: statusStats.done },
      ];
    }

    if (currentUser.role === 'project_manager') {
      return [
        { label: 'My Projects', value: data.projects.length },
        { label: 'Tasks in My Projects', value: data.tasks.length },
        { label: 'Active Projects', value: projectSummary.active },
        { label: 'Completed Tasks', value: statusStats.done },
      ];
    }

    return [
      { label: 'My Tasks', value: data.tasks.length },
      { label: 'Todo', value: statusStats.todo },
      { label: 'In Progress', value: statusStats.inProgress },
      { label: 'Completed', value: statusStats.done },
    ];
  }, [currentUser, data.projects.length, data.tasks.length, data.users.length, projectSummary.active, statusStats.done, statusStats.inProgress, statusStats.todo]);

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>Dashboard</h2>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-card">
        <h2>Dashboard</h2>
        <p className="server-error">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-section__header">
        <h2>Dashboard</h2>
        <p>
          Welcome back{currentUser ? `, ${currentUser.name}` : ''}. {dashboardIntro}
        </p>
      </div>

      <div className="stats-grid">
        {primaryCards.map((card) => (
          <div key={card.label} className="stat-card">
            <span className="stat-card__label">{card.label}</span>
            <strong className="stat-card__value">{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="page-grid page-grid--two-columns">
        <div className="page-card">
          <h3>Task Status Summary</h3>
          <ul className="dashboard-list">
            <li>
              <span>Todo</span>
              <strong>{statusStats.todo}</strong>
            </li>
            <li>
              <span>In progress</span>
              <strong>{statusStats.inProgress}</strong>
            </li>
            <li>
              <span>In review</span>
              <strong>{statusStats.inReview}</strong>
            </li>
            <li>
              <span>Done</span>
              <strong>{statusStats.done}</strong>
            </li>
          </ul>
        </div>

        <div className="page-card">
          <h3>
            {currentUser?.role === 'developer' ? 'My Project Summary' : 'Project Summary'}
          </h3>
          <ul className="dashboard-list">
            <li>
              <span>Total projects</span>
              <strong>{projectSummary.total}</strong>
            </li>
            <li>
              <span>Active projects</span>
              <strong>{projectSummary.active}</strong>
            </li>
            <li>
              <span>Archived projects</span>
              <strong>{projectSummary.archived}</strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="page-grid page-grid--two-columns">
        <div className="page-card">
          <h3>Upcoming Tasks</h3>

          {upcomingTasks.length === 0 ? (
            <p className="muted-text">No upcoming tasks found.</p>
          ) : (
            <ul className="dashboard-activity-list">
              {upcomingTasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      Due: {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <span className="status-badge status-badge--small">
                    {task.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-card">
          <h3>Recent Activity</h3>

          {recentTasks.length === 0 ? (
            <p className="muted-text">No recent activity found.</p>
          ) : (
            <ul className="dashboard-activity-list">
              {recentTasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      Updated: {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="status-badge status-badge--small">
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}