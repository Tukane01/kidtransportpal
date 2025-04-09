
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
  name: string;
  surname: string;
  phone: string;
  idNumber: string;
  profileImage: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSurnameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIdNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  name,
  surname,
  phone,
  idNumber,
  profileImage,
  onNameChange,
  onSurnameChange,
  onPhoneChange,
  onIdNumberChange,
  onProfileImageChange,
  onImageUpload,
  onSave,
  onCancel,
}) => {
  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={onNameChange}
          className="bg-white border-gray-300"
        />
      </div>
      <div>
        <Label htmlFor="surname">Surname</Label>
        <Input
          type="text"
          id="surname"
          value={surname}
          onChange={onSurnameChange}
          className="bg-white border-gray-300"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="text"
          id="phone"
          value={phone}
          onChange={onPhoneChange}
          className="bg-white border-gray-300"
        />
      </div>
      <div>
        <Label htmlFor="idNumber">ID Number</Label>
        <Input
          type="text"
          id="idNumber"
          value={idNumber}
          onChange={onIdNumberChange}
          className="bg-white border-gray-300"
        />
      </div>
      <div>
        <Label htmlFor="profileImage">Profile Image URL</Label>
        <Input
          type="text"
          id="profileImage"
          value={profileImage}
          onChange={onProfileImageChange}
          className="bg-white border-gray-300"
        />
      </div>
      <div>
        <Label htmlFor="imageUpload">Upload New Image</Label>
        <Input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={onImageUpload}
          className="bg-white border-gray-300"
        />
      </div>
      <div className="flex space-x-3">
        <Button onClick={onSave} className="bg-green-500 hover:bg-green-600 text-white">
          Save Profile
        </Button>
        <Button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
