import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { useSupabaseAuth, UserProfile, UserRole, Car } from "./SupabaseAuthContext";

export type { UserRole, Car };

export interface User extends Omit<UserProfile, 'idNumber' | 'walletBalance'> {
  id: string;
  email?: string;
  name: string;
  surname: string;
  phone?: string;
  idNumber?: string;
  profileImage?: string;
  walletBalance: number;
  role: UserRole;
  cars?: Car[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  deleteUserProfile: () => Promise<boolean>;
  refreshUserProfile: (showToast?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    session,
    user,
    profile,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    isLoading: supabaseLoading,
    updateProfile,
    refreshProfile
  } = useSupabaseAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (session && user && profile) {
      const userData: User = {
        id: user.id,
        email: user.email,
        name: profile.name || "No Name",
        surname: profile.surname || "No Surname",
        phone: profile.phone,
        idNumber: profile.idNumber,
        profileImage: profile.profileImage,
        walletBalance: profile.walletBalance || 0,
        role: profile.role || "parent",
        cars: profile.cars
      };
      setCurrentUser(userData);
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(supabaseLoading);
  }, [session, user, profile, supabaseLoading]);

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

  const loginWithGoogle = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
        return false;
      }
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const { email, password, name, surname, role, phone, idNumber } = userData;
      const { error } = await signUp({
        email,
        password,
        options: {
          data: {
            name,
            surname,
            role,
            phone,
            id_number: idNumber
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
      const profileData: Partial<UserProfile> = {};
      if (data.name !== undefined) profileData.name = data.name;
      if (data.surname !== undefined) profileData.surname = data.surname;
      if (data.phone !== undefined) profileData.phone = data.phone;
      if (data.idNumber !== undefined) profileData.idNumber = data.idNumber;
      if (data.profileImage !== undefined) profileData.profileImage = data.profileImage;
      if (data.walletBalance !== undefined) profileData.walletBalance = data.walletBalance;

      const { error } = await updateProfile(profileData);
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

  const deleteUserProfile = async () => {
    try {
      const emptyProfile: Partial<UserProfile> = {
        name: null,
        surname: null,
        phone: null,
        profileImage: null
      };

      const { error } = await updateProfile(emptyProfile);
      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success("Profile data removed successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const refreshUserProfile = async (showToast: boolean = true) => {
    try {
      await refreshProfile();
      if (showToast) {
        toast.success("Profile refreshed successfully!");
      }
    } catch (error: any) {
      console.error("Error refreshing profile:", error);
      if (showToast) {
        toast.error("Failed to refresh profile");
      }
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUserProfile,
    deleteUserProfile,
    refreshUserProfile
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
