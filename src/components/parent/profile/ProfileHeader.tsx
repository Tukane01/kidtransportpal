
import React from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  onPhotoChange: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onPhotoChange }) => {
  const { profile, user } = useSupabaseAuth();

  const getInitials = () => {
    if (!profile?.name || !profile?.surname) return "U";
    return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={profile?.profileImage} alt={profile?.name} />
        <AvatarFallback className="text-2xl bg-schoolride-primary text-white">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">
          {profile?.name || "Set your name"} {profile?.surname || ""}
        </h3>
        <p className="text-gray-600">{user?.email || "No email set"}</p>
        <p className="text-gray-600">{profile?.phone || "No phone set"}</p>
        <p className="text-gray-600 mt-1">ID: {profile?.idNumber || "Not provided"}</p>
        
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-800 border-gray-300"
            onClick={onPhotoChange}
          >
            Change Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
