import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <p>Sign in to access TaskFlow Pro.</p>

        <LoginForm />
      </div>
    </div>
  );
}