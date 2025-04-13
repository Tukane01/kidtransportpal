
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Car } from '@/context/SupabaseAuthContext';
import { Loader2, Edit, Plus, Trash2 } from 'lucide-react';

interface ProfileDisplayProps {
  name: string;
  surname: string;
  phone: string;
  idNumber: string;
  profileImage: string;
  cars?: Car[];
  onEdit: () => void;
  onShowCarForm: () => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  onEditCar?: (car: Car) => void;
  onDeleteCar?: (car: Car) => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
  name,
  surname,
  phone,
  idNumber,
  profileImage,
  cars,
  onEdit,
  onShowCarForm,
  onPhotoChange,
  isUploading,
  onEditCar,
  onDeleteCar,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="relative group">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-40 h-40 rounded-full object-cover" />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl text-gray-500">{name && surname ? `${name[0]}${surname[0]}` : "U"}</span>
              </div>
            )}
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
            ) : (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full transition-all duration-200 cursor-pointer"
                onClick={handlePhotoButtonClick}
              >
                <Edit className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
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
            className="text-gray-800 border-gray-300 mt-4"
            onClick={handlePhotoButtonClick}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Change Photo"}
          </Button>
        </div>
        
        <div className="md:w-2/3 space-y-4">
          <div>
            <Label>Name</Label>
            <div className="font-semibold text-lg">{name || "Not provided"}</div>
          </div>
          <div>
            <Label>Surname</Label>
            <div className="font-semibold text-lg">{surname || "Not provided"}</div>
          </div>
          <div>
            <Label>Phone</Label>
            <div className="font-semibold">{phone || "Not provided"}</div>
          </div>
          <div>
            <Label>ID Number</Label>
            <div className="font-semibold">{idNumber || "Not provided"}</div>
          </div>
          <div className="flex gap-3 flex-wrap pt-4">
            <Button onClick={onEdit} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button onClick={onShowCarForm} className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Vehicle
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Registered Vehicles</h2>
        </div>
        
        {cars && cars.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {cars.map((car) => (
              <div key={car.id} className="border p-4 rounded-md bg-gray-50 hover:shadow-md transition-shadow">
                <div className="flex justify-between">
                  <p className="font-bold text-lg">{car.make} {car.model}</p>
                  <div className="flex gap-2">
                    {onEditCar && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-500 hover:text-blue-700 p-1 h-auto"
                        onClick={() => onEditCar(car)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteCar && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                        onClick={() => onDeleteCar(car)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-gray-700">
                  <p><strong>Registration:</strong> {car.registrationNumber}</p>
                  <p><strong>Color:</strong> {car.color}</p>
                  <p><strong>VIN:</strong> {car.vinNumber}</p>
                  <p><strong>Owner ID:</strong> {car.ownerIdNumber}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 p-6 bg-gray-50 rounded border text-center">
            <p className="text-gray-600 mb-4">You haven't registered any vehicles yet.</p>
            <Button 
              onClick={onShowCarForm} 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDisplay;
