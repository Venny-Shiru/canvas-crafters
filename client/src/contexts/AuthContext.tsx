import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  canvases: string[];
  collaborations: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API base URL
  // Dynamic API URL - use relative URLs on same domain, environment variable otherwise
  const API_BASE_URL = (() => {
    // If running on the same domain as the API (Vercel full-stack)
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return `${window.location.origin}/api`;
    }
    // Otherwise use environment variable or localhost fallback
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  })();

  // Create API headers
  const getHeaders = useCallback((includeAuth = false, token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authToken = token || state.token;
    if (includeAuth && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return headers;
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'No token found' });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getHeaders(true, token),
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: data.user, token },
          });
        } else {
          throw new Error('Token validation failed');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication expired' });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    dispatch({ type: 'AUTH_START' });

    try {
      console.log('🔐 Frontend login attempt:', { 
        identifier, 
        API_BASE_URL, 
        userAgent: navigator.userAgent,
        isMobile: /Mobi|Android/i.test(navigator.userAgent)
      });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ identifier, password }),
      });

      console.log('🌐 Login response status:', response.status);
      console.log('📱 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📦 Login response data:', data);

      if (response.ok) {
        console.log('✅ Login successful, storing token');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user, token: data.token },
        });
      } else {
        console.log('❌ Login failed:', data.message);
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      console.error('🔍 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      let message = 'Login failed';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message = 'Network error - please check your internet connection';
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, [API_BASE_URL, getHeaders]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user, token: data.token },
        });
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, [API_BASE_URL, getHeaders]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_USER', payload: data.user });
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }, [API_BASE_URL, getHeaders]);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(true, token),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'UPDATE_USER', payload: data.user });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [API_BASE_URL, getHeaders]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};