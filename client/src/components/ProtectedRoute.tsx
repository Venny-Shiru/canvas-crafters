import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowAuthenticatedAccess?: boolean; // New prop to allow authenticated users on public pages
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo,
  allowAuthenticatedAccess = false
}) => {
  const { state } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !state.isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo || '/login'} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but trying to access auth pages (login/register)
  // Only redirect if this is an auth page (not public pages like contact)
  if (!requireAuth && state.isAuthenticated && !allowAuthenticatedAccess) {
    // Get the intended destination from state, or default to dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;