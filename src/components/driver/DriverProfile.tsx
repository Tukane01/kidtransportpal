
// src/components/driver/DriverProfile.tsx
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CarForm from '@/components/CarForm';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const DriverProfile: React.FC = () => {
  const { profile, updateProfile, refreshProfile, signOut } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [showCarForm, setShowCarForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setSurname(profile.surname || '');
      setPhone(profile.phone || '');
      setIdNumber(profile.idNumber || '');
      setProfileImage(profile.profileImage || '');
    }
  }, [profile]);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const fileName = `profile-image-${profile?.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image.');
      } else {
        // Fix: Correct property access for storage response data
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
        setProfileImage(imageUrl);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Unexpected error uploading image:', error);
      toast.error('Unexpected error during image upload.');
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Driver Profile</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="text-white">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-gray-800 bg-gray-100 hover:bg-gray-200">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isEditing ? (
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="surname">Surname</Label>
            <Input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="profileImage">Profile Image URL</Label>
            <Input
              type="text"
              id="profileImage"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="imageUpload">Upload New Image</Label>
            <Input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="bg-white border-gray-300"
            />
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleSaveProfile} className="bg-green-500 hover:bg-green-600 text-white">
              Save Profile
            </Button>
            <Button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600 text-white">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-40 h-40 rounded-full object-cover" />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">{name && surname ? `${name[0]}${surname[0]}` : "U"}</span>
                </div>
              )}
            </div>
            
            <div className="md:w-2/3 space-y-4">
              <div>
                <Label>Name</Label>
                <div className="font-semibold text-lg">{name}</div>
              </div>
              <div>
                <Label>Surname</Label>
                <div className="font-semibold text-lg">{surname}</div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="font-semibold">{phone || "Not provided"}</div>
              </div>
              <div>
                <Label>ID Number</Label>
                <div className="font-semibold">{idNumber || "Not provided"}</div>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                  Edit Profile
                </Button>
                <Button onClick={() => setShowCarForm(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                  Update Car Details
                </Button>
              </div>
            </div>
          </div>
          
          {profile?.cars && profile.cars.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Registered Vehicles</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {profile.cars.map((car) => (
                  <div key={car.id} className="border p-4 rounded-md bg-gray-50">
                    <p className="font-bold text-lg">{car.make} {car.model}</p>
                    <div className="mt-2 space-y-1 text-gray-700">
                      <p><strong>Registration:</strong> {car.registrationNumber}</p>
                      <p><strong>Color:</strong> {car.color}</p>
                      <p><strong>VIN:</strong> {car.vinNumber}</p>
                      <p><strong>Owner ID:</strong> {car.ownerIdNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-gray-50 rounded border text-center">
              <p>No vehicles registered.</p>
            </div>
          )}
        </div>
      )}
      {showCarForm && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Update Car Details</h2>
          <CarForm 
            onComplete={() => {
              setShowCarForm(false);
              refreshProfile();
            }} 
            onCancel={() => setShowCarForm(false)}
            driverIdNumber={profile?.idNumber || ''}
          />
        </div>
      )}
    </div>
  );
};

export default DriverProfile;
