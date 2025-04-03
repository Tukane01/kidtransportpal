
import React, { useEffect } from "react";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Loader2 } from "lucide-react";
import ParentDashboard from "./parent/ParentDashboard";
import DriverDashboard from "./driver/DriverDashboard";
import { useNavigate } from "react-router-dom";

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, profile, refreshProfile } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Refresh user profile data when layout component mounts
  useEffect(() => {
    if (isAuthenticated && profile) {
      // Silently refresh user profile without showing toasts
      refreshProfile(false).catch(error => {
        console.error("Error refreshing profile:", error);
      });
    } else if (!isAuthenticated && !isLoading) {
      navigate('/auth');
    }
  }, [isAuthenticated, profile, refreshProfile, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-schoolride-primary" />
        <span className="ml-2 text-gray-800 font-medium">Loading...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // We're redirecting in the useEffect, so just return null
  }
  
  return profile?.role === "parent" ? <ParentDashboard /> : <DriverDashboard />;
};

export default Layout;
