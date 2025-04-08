import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarItem } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Car, 
  Clock, 
  Wallet, 
  LogOut,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useMobile } from "@/hooks/use-mobile";

const ParentSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const isMobile = useMobile();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      toast.error("Error logging out");
    }
  };
  
  const getInitials = () => {
    if (!currentUser) return "U";
    const firstInitial = currentUser.name?.[0] || "";
    const lastInitial = currentUser.surname?.[0] || "";
    return `${firstInitial}${lastInitial}`;
  };
  
  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <div className="mb-8 mt-4 flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentUser?.profileImage || ''} />
            <AvatarFallback className="text-xl font-bold bg-schoolride-primary text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-2 font-semibold text-xl">{currentUser?.name} {currentUser?.surname}</h2>
          <p className="text-muted-foreground text-sm mt-1">{currentUser?.email || 'No email'}</p>
        </div>
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/dashboard" />
        <SidebarItem icon={<Car size={18} />} label="Ride History" href="/history" />
        <SidebarItem icon={<Users size={18} />} label="Profile" href="/profile" />
        <SidebarItem icon={<Wallet size={18} />} label="Wallet" href="/wallet" />
        <SidebarItem icon={<LogOut size={18} />} label="Logout" onClick={handleLogout} />
      </div>
    </Sidebar>
  );
};

export default ParentSidebar;
