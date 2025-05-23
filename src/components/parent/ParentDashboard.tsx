
import React from "react";
import ParentHeader from "./ParentHeader";
import ParentSidebar from "./ParentSidebar";
import ParentHome from "./ParentHome";
import ParentRideHistory from "./ParentRideHistory";
import ParentProfile from "./ParentProfile";
import ParentWallet from "./ParentWallet";
import { useUI } from "@/context/UIContext";
import { SidebarProvider } from "@/components/ui/sidebar";

const ParentDashboard: React.FC = () => {
  const { activeTab } = useUI();
  
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <ParentHome />;
      case "history":
        return <ParentRideHistory />;
      case "profile":
        return <ParentProfile />;
      case "wallet":
        return <ParentWallet />;
      default:
        return <ParentHome />;
    }
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-schoolride-background w-full">
        <ParentSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <ParentHeader />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 text-schoolride-text w-full">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ParentDashboard;
