
import React from 'react';
import CarForm from '@/components/CarForm';

interface CarFormSectionProps {
  driverIdNumber: string;
  onComplete: () => void;
  onCancel: () => void;
}

const CarFormSection: React.FC<CarFormSectionProps> = ({ driverIdNumber, onComplete, onCancel }) => {
  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Update Car Details</h2>
      <CarForm 
        onComplete={onComplete} 
        onCancel={onCancel}
        driverIdNumber={driverIdNumber}
      />
    </div>
  );
};

export default CarFormSection;
