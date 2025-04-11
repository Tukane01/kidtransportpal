
import React, { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Loader2 } from "lucide-react";
import ParentDashboard from "./parent/ParentDashboard";
import DriverDashboard from "./driver/DriverDashboard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, profile, refreshProfile } = useSupabaseAuth();
  const navigate = useNavigate();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Handle authentication state and profile loading
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && profile) {
        // Silently refresh user profile without showing toasts
        refreshProfile(false).catch(error => {
          console.error("Error refreshing profile:", error);
        });
        setInitialLoadComplete(true);
      } else if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to auth page");
        navigate('/auth');
      }
    }
  }, [isAuthenticated, profile, refreshProfile, isLoading, navigate]);
  
  // Show loading state
  if (isLoading || (!initialLoadComplete && isAuthenticated)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-schoolride-primary mb-2" />
          <span className="text-gray-800 font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }
  
  // Not authenticated - handled by useEffect redirect
  if (!isAuthenticated) {
    return null;
  }
  
  // Determine which dashboard to show based on user role
  if (!profile?.role) {
    toast.error("User profile is incomplete. Please contact support.");
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h2>
          <p className="text-gray-700 mb-4">
            Your user profile is missing critical information. Please contact support for assistance.
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-schoolride-primary text-white rounded hover:bg-schoolride-secondary"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return profile.role === "parent" ? <ParentDashboard /> : <DriverDashboard />;
};

export default Layout;
