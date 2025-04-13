
import React from 'react';
import CarForm from '@/components/CarForm';

interface CarFormSectionProps {
  driverIdNumber: string;
  onComplete: () => void;
  onCancel: () => void;
  isAdding?: boolean;
  car?: any;
}

const CarFormSection: React.FC<CarFormSectionProps> = ({ 
  driverIdNumber, 
  onComplete, 
  onCancel,
  isAdding = true,
  car 
}) => {
  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">
        {isAdding ? "Add New Vehicle" : "Update Vehicle"}
      </h2>
      <CarForm 
        onComplete={onComplete} 
        onCancel={onCancel}
        driverIdNumber={driverIdNumber}
        existingCar={car}
      />
    </div>
  );
};

export default CarFormSection;
