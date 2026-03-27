import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../constants/routes';
import { useLocalStorage } from './useLocalStorage';
import type { AuthUser } from '../../modules/auth/types/auth.types';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const AUTH_STORAGE_KEY = 'auth_data';

const initialAuthState: AuthState = {
  token: null,
  user: null,
};

export function useAuth() {
  const navigate = useNavigate();
  const { storedValue, setValue, removeValue } = useLocalStorage<AuthState>(
    AUTH_STORAGE_KEY,
    initialAuthState,
  );

  const isAuthenticated = useMemo(() => {
    return Boolean(storedValue.token);
  }, [storedValue.token]);

  const saveAuth = (token: string, user: AuthUser) => {
    localStorage.setItem('auth_token', token);

    setValue({
      token,
      user,
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    removeValue();
    navigate(ROUTES.login);
  };

  return {
    token: storedValue.token,
    user: storedValue.user,
    isAuthenticated,
    saveAuth,
    logout,
  };
}