
import React from "react";
import { Bell, Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DriverSidebar from "./DriverSidebar";

const DriverHeader: React.FC = () => {
  const { currentUser } = useAuth();
  const { setNotificationAlert } = useUI();
  
  const getInitials = () => {
    if (!currentUser?.name || !currentUser?.surname) return "U";
    return `${currentUser.name.charAt(0)}${currentUser.surname.charAt(0)}`.toUpperCase();
  };
  
  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[250px]">
                <DriverSidebar />
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-bold font-heading text-schoolride-primary hidden md:block">
              SchoolRideApp
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setNotificationAlert(true)}
            >
              <Bell size={20} />
            </Button>
            
            <Button size="icon" variant="ghost">
              <MessageCircle size={20} />
            </Button>
            
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DriverHeader;
