import React, { useState, useEffect } from "react";
import ProfileForm from "./ProfileForm";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ParentProfile: React.FC = () => {
  const { profile, refreshProfile, signOut } = useSupabaseAuth();

  // Handle profile update
  const handleProfileUpdate = async (updatedProfileData: { name: string; surname: string; email: string; phone: string; idNumber: string }) => {
    try {
      // Update profile in your backend or Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfileData)
        .eq('id', profile?.id);

      if (error) throw error;

      toast.success("Profile updated successfully");

      // Optionally, refresh the profile after updating
      await refreshProfile(true);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      <ProfileForm profile={profile} onProfileUpdate={handleProfileUpdate} />
    </div>
  );
};

export default ParentProfile;
