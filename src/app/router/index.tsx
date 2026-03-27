import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { ProjectsPage } from '../../modules/projects/pages/ProjectsPage';
import { TasksPage } from '../../modules/tasks/pages/TasksPage';
import { UsersPage } from '../../modules/users/pages/UsersPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { ROUTES } from '../../shared/constants/routes';

type Role = 'admin' | 'project_manager' | 'developer';

function ProtectedRoute() {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}

function RoleProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const authData = localStorage.getItem('auth_data');

  if (!authData) {
    return <Navigate to={ROUTES.login} replace />;
  }

  try {
    const parsedAuthData = JSON.parse(authData) as {
      token: string | null;
      user: { role: Role } | null;
    };

    const userRole = parsedAuthData.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to={ROUTES.dashboard} replace />;
    }

    return <Outlet />;
  } catch {
    return <Navigate to={ROUTES.login} replace />;
  }
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
            element: <RoleProtectedRoute allowedRoles={['admin']} />,
            children: [
              {
                path: ROUTES.users.slice(1),
                element: <UsersPage />,
              },
            ],
          },
          {
            element: (
              <RoleProtectedRoute
                allowedRoles={['admin', 'project_manager', 'developer']}
              />
            ),
            children: [
              {
                path: ROUTES.projects.slice(1),
                element: <ProjectsPage />,
              },
            ],
          },
          {
            element: (
              <RoleProtectedRoute
                allowedRoles={['admin', 'project_manager', 'developer']}
              />
            ),
            children: [
              {
                path: ROUTES.tasks.slice(1),
                element: <TasksPage />,
              },
            ],
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