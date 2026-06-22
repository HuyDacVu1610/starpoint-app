import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './routeConfig';

interface RoleRouteProps {
  allowedRoles: string[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const hasAllowedRole = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    // Redirect based on roles
    if (user.roles.includes('STUDENT')) {
      return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
    } else if (user.roles.includes('ADMIN') || user.roles.includes('STAFF')) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
export default RoleRoute;
