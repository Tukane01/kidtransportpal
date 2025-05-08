
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'parent' | 'driver' | null;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  requiredRole = null
}) => {
  const { isAuthenticated, isLoading, profile } = useSupabaseAuth();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Mark initial check as done after auth state is loaded
    if (!isLoading) {
      setInitialCheckDone(true);
    }
  }, [isLoading]);

  // Show loading state while checking authentication
  if (isLoading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-schoolride-primary" />
          <span className="text-gray-800 mt-2">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // For routes that require authentication
  if (requireAuth) {
    // Not authenticated - redirect to auth page
    if (!isAuthenticated) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Check if role check is required and user has required role
    if (requiredRole && profile?.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-4">Access Denied</h2>
            <p className="text-gray-700 mb-4">
              You don't have permission to access this page. This area is only 
              available to {requiredRole === 'parent' ? 'parents' : 'drivers'}.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-schoolride-primary text-white rounded hover:bg-schoolride-secondary"
            >
              Go back
            </button>
          </div>
        </div>
      );
    }
    
    // User has required role (or no role check needed)
    return <>{children}</>;
  }
  
  // For routes that require users to be anonymous (like auth pages)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Anonymous user accessing a public route
  return <>{children}</>;
};

export default AuthGuard;
