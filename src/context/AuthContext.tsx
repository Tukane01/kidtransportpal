
import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";

export type UserRole = "parent" | "driver";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  surname: string;
  phone: string;
  idNumber: string;
  walletBalance: number;
  profileImage?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database for demonstration
const MOCK_USERS: Record<string, User & { password: string }> = {
  "parent@example.com": {
    id: "parent-123",
    email: "parent@example.com",
    password: "Password123",
    role: "parent",
    name: "John",
    surname: "Parent",
    phone: "0821234567",
    idNumber: "7001015800085",
    walletBalance: 500,
    profileImage: "https://i.pravatar.cc/150?img=3"
  },
  "driver@example.com": {
    id: "driver-456",
    email: "driver@example.com",
    password: "Password123",
    role: "driver",
    name: "Sarah",
    surname: "Driver",
    phone: "0731234567",
    idNumber: "8503125800088",
    walletBalance: 200,
    profileImage: "https://i.pravatar.cc/150?img=5"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("schoolRideUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("schoolRideUser");
      }
    }
    setIsLoading(false);
    
    // Set up session expiry (24 hours)
    const sessionTimeout = setTimeout(() => {
      logout();
      toast.info("Your session has expired. Please log in again.");
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => clearTimeout(sessionTimeout);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = MOCK_USERS[email.toLowerCase()];
      
      if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem("schoolRideUser", JSON.stringify(userWithoutPassword));
        toast.success(`Welcome back, ${user.name}!`);
        return true;
      } else {
        toast.error("Invalid email or password");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again later.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (userData.email && MOCK_USERS[userData.email.toLowerCase()]) {
        toast.error("User with this email already exists");
        return false;
      }
      
      // In a real app, this would call a backend API
      const newUser: User & { password: string } = {
        id: `user-${Date.now()}`,
        email: userData.email || "",
        password: userData.password,
        role: userData.role || "parent",
        name: userData.name || "",
        surname: userData.surname || "",
        phone: userData.phone || "",
        idNumber: userData.idNumber || "",
        walletBalance: 0,
        ...userData
      };
      
      // Save to mock DB
      if (newUser.email) {
        MOCK_USERS[newUser.email.toLowerCase()] = newUser;
      }
      
      // Save without password to state and localStorage
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem("schoolRideUser", JSON.stringify(userWithoutPassword));
      
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again later.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("schoolRideUser");
    toast.info("You have been logged out");
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem("schoolRideUser", JSON.stringify(updatedUser));
      
      // Update mock DB
      if (updatedUser.email && MOCK_USERS[updatedUser.email]) {
        MOCK_USERS[updatedUser.email] = {
          ...MOCK_USERS[updatedUser.email],
          ...userData
        };
      }
      
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Update user error:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    registerUser,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
