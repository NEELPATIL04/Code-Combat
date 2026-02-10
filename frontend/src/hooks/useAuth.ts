import { useMemo } from 'react';

export const useAuth = () => {
  const isAuthenticated = () => {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');

    return !!(token && username && role);
  };

  const getUserRole = (): string | null => {
    return sessionStorage.getItem('role');
  };

  const getToken = (): string | null => {
    return sessionStorage.getItem('token');
  };

  const getUsername = (): string | null => {
    return sessionStorage.getItem('username');
  };

  const logout = () => {
    sessionStorage.clear();
  };

  // Read values once
  const userId = sessionStorage.getItem('userId');
  const userName = sessionStorage.getItem('username');
  const userEmail = sessionStorage.getItem('email');

  // Memoize so the same object reference is returned when values haven't changed
  // This prevents useEffect deps from firing on every render
  const user = useMemo(() => ({
    id: userId,
    name: userName,
    email: userEmail
  }), [userId, userName, userEmail]);

  return {
    isAuthenticated,
    getUserRole,
    getToken,
    getUsername,
    logout,
    user
  };
};
