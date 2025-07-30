// API utility functions for Canvas Crafters

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    requireAuth = false
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  // Add authorization header if required
  if (requireAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }

  // Add body if provided
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error(`API call failed: ${method} ${url}`, error);
    throw error;
  }
};

// Specific API functions
export const canvasApi = {
  // Get canvases
  getCanvases: (params?: URLSearchParams) => 
    apiCall(`/canvas${params ? `?${params}` : ''}`, { requireAuth: true }),
  
  // Create canvas
  createCanvas: (canvasData: any) => 
    apiCall('/canvas', { 
      method: 'POST', 
      body: canvasData, 
      requireAuth: true 
    }),
  
  // Get canvas by ID
  getCanvas: (id: string) => 
    apiCall(`/canvas/${id}`, { requireAuth: true }),
  
  // Update canvas
  updateCanvas: (id: string, canvasData: any) => 
    apiCall(`/canvas/${id}`, { 
      method: 'PUT', 
      body: canvasData, 
      requireAuth: true 
    }),
  
  // Delete canvas
  deleteCanvas: (id: string) => 
    apiCall(`/canvas/${id}`, { 
      method: 'DELETE', 
      requireAuth: true 
    }),
  
  // Save canvas data
  saveCanvas: (id: string, canvasData: any) => 
    apiCall(`/canvas/${id}/save`, { 
      method: 'POST', 
      body: canvasData, 
      requireAuth: true 
    }),
  
  // Like/unlike canvas
  likeCanvas: (id: string) => 
    apiCall(`/canvas/${id}/like`, { 
      method: 'POST', 
      requireAuth: true 
    })
};

export const userApi = {
  // Get dashboard data
  getDashboard: () => 
    apiCall('/user/dashboard', { requireAuth: true }),
  
  // Get user profile
  getProfile: (username: string) => 
    apiCall(`/users/profile/${username}`, { requireAuth: true }),
  
  // Update profile
  updateProfile: (userData: any) => 
    apiCall('/users/profile', { 
      method: 'PUT', 
      body: userData, 
      requireAuth: true 
    })
};

export const authApi = {
  // Login
  login: (credentials: { identifier: string; password: string }) => 
    apiCall('/auth/login', { 
      method: 'POST', 
      body: credentials 
    }),
  
  // Register
  register: (userData: { username: string; email: string; password: string }) => 
    apiCall('/auth/register', { 
      method: 'POST', 
      body: userData 
    }),
  
  // Get current user
  getMe: () => 
    apiCall('/auth/me', { requireAuth: true }),
  
  // Logout (if needed server-side)
  logout: () => 
    apiCall('/auth/logout', { 
      method: 'POST', 
      requireAuth: true 
    })
};

export default { apiCall, canvasApi, userApi, authApi };
