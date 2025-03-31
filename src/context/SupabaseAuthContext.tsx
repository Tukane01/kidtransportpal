
import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = "parent" | "driver";

export interface Car {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  vinNumber: string;
  ownerIdNumber: string;
}

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  phone: string;
  idNumber: string;
  walletBalance: number;
  profileImage?: string;
  role: UserRole;
  cars?: Car[];
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile for the current user
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      // If user is a driver, fetch their cars
      if (data && data.role === 'driver') {
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .eq('owner_id', userId);
        
        if (!carsError && carsData) {
          data.cars = carsData;
        } else if (carsError) {
          console.error("Error fetching cars:", carsError);
        }
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  // Refresh the current user's profile
  const refreshProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
  };

  // Initialize auth and listen for auth state changes
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      // First set up the auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // If there is a user, fetch their profile
        if (currentSession?.user) {
          // Use setTimeout to avoid the Supabase authentication deadlock issue
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      });

      // Then check for a current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      // If there is a user, fetch their profile
      if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id);
        setProfile(profileData);
      }

      setIsLoading(false);

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    initialize();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success("Signed in successfully!");
      return { error: null };
    } catch (error) {
      console.error("SignIn error:", error);
      toast.error("Failed to sign in");
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("Google SignIn error:", error);
      toast.error("Failed to sign in with Google");
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            surname: userData.surname,
            role: userData.role || 'parent',
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success("Signed up successfully! Please check your email for verification.");
      return { error: null };
    } catch (error) {
      console.error("SignUp error:", error);
      toast.error("Failed to sign up");
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("SignOut error:", error);
      toast.error("Failed to sign out");
    }
  };

  const updateProfile = async (userData: Partial<UserProfile>) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        return false;
      }

      await refreshProfile();
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  const value = {
    session,
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
};
