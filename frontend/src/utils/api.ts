/**
 * API Utility Functions
 * Provides helpers for making authenticated API requests
 */

// Backend mode from environment variable
const backendMode = import.meta.env.VITE_BACKEND_MODE || 'local';

// Use relative URL for API calls (Vite proxy will handle routing)
// Vite proxy automatically routes /api/* to the correct backend based on mode
const API_BASE_URL = '/api';

// Get actual backend URL for logging
const LOCAL_BACKEND = import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:5000/api';
const LIVE_BACKEND = import.meta.env.VITE_LIVE_BACKEND_URL || 'http://49.13.223.175:5000/api';
const actualBackend = backendMode === 'live' ? LIVE_BACKEND : LOCAL_BACKEND;

// Log current backend mode for debugging
console.log(`🔗 API Mode: ${backendMode.toUpperCase()} → ${actualBackend}`);
console.log(`📡 Requests go to: ${API_BASE_URL} (proxied by Vite)`);

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
  start: async (id: number, password?: string) => {
    const response = await fetch(`${API_BASE_URL}/contests/${id}/start`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders() as Record<string, string>,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
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

  getContestHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile/contests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getContestDetails: async (contestId: number) => {
    const response = await fetch(`${API_BASE_URL}/users/profile/contests/${contestId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

/**
 * Submission/Code Execution API
 */
export const submissionAPI = {
  /**
   * Run code against test cases (no save to database)
   * This tests your code against the task's test cases
   */
  run: async (params: {
    taskId: number;
    code: string;
    language: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/submissions/run`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  /**
   * Submit code solution (saves to database)
   * This is the final submission that gets scored
   */
  submit: async (params: {
    taskId: number;
    contestId: number;
    code: string;
    language: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/submissions/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  /**
   * Get submission history for a specific task
   */
  getTaskSubmissions: async (taskId: number) => {
    const response = await fetch(`${API_BASE_URL}/submissions/task/${taskId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Health check for Judge0 service
   */
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/submissions/health`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

/**
 * Upload API
 */
export const uploadAPI = {
  // Upload an image
  uploadImage: async (file: File) => {
    const token = sessionStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, browser sets it with boundary
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return handleResponse(response);
  },
};

/**
 * AI Assistance API
 */
export const aiAPI = {
  // Get a hint
  getHint: async (taskId: number, userCode: string, language: string, errorLogs?: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/hint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskId, userCode, language, errorLogs }),
    });
    return handleResponse(response);
  },

  // Get full solution
  getSolution: async (taskId: number) => {
    const response = await fetch(`${API_BASE_URL}/ai/solution`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskId }),
    });
    return handleResponse(response);
  },

  // Evaluate code
  evaluate: async (taskId: number, userCode: string, language: string, testResults: any[]) => {
    const response = await fetch(`${API_BASE_URL}/ai/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ taskId, userCode, language, testResults }),
    });
    return handleResponse(response);
  },

  // Generate boilerplate and wrapper code
  generateCode: async (params: { description: string, functionName: string, languages: string[], inputFormat?: string, outputFormat?: string }) => {
    const response = await fetch(`${API_BASE_URL}/ai/generate-code`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },
};




export const adminAPI = {
  getParticipantSubmissions: async (userId: number, contestId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/participants/${userId}/contest/${contestId}/submissions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateSubmissionScore: async (submissionId: number, score: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/submissions/${submissionId}/score`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders() as Record<string, string>,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score }),
    });
    return handleResponse(response);
  },

  getAiUsageStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/ai/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAiUsageLogs: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/admin/ai/logs?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getParticipantProfile: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/participants/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};
