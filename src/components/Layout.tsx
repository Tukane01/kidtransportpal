
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import ParentDashboard from "./parent/ParentDashboard";
import DriverDashboard from "./driver/DriverDashboard";
import { useNavigate } from "react-router-dom";

const Layout: React.FC = () => {
  const { currentUser, isLoading, isAuthenticated, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // Refresh user profile data when layout component mounts
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Silently refresh user profile without showing toasts
      refreshUserProfile(false).catch(error => {
        console.error("Error refreshing profile:", error);
      });
    } else if (!isAuthenticated && !isLoading) {
      navigate('/auth');
    }
  }, [isAuthenticated, currentUser, refreshUserProfile, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-schoolride-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // We're redirecting in the useEffect, so just return null
  }
  
  return currentUser?.role === "parent" ? <ParentDashboard /> : <DriverDashboard />;
};

export default Layout;
