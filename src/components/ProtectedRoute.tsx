import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { isRouteAllowedForRole } from '@/lib/routes';
import type { UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isRouteAllowedForRole(location.pathname, user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
