
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import ParentDashboard from "./parent/ParentDashboard";
import DriverDashboard from "./driver/DriverDashboard";
import AuthWrapper from "./AuthWrapper";

const Layout: React.FC = () => {
  const { currentUser, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-schoolride-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthWrapper />;
  }
  
  return currentUser?.role === "parent" ? <ParentDashboard /> : <DriverDashboard />;
};

export default Layout;
