import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h1 className="navbar__title">TaskFlow Pro</h1>
        <p className="navbar__subtitle">
          {user ? `${user.name} • ${user.role}` : 'Frontend'}
        </p>
      </div>

      {user && (
        <button className="button button--secondary" onClick={logout}>
          Logout
        </button>
      )}
    </header>
  );
}