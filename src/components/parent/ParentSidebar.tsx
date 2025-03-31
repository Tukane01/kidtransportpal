
import React from "react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Clock, User, Wallet, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";

const ParentSidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { activeTab, setActiveTab } = useUI();
  
  const getInitials = () => {
    if (!currentUser?.name || !currentUser?.surname) return "U";
    return `${currentUser.name.charAt(0)}${currentUser.surname.charAt(0)}`.toUpperCase();
  };
  
  const navItems = [
    { id: "home", label: "Home", icon: <Home size={18} /> },
    { id: "history", label: "Ride History", icon: <Clock size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "wallet", label: "Wallet", icon: <Wallet size={18} /> },
  ];
  
  return (
    <div className="w-64 hidden md:flex flex-col bg-white shadow-md h-screen">
      <div className="p-4 flex justify-center">
        <Logo className="h-16" />
      </div>
      
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium">
              {currentUser?.name} {currentUser?.surname}
            </div>
            <div className="text-xs text-muted-foreground">{currentUser?.email}</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === item.id ? "bg-schoolride-primary/10" : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-red-500" onClick={logout}>
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ParentSidebar;
