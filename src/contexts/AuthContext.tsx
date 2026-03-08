import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchMe, type Permissions } from '../api/auth';

const TOKEN_KEY = 'girin_auth_token';

interface AuthState {
  token: string | null;
  role: string | null;
  permissions: Permissions;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  setAuth: (token: string, role: string, permissions: Permissions) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultPermissions: Permissions = { canView: false, canEdit: false, canDelete: false };

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem(TOKEN_KEY),
    role: null,
    permissions: defaultPermissions,
    loading: !!localStorage.getItem(TOKEN_KEY),
  });

  // 토큰이 있으면 /auth/me로 검증
  useEffect(() => {
    if (!state.token) return;
    fetchMe(state.token)
      .then((data) => {
        setState((s) => ({
          ...s,
          role: data.role,
          permissions: data.permissions,
          loading: false,
        }));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ token: null, role: null, permissions: defaultPermissions, loading: false });
      });
  }, [state.token]);

  const setAuth = useCallback((token: string, role: string, permissions: Permissions) => {
    localStorage.setItem(TOKEN_KEY, token);
    setState({ token, role, permissions, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ token: null, role: null, permissions: defaultPermissions, loading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setAuth,
        logout,
        isAuthenticated: !!state.token && !state.loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
