import { NavLink } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <NavLink to={ROUTES.dashboard} className="sidebar__link">
          Dashboard
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink to={ROUTES.users} className="sidebar__link">
            Users
          </NavLink>
        )}

        {(user?.role === 'admin' ||
          user?.role === 'project_manager' ||
          user?.role === 'developer') && (
          <NavLink to={ROUTES.projects} className="sidebar__link">
            Projects
          </NavLink>
        )}

        {(user?.role === 'admin' ||
          user?.role === 'project_manager' ||
          user?.role === 'developer') && (
          <NavLink to={ROUTES.tasks} className="sidebar__link">
            Tasks
          </NavLink>
        )}
      </nav>
    </aside>
  );
}