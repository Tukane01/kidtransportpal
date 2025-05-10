
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ride, Child } from "./types";

export const useParentRides = () => {
  const [rideChildren, setRideChildren] = useState<Child[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRidesByParentId = useCallback(async (parentId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First fetch children for this parent
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId);

      if (childrenError) throw childrenError;

      // Transform children data
      const transformedChildren = childrenData.map(child => ({
        id: child.id,
        name: child.name,
        surname: child.surname,
        schoolAddress: child.school_address,
        schoolName: child.school_name
      }));

      setRideChildren(transformedChildren);

      // Fetch rides with joined data
      const { data, error: ridesError } = await supabase
        .from('rides')
        .select(`
          *,
          profiles!rides_driver_id_fkey (name, surname, profile_image),
          children:child_id (name, surname)
        `)
        .eq('parent_id', parentId)
        .order('pickup_time', { ascending: false });

      if (ridesError) throw ridesError;

      // Transform database data to match component expectations
      const transformedRides = data.map(ride => {
        // Check if profiles exists and is a valid object before accessing properties
        let driverName = "Not assigned";
        let driverImage = null;
        
        // Handle potentially null or error profiles data safely
        if (ride.profiles && typeof ride.profiles === 'object' && ride.profiles !== null) {
          const profiles = ride.profiles as any;
          driverName = `${profiles?.name || ''} ${profiles?.surname || ''}`.trim() || "Not assigned";
          driverImage = profiles?.profile_image;
        }

        return {
          id: ride.id,
          parentId: ride.parent_id,
          driverId: ride.driver_id,
          childId: ride.child_id,
          pickupAddress: ride.pickup_address,
          dropoffAddress: ride.dropoff_address,
          pickupTime: ride.pickup_time,
          dropoffTime: ride.dropoff_time,
          status: (ride.status as Ride["status"]),
          price: ride.price,
          childName: ride.children ? `${ride.children.name || ''} ${ride.children.surname || ''}`.trim() : "Unknown",
          driverName,
          driverImage,
          otp: ride.otp || "0000",
          driverLocation: ride.driver_location
        };
      });

      setRides(transformedRides);
    } catch (err) {
      console.error("Error fetching rides by parent ID:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to load rides");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rides,
    children: rideChildren,
    isLoading,
    error,
    fetchRidesByParentId
  };
};
