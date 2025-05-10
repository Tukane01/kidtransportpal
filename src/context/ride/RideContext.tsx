
import React, { createContext, useContext } from "react";
import { Ride, RideRequest, Child, Car } from "./types";

interface RideContextType {
  rides: Ride[];
  children: Child[];
  cars: Car[];
  isLoading: boolean;
  error: Error | null;
  fetchRidesByParentId: (parentId: string) => Promise<void>;
  fetchRidesByDriverId: (driverId: string) => Promise<void>;
  fetchAvailableRides: () => Promise<void>;
  requestRide: (rideRequest: RideRequest) => Promise<boolean>;
  createRideRequest: (rideData: any) => Promise<any>;
  acceptRideRequest: (requestId: string, driverId: string) => Promise<any>;
  updateRideStatus: (rideId: string, status: Ride["status"], location?: any) => Promise<any>;
  rateRide: (rideId: string, rating: number, comment: string, isParent: boolean) => Promise<any>;
  getCurrentRide: () => Ride | null;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const useRide = () => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error("useRide must be used within a RideProvider");
  }
  return context;
};

export { RideContext };
