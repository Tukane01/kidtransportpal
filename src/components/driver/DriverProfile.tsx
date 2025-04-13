
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Import refactored components
import ProfileHeader from './profile/ProfileHeader';
import ProfileForm from './profile/ProfileForm';
import ProfileDisplay from './profile/ProfileDisplay';
import CarFormSection from './profile/CarFormSection';
import { useProfileImage } from './profile/useProfileImage';

const DriverProfile: React.FC = () => {
  const { profile, updateProfile, refreshProfile, signOut } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [showCarForm, setShowCarForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { profileImage, setProfileImage, handleImageUpload } = useProfileImage(profile?.id);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setSurname(profile.surname || '');
      setPhone(profile.phone || '');
      setIdNumber(profile.idNumber || '');
      setProfileImage(profile.profileImage || '');
    }
  }, [profile, setProfileImage]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    try {
      setIsUploading(true);
      const file = e.target.files[0];
      await handleImageUpload(e);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    const userData = {
      name,
      surname,
      phone,
      idNumber,
      profileImage,
    };

    const { error } = await updateProfile(userData);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      await refreshProfile();
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Call the delete_user database function
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      // Sign out the user
      await signOut();
      toast.success("Account deleted successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account: " + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Driver Profile</h1>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 flex items-center"
        >
          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isDeleting ? "Deleting Account..." : "Delete Account"}
        </button>
      </div>

      {isEditing ? (
        <ProfileForm
          name={name}
          surname={surname}
          phone={phone}
          idNumber={idNumber}
          profileImage={profileImage}
          onNameChange={(e) => setName(e.target.value)}
          onSurnameChange={(e) => setSurname(e.target.value)}
          onPhoneChange={(e) => setPhone(e.target.value)}
          onIdNumberChange={(e) => setIdNumber(e.target.value)}
          onProfileImageChange={(e) => setProfileImage(e.target.value)}
          onImageUpload={handlePhotoChange}
          isUploading={isUploading}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileDisplay
          name={name}
          surname={surname}
          phone={phone}
          idNumber={idNumber}
          profileImage={profileImage}
          cars={profile?.cars}
          onEdit={() => setIsEditing(true)}
          onShowCarForm={() => setShowCarForm(true)}
          onPhotoChange={handlePhotoChange}
          isUploading={isUploading}
        />
      )}

      {showCarForm && (
        <CarFormSection 
          driverIdNumber={profile?.idNumber || ''}
          onComplete={() => {
            setShowCarForm(false);
            refreshProfile();
          }}
          onCancel={() => setShowCarForm(false)}
        />
      )}
    </div>
  );
};

export default DriverProfile;
