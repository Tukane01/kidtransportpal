// src/components/driver/DriverProfile.tsx
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CarForm from '@/components/CarForm';

const DriverProfile: React.FC = () => {
  const { profile, updateProfile, refreshProfile } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [showCarForm, setShowCarForm] = useState(false);

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
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.Key}`;
        setProfileImage(imageUrl);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Unexpected error uploading image:', error);
      toast.error('Unexpected error during image upload.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Driver Profile</h1>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="surname">Surname</Label>
            <Input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="profileImage">Profile Image URL</Label>
            <Input
              type="text"
              id="profileImage"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="imageUpload">Upload New Image</Label>
            <Input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <Button onClick={handleSaveProfile} className="bg-green-500 text-white">
            Save Profile
          </Button>
          <Button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {profileImage && (
            <div>
              <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full" />
            </div>
          )}
          <div>
            <Label>Name</Label>
            <div className="font-semibold">{name}</div>
          </div>
          <div>
            <Label>Surname</Label>
            <div className="font-semibold">{surname}</div>
          </div>
          <div>
            <Label>Phone</Label>
            <div className="font-semibold">{phone}</div>
          </div>
          <div>
            <Label>ID Number</Label>
            <div className="font-semibold">{idNumber}</div>
          </div>
          <Button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white">
            Edit Profile
          </Button>
          <Button onClick={() => setShowCarForm(true)} className="bg-blue-500 text-white">
            Update Car Details
          </Button>
          {profile?.cars && profile.cars.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mt-4">Registered Vehicles</h2>
              {profile.cars.map((car) => (
                <div key={car.id} className="border p-2 rounded-md mt-2">
                  <p><strong>Make:</strong> {car.make}</p>
                  <p><strong>Model:</strong> {car.model}</p>
                  <p><strong>Registration Number:</strong> {car.registrationNumber}</p>
                  <p><strong>Color:</strong> {car.color}</p>
                  <p><strong>VIN Number:</strong> {car.vinNumber}</p>
                  <p><strong>Owner ID Number:</strong> {car.ownerIdNumber}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No vehicles registered.</p>
          )}
        </div>
      )}
      {showCarForm && (
        <CarForm 
          onComplete={() => {
            setShowCarForm(false);
            refreshProfile();
          }} 
          onCancel={() => setShowCarForm(false)}
          driverIdNumber={profile?.idNumber || ''}
        />
      )}
    </div>
  );
};

export default DriverProfile;
