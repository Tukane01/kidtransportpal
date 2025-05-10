
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ride } from "./types";

export const useAvailableRides = (userProfile: any) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailableRides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only drivers should see available rides
      if (userProfile?.role !== 'driver') {
        setRides([]);
        return;
      }

      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          profiles!ride_requests_parent_id_fkey (name, surname, profile_image),
          children:child_id (name, surname, school_name)
        `)
        .eq('status', 'requested')
        .order('pickup_time', { ascending: true });

      if (error) throw error;

      // Transform database data to match component expectations
      const transformedRides = data.map(request => {
        // Check if profiles exists and is a valid object before accessing properties
        let parentName = "Unknown";
        let parentImage = null;
        
        // Handle potentially null or error profiles data safely
        if (request.profiles && typeof request.profiles === 'object' && request.profiles !== null) {
          const profiles = request.profiles as any;
          parentName = `${profiles?.name || ''} ${profiles?.surname || ''}`.trim() || "Unknown";
          parentImage = profiles?.profile_image;
        }

        return {
          id: request.id,
          parentId: request.parent_id,
          childId: request.child_id,
          pickupAddress: request.pickup_address,
          dropoffAddress: request.dropoff_address,
          pickupTime: request.pickup_time,
          status: "requested" as Ride["status"],
          price: request.price,
          otp: "0000",  // Add a default OTP for available rides to match Ride interface
          childName: request.children ? `${request.children.name || ''} ${request.children.surname || ''}`.trim() : "Unknown",
          schoolName: request.children?.school_name || "Unknown school",
          parentName,
          parentImage
        };
      });

      setRides(transformedRides);
    } catch (err) {
      console.error("Error fetching available rides:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to load available rides");
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  return {
    rides,
    isLoading,
    error,
    fetchAvailableRides
  };
};
