
import React from "react";
import { useUI } from "@/context/UIContext";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Home, Clock, User, Wallet, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";

const ParentSidebar: React.FC = () => {
  const { profile, signOut } = useSupabaseAuth();
  const { activeTab, setActiveTab } = useUI();
  
  const getInitials = () => {
    if (!profile?.name || !profile?.surname) return "U";
    return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
  };
  
  const navItems = [
    { id: "home", label: "Home", icon: <Home size={18} /> },
    { id: "history", label: "Ride History", icon: <Clock size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "wallet", label: "Wallet", icon: <Wallet size={18} /> },
  ];
  
  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <div className="w-64 hidden md:flex flex-col bg-white shadow-md h-screen">
      <div className="p-4 flex justify-center">
        <Logo className="h-24" />
      </div>
      
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.profileImage} alt={profile?.name} />
            <AvatarFallback className="bg-schoolride-primary text-white font-medium">{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium text-gray-800 text-base">
              {profile?.name || "User"} {profile?.surname || ""}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {/* Get email from User object in auth context if needed */}
              {profile?.id ? profile.id.substring(0, 8) + "..." : "No email"}
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-base ${
                  activeTab === item.id 
                    ? "bg-schoolride-primary/10 text-schoolride-primary font-medium" 
                    : "text-gray-700 hover:text-schoolride-primary font-medium"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ParentSidebar;
