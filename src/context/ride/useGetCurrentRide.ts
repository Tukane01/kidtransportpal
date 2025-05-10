
import { useCallback } from "react";
import { Ride } from "./types";

export const useGetCurrentRide = (rides: Ride[]) => {
  const getCurrentRide = useCallback(() => {
    // Find the first ride with status "accepted" or "inProgress"
    const currentRide = rides.find(ride => 
      ride.status === "accepted" || ride.status === "inProgress"
    );
    
    return currentRide || null;
  }, [rides]);

  return getCurrentRide;
};
