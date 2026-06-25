import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthSession, UserRole } from '@/types';
import { getUserByCredentials } from '@/mocks/users';

const STORAGE_KEY = 'student-mgmt-auth';

interface AuthContextValue {
  user: AuthSession['user'] | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession['user'] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession['user'];
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession['user'] | null>(() => readStoredSession());

  const login = useCallback((username: string, password: string) => {
    const matched = getUserByCredentials(username, password);
    if (!matched) return false;

    const { password: _password, ...safeUser } = matched;
    void _password;
    setUser(safeUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      hasRole,
    }),
    [user, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
