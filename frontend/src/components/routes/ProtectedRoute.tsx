import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Prevents authenticated users from accessing public pages like login/register
 * Automatically logs out users who navigate back to login page (clears session)
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // If user is already logged in and tries to access login page,
    // automatically clear their session (logout)
    if (isAuthenticated()) {
      console.log('User navigated to login while logged in - clearing session');
      logout();
    }
  }, [isAuthenticated, logout]);

  // Always show the login page (session will be cleared if user was logged in)
  return <>{children}</>;
};
