
import React from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Ride } from '@/types/ride';

interface RideItemProps {
  ride: Ride;
}

const RideItem: React.FC<RideItemProps> = ({ ride }) => {
  const date = new Date(ride.pickupTime);
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{format(date, 'MMMM d, yyyy')}</CardTitle>
            <CardDescription>{format(date, 'h:mm a')}</CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            ride.status === 'completed' ? 'bg-green-500' :
            ride.status === 'cancelled' ? 'bg-red-500' :
            ride.status === 'inProgress' ? 'bg-blue-500' :
            'bg-yellow-500'
          }`}>
            {ride.status}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="font-medium">{ride.pickupAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="font-medium">{ride.dropoffAddress}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Parent</p>
          <p className="font-medium">{ride.parentName || 'Not assigned'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RideItem;
