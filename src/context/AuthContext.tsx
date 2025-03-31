
import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { useSupabaseAuth, UserProfile, UserRole, Car } from "./SupabaseAuthContext";

export type { UserRole, Car };

export interface User extends UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  surname: string;
  phone: string;
  idNumber: string;
  walletBalance: number;
  profileImage?: string;
  cars?: Car[];
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, googleUser?: { name: string; email: string; profilePicture?: string }) => Promise<boolean>;
  registerUser: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>; // Alias for updateUser
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user: supabaseUser, 
    profile,
    isAuthenticated: supabaseIsAuthenticated, 
    isLoading: supabaseIsLoading,
    signIn, 
    signInWithGoogle, 
    signUp,
    signOut,
    updateProfile
  } = useSupabaseAuth();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Convert Supabase user and profile to our app's User type
  useEffect(() => {
    if (supabaseUser && profile) {
      const appUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        ...profile,
      };
      
      setCurrentUser(appUser);
    } else {
      setCurrentUser(null);
    }
  }, [supabaseUser, profile]);

  const login = async (email: string, password: string, googleUser?: { name: string; email: string; profilePicture?: string }): Promise<boolean> => {
    try {
      if (googleUser) {
        const { error } = await signInWithGoogle();
        return !error;
      } else {
        const { error } = await signIn(email, password);
        return !error;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again later.");
      return false;
    }
  };

  const registerUser = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const { password, ...profileData } = userData;
      
      const { error } = await signUp(
        userData.email || "", 
        password,
        profileData
      );
      
      return !error;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again later.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again later.");
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      return await updateProfile(userData);
    } catch (error) {
      console.error("Update user error:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  // Alias for updateUser
  const updateUserProfile = updateUser;

  const value = {
    currentUser,
    isAuthenticated: supabaseIsAuthenticated,
    isLoading: supabaseIsLoading,
    login,
    registerUser,
    logout,
    updateUser,
    updateUserProfile
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
