/**
 * API Utility Functions
 * Provides helpers for making authenticated API requests
 */

// Backend URLs from environment variables
const LOCAL_BACKEND = import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:5000/api';
const LIVE_BACKEND = import.meta.env.VITE_LIVE_BACKEND_URL || 'http://49.13.223.175:5000/api';

// Get backend mode from environment variable
// Set VITE_BACKEND_MODE to 'local' or 'live' in .env file
const backendMode = import.meta.env.VITE_BACKEND_MODE || 'local';

// Select API URL based on mode
const API_BASE_URL = backendMode === 'live' ? LIVE_BACKEND : LOCAL_BACKEND;

// Log current backend mode for debugging
console.log(`🔗 API Mode: ${backendMode.toUpperCase()} → ${API_BASE_URL}`);

/**
 * Get authorization headers with JWT token
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Handle API response and throw errors if needed
 */
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

/**
 * Contest API
 */
export const contestAPI = {
  // Get all contests
  getAll: async (status?: string) => {
    const url = status ? `${API_BASE_URL}/contests?status=${status}` : `${API_BASE_URL}/contests`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get single contest
  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/contests/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create contest
  create: async (contestData: any) => {
    const response = await fetch(`${API_BASE_URL}/contests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contestData),
    });
    return handleResponse(response);
  },

  // Update contest
  update: async (id: number, contestData: any) => {
    const response = await fetch(`${API_BASE_URL}/contests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(contestData),
    });
    return handleResponse(response);
  },

  // Delete contest
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/contests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Add participants
  addParticipants: async (id: number, userIds: number[]) => {
    const response = await fetch(`${API_BASE_URL}/contests/${id}/participants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIds }),
    });
    return handleResponse(response);
  },

  // Remove participant
  removeParticipant: async (contestId: number, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/participants/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Start contest
  start: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/contests/${id}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get my contests (for players)
  getMyContests: async () => {
    const response = await fetch(`${API_BASE_URL}/contests/my-contests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

/**
 * User API
 */
export const userAPI = {
  // Get all users
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create user
  create: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Update user
  update: async (id: number, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Delete user
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Toggle user status
  toggleStatus: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
