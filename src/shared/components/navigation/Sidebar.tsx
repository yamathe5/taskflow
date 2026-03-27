import { NavLink } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <NavLink to={ROUTES.dashboard} className="sidebar__link">
          Dashboard
        </NavLink>
        <NavLink to={ROUTES.users} className="sidebar__link">
          Users
        </NavLink>
        <NavLink to={ROUTES.projects} className="sidebar__link">
          Projects
        </NavLink>
        <NavLink to={ROUTES.tasks} className="sidebar__link">
          Tasks
        </NavLink>
      </nav>
    </aside>
  );
}