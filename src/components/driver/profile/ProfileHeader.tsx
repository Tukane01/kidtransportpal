
import React from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Edit, Camera } from "lucide-react";

interface ProfileHeaderProps {
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  onEdit?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onPhotoChange, isUploading = false, onEdit }) => {
  const { profile, user } = useSupabaseAuth();
  const isMobile = useIsMobile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (!profile?.name || !profile?.surname) return "U";
    return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 w-full">
      <div className="relative group">
        <Avatar className="h-20 w-20 md:h-24 md:w-24">
          <AvatarImage src={profile?.profileImage} alt={profile?.name} />
          <AvatarFallback className="text-xl md:text-2xl bg-schoolride-primary text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        ) : (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full transition-all duration-200 cursor-pointer"
            onClick={handleButtonClick}
          >
            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
      
      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="text-lg font-medium text-gray-900">
            {profile?.name || "Set your name"} {profile?.surname || ""}
          </h3>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 p-1 h-auto"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-gray-600 break-words">{user?.email || "No email set"}</p>
        <p className="text-gray-600">{profile?.phone || "No phone set"}</p>
        <p className="text-gray-600 mt-1">ID: {profile?.idNumber || "Not provided"}</p>
        
        <div className="mt-2">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={onPhotoChange}
            accept="image/*"
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-800 border-gray-300 w-full sm:w-auto"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Change Photo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
