import { useAuth } from '@/app/providers/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
