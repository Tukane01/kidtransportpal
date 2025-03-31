
import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNotificationAlertOpen: boolean;
  setNotificationAlert: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isNotificationAlertOpen, setIsNotificationAlertOpen] = useState(false);
  
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const setNotificationAlert = (isOpen: boolean) => setIsNotificationAlertOpen(isOpen);
  
  const value = {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    activeTab,
    setActiveTab,
    isNotificationAlertOpen,
    setNotificationAlert
  };
  
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
};
