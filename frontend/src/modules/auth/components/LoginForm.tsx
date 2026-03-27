import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { login } from '../api/auth.api';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { ROUTES } from '../../../shared/constants/routes';
import { useAuth } from '../../../shared/hooks/useAuth';

export function LoginForm() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('');

    try {
      const response = await login(values);

      saveAuth(response.data.token, response.data.user);
      navigate(ROUTES.dashboard);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? 'Unable to login. Please try again.',
        );
        return;
      }

      setServerError('Unexpected error. Please try again.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && (
          <span className="form-error">{errors.password.message}</span>
        )}
      </div>

      {serverError && <div className="server-error">{serverError}</div>}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Login'}
      </button>
    </form>
  );
}