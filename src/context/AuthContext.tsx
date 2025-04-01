import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { useSupabaseAuth, UserProfile, UserRole, Car } from "./SupabaseAuthContext";

export type { UserRole, Car };

export interface User extends UserProfile {
  id: string;
  email?: string;
  name: string;
  surname: string;
  phone?: string;
  idNumber?: string;
  profileImage?: string;
  walletBalance: number;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    session,
    user,
    signIn,
    signUp,
    signOut,
    isLoading: supabaseLoading,
    updateProfile,
  } = useSupabaseAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (session && user) {
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name || "No Name",
        surname: user.user_metadata.surname || "No Surname",
        phone: user.user_metadata.phone,
        idNumber: user.user_metadata.idNumber,
        profileImage: user.user_metadata.profileImage,
        walletBalance: user.user_metadata.walletBalance || 0,
        role: user.user_metadata.role || "parent",
      };
      setCurrentUser(userData);
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(supabaseLoading);
  }, [session, user, supabaseLoading]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await signIn({ email, password });
      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const { email, password, name, surname, role } = userData;
      const { error } = await signUp({
        email,
        password,
        options: {
          data: {
            name,
            surname,
            role,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success("Registration successful! Please check your email to verify your account.");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Logout successful!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const { error } = await updateProfile(data);
      if (error) {
        toast.error(error.message);
        return false;
      }

      setCurrentUser((prevUser) => {
        if (prevUser) {
          return { ...prevUser, ...data } as User;
        }
        return prevUser;
      });

      toast.success("Profile updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
