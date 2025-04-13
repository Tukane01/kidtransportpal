
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase, handleDatabaseError } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileHeader from './profile/ProfileHeader';
import ProfileForm from './profile/ProfileForm';
import ProfileDisplay from './profile/ProfileDisplay';
import CarFormSection from './profile/CarFormSection';
import { useProfileImage } from './profile/useProfileImage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Car } from '@/context/SupabaseAuthContext';

const DriverProfile: React.FC = () => {
  const { profile, updateProfile, refreshProfile, signOut, user } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [showCarForm, setShowCarForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCarDeleting, setIsCarDeleting] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [isAddingCar, setIsAddingCar] = useState(false);
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

  const handleDeleteCar = async () => {
    if (!carToDelete) return;
    
    setIsCarDeleting(true);
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carToDelete.id);
      
      if (error) throw error;
      
      toast.success("Vehicle deleted successfully");
      await refreshProfile();
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete vehicle: " + (error as Error).message);
    } finally {
      setIsCarDeleting(false);
      setCarToDelete(null);
    }
  };

  const handleEditCar = (car: Car) => {
    setShowCarForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Driver Profile</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Delete Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          onShowCarForm={() => {
            setIsAddingCar(true);
            setShowCarForm(true);
          }}
          onPhotoChange={handlePhotoChange}
          isUploading={isUploading}
          onEditCar={handleEditCar}
          onDeleteCar={setCarToDelete}
        />
      )}

      {showCarForm && (
        <CarFormSection 
          driverIdNumber={profile?.idNumber || ''}
          onComplete={() => {
            setShowCarForm(false);
            setIsAddingCar(false);
            refreshProfile();
          }}
          onCancel={() => {
            setShowCarForm(false);
            setIsAddingCar(false);
          }}
          isAdding={isAddingCar}
        />
      )}

      {/* Car Deletion Dialog */}
      <AlertDialog open={!!carToDelete} onOpenChange={(open) => !open && setCarToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Delete Vehicle
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this vehicle from your profile.
              {carToDelete && (
                <div className="mt-2 font-medium">
                  {carToDelete.make} {carToDelete.model} ({carToDelete.registrationNumber})
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCar}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isCarDeleting}
            >
              {isCarDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Vehicle"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriverProfile;
