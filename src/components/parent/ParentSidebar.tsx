
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenuItem, 
  SidebarMenu, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
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
import { useIsMobile } from "@/hooks/use-mobile";

const ParentSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const isMobile = useIsMobile();
  
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
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/dashboard')}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/history')}>
                <Car size={18} />
                <span>Ride History</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/profile')}>
                <Users size={18} />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/wallet')}>
                <Wallet size={18} />
                <span>Wallet</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  );
};

export default ParentSidebar;
