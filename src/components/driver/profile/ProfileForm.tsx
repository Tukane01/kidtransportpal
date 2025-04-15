
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
  isUploading?: boolean;
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
  isUploading = false,
  onSave,
  onCancel,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <div>
        <Label htmlFor="profileImage">Profile Photo</Label>
        <div className="flex items-center space-x-4 mt-2">
          <div className="relative">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile Preview" 
                className="w-20 h-20 rounded-full object-cover" 
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg text-gray-500">{name && surname ? `${name[0]}${surname[0]}` : "U"}</span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              onClick={handlePhotoButtonClick}
              variant="outline"
              disabled={isUploading}
              className="mb-2"
            >
              {isUploading ? "Uploading..." : "Upload New Image"}
            </Button>
            <div className="text-sm text-gray-500">
              JPG, PNG or GIF, Max size: 2MB
            </div>
          </div>
        </div>
      </div>
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
      <div className="flex space-x-3">
        <Button 
          onClick={onSave} 
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={isUploading}
        >
          Save Profile
        </Button>
        <Button 
          onClick={onCancel} 
          className="bg-gray-500 hover:bg-gray-600 text-white"
          disabled={isUploading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
