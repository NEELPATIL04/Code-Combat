import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * PrivateRoute - Protects routes that require authentication
 * Redirects unauthenticated users to login page
 * Optionally restricts access based on user roles
 */
export const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, getUserRole } = useAuth();

  if (!isAuthenticated()) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = getUserRole();

    // Check if user's role is in the allowed roles list
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role, redirect to appropriate page
      if (userRole === 'player') {
        return <Navigate to="/task" replace />;
      } else if (userRole === 'admin' || userRole === 'super_admin') {
        return <Navigate to="/admin" replace />;
      }

      // Default redirect
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
};
