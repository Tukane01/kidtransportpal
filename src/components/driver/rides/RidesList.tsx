
import React from 'react';
import RideItem from './RideItem';
import { Ride } from '@/types/ride';

interface RidesListProps {
  rides: Ride[];
  isLoading: boolean;
}

const RidesList: React.FC<RidesListProps> = ({ rides, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading ride history...</div>;
  }
  
  if (rides.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">No rides found for the selected filters.</p>
      </div>
    );
  }
  
  return (
    <div>
      {rides.map(ride => (
        <RideItem key={ride.id} ride={ride} />
      ))}
    </div>
  );
};

export default RidesList;
