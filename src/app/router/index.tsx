import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { ProjectsPage } from '../../modules/projects/pages/ProjectsPage';
import { TasksPage } from '../../modules/tasks/pages/TasksPage';
import { UsersPage } from '../../modules/users/pages/UsersPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { ROUTES } from '../../shared/constants/routes';

function ProtectedRoute() {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}

function DashboardPage() {
  return (
    <div className="page-card">
      <h2>Dashboard</h2>
      <p>Welcome to TaskFlow Pro.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.dashboard,
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.users.slice(1),
            element: <UsersPage />,
          },
          {
            path: ROUTES.projects.slice(1),
            element: <ProjectsPage />,
          },
          {
            path: ROUTES.tasks.slice(1),
            element: <TasksPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);