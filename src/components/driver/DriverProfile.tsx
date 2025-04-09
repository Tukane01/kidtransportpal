
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import ProfileHeader from './profile/ProfileHeader';
import ProfileForm from './profile/ProfileForm';
import ProfileDisplay from './profile/ProfileDisplay';
import CarFormSection from './profile/CarFormSection';
import { useProfileImage } from './profile/useProfileImage';

const DriverProfile: React.FC = () => {
  const { profile, updateProfile, refreshProfile, signOut } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [showCarForm, setShowCarForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
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
      <ProfileHeader isDeleting={isDeleting} onDeleteAccount={handleDeleteAccount} />

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
          onImageUpload={handleImageUpload}
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
