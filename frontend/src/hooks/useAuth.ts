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

  // User object for components that need user info
  const user = {
    name: sessionStorage.getItem('username'),
    email: sessionStorage.getItem('email')
  };

  return {
    isAuthenticated,
    getUserRole,
    getToken,
    getUsername,
    logout,
    user
  };
};
