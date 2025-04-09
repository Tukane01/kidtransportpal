
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Car } from '@/context/AuthContext';

interface ProfileDisplayProps {
  name: string;
  surname: string;
  phone: string;
  idNumber: string;
  profileImage: string;
  cars?: Car[];
  onEdit: () => void;
  onShowCarForm: () => void;
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
}) => {
  return (
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
            <Button onClick={onEdit} className="bg-blue-500 hover:bg-blue-600 text-white">
              Edit Profile
            </Button>
            <Button onClick={onShowCarForm} className="bg-blue-500 hover:bg-blue-600 text-white">
              Update Car Details
            </Button>
          </div>
        </div>
      </div>
      
      {cars && cars.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Registered Vehicles</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {cars.map((car) => (
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
  );
};

export default ProfileDisplay;
