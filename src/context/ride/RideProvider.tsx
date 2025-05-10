
import React, { useState, useCallback } from "react";
import { RideContext } from "./RideContext";
import { useParentRides } from "./useParentRides";
import { useDriverRides } from "./useDriverRides";
import { useAvailableRides } from "./useAvailableRides";
import { useRideManagement } from "./useRideManagement";
import { useGetCurrentRide } from "./useGetCurrentRide";
import { useSupabaseAuth } from "../SupabaseAuthContext";
import { Ride } from "./types";

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useSupabaseAuth();
  const [allRides, setAllRides] = useState<Ride[]>([]);

  // Update rides state helper function for ride management
  const updateRidesState = useCallback((rideId: string, status: Ride["status"], location: any = null) => {
    setAllRides(prevRides => 
      prevRides.map(ride => 
        ride.id === rideId 
          ? { ...ride, status, ...(location && { driverLocation: location }) }
          : ride
      )
    );
  }, []);
  
  // Custom hooks for different ride functionalities
  const parentRides = useParentRides();
  const driverRides = useDriverRides();
  const availableRides = useAvailableRides(profile);
  const rideManagement = useRideManagement(profile, updateRidesState);
  
  // Combine rides from different sources
  React.useEffect(() => {
    const combinedRides = [
      ...parentRides.rides,
      ...driverRides.rides,
      ...availableRides.rides
    ];
    
    // Remove duplicates based on id
    const uniqueRides = combinedRides.reduce<Ride[]>((acc, ride) => {
      if (!acc.some(r => r.id === ride.id)) {
        acc.push(ride);
      }
      return acc;
    }, []);
    
    setAllRides(uniqueRides);
  }, [parentRides.rides, driverRides.rides, availableRides.rides]);
  
  // Get current ride utility
  const getCurrentRide = useGetCurrentRide(allRides);

  const value = {
    rides: allRides,
    children: parentRides.children,
    cars: driverRides.cars,
    isLoading: parentRides.isLoading || driverRides.isLoading || availableRides.isLoading || rideManagement.isLoading,
    error: parentRides.error || driverRides.error || availableRides.error || rideManagement.error,
    fetchRidesByParentId: parentRides.fetchRidesByParentId,
    fetchRidesByDriverId: driverRides.fetchRidesByDriverId,
    fetchAvailableRides: availableRides.fetchAvailableRides,
    requestRide: rideManagement.requestRide,
    createRideRequest: rideManagement.createRideRequest,
    acceptRideRequest: rideManagement.acceptRideRequest,
    updateRideStatus: rideManagement.updateRideStatus,
    rateRide: rideManagement.rateRide,
    getCurrentRide
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};
