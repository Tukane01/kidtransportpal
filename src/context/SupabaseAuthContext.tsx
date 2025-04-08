
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

export interface Child {
  id: string;
  name: string;
  surname: string;
  schoolName: string;
  schoolAddress: string;
  idNumber?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  phone?: string;
  idNumber?: string;
  walletBalance: number;
  profileImage?: string;
  role: UserRole;
  cars?: Car[];
  children?: Child[];
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: ({ email, password }: { email: string; password: string }) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<{ error: any | null }>;
  signUp: ({ email, password, options }: { email: string; password: string; options?: { data: any } }) => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  updateProfile: (userData: Partial<UserProfile>) => Promise<{ error: any | null }>;
  refreshProfile: (showToast?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Check if it's a "no rows returned" error
        if (error.code === 'PGRST116') {
          // Create a default profile for this user
          const defaultProfile = {
            id: userId,
            name: '',
            surname: '',
            role: 'parent' as UserRole,
            wallet_balance: 0
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(defaultProfile);
            
          if (insertError) {
            console.error("Error creating default profile:", insertError);
            return null;
          }
          
          // Return the default profile we just created
          return {
            id: userId,
            name: '',
            surname: '',
            role: 'parent' as UserRole,
            walletBalance: 0
          } as UserProfile;
        }
        
        console.error("Error fetching profile:", error);
        return null;
      }

      const userProfile: UserProfile = {
        id: data.id,
        name: data.name || '',
        surname: data.surname || '',
        phone: data.phone || '',
        idNumber: data.id_number || '',
        walletBalance: data.wallet_balance || 0,
        profileImage: data.profile_image || '',
        role: data.role as UserRole || 'parent',
      };

      // Fetch role-specific data
      if (data && data.role === 'driver') {
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .eq('owner_id', userId);
        
        if (!carsError && carsData) {
          userProfile.cars = carsData.map(car => ({
            id: car.id,
            make: car.make,
            model: car.model,
            registrationNumber: car.registration_number,
            color: car.color,
            vinNumber: car.vin_number,
            ownerIdNumber: car.owner_id_number
          }));
        } else if (carsError) {
          console.error("Error fetching cars:", carsError);
        }
      } else if (data && data.role === 'parent') {
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', userId);
        
        if (!childrenError && childrenData) {
          userProfile.children = childrenData.map(child => ({
            id: child.id,
            name: child.name,
            surname: child.surname,
            schoolName: child.school_name,
            schoolAddress: child.school_address,
            idNumber: child.id_number
          }));
        } else if (childrenError) {
          console.error("Error fetching children:", childrenError);
        }
      }

      return userProfile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  const refreshProfile = async (showToast: boolean = false) => {
    if (!user) return;
    
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      if (showToast) {
        toast.success("Profile refreshed successfully");
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      });

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

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

  const signIn = async ({ email, password }: { email: string; password: string }) => {
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

  const signUp = async ({ email, password, options }: { email: string; password: string; options?: { data: any } }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return { error };
      }
      toast.success("Signed out successfully");
      return { error: null };
    } catch (error) {
      console.error("SignOut error:", error);
      toast.error("Failed to sign out");
      return { error };
    }
  };

  const updateProfile = async (userData: Partial<UserProfile>) => {
    if (!user) return { error: 'No user is logged in' };
    
    try {
      const supabaseData: any = {};
      if (userData.name !== undefined) supabaseData.name = userData.name;
      if (userData.surname !== undefined) supabaseData.surname = userData.surname;
      if (userData.phone !== undefined) supabaseData.phone = userData.phone;
      if (userData.idNumber !== undefined) supabaseData.id_number = userData.idNumber;
      if (userData.profileImage !== undefined) supabaseData.profile_image = userData.profileImage;
      if (userData.walletBalance !== undefined) supabaseData.wallet_balance = userData.walletBalance;

      const { error } = await supabase
        .from('profiles')
        .update(supabaseData)
        .eq('id', user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        return { error };
      }

      await refreshProfile(false); // Don't show toast on auto-refresh
      return { error: null };
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return { error };
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
