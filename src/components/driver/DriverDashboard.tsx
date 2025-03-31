
import React from "react";
import DriverHeader from "./DriverHeader";
import DriverSidebar from "./DriverSidebar";
import DriverHome from "./DriverHome";
import DriverRideHistory from "./DriverRideHistory";
import DriverProfile from "./DriverProfile";
import DriverWallet from "./DriverWallet";
import { useUI } from "@/context/UIContext";

const DriverDashboard: React.FC = () => {
  const { activeTab } = useUI();
  
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <DriverHome />;
      case "history":
        return <DriverRideHistory />;
      case "profile":
        return <DriverProfile />;
      case "wallet":
        return <DriverWallet />;
      default:
        return <DriverHome />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-schoolride-background">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DriverHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;
