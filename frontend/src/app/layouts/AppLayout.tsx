import { Outlet } from 'react-router-dom';

import { Navbar } from '../../shared/components/navigation/Navbar';
import { Sidebar } from '../../shared/components/navigation/Sidebar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-shell__body">
        <Sidebar />

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}