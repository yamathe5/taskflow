import { Link } from 'react-router-dom';

import { ROUTES } from '../shared/constants/routes';

export function NotFoundPage() {
  return (
    <div className="page-card">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to={ROUTES.dashboard}>Go back</Link>
    </div>
  );
}