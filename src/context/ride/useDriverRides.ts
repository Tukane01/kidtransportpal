
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ride, Car } from "./types";

export const useDriverRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRidesByDriverId = useCallback(async (driverId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch cars for the driver
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .eq('owner_id', driverId);

      if (carsError) throw carsError;

      const transformedCars = carsData.map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        color: car.color,
        registrationNumber: car.registration_number
      }));

      setCars(transformedCars);

      // Fetch rides with joined data
      const { data, error: ridesError } = await supabase
        .from('rides')
        .select(`
          *,
          profiles!rides_parent_id_fkey (name, surname, profile_image, phone),
          children:child_id (name, surname)
        `)
        .eq('driver_id', driverId)
        .order('pickup_time', { ascending: false });

      if (ridesError) throw ridesError;

      // Transform database data to match component expectations
      const transformedRides = data.map(ride => {
        // Check if profiles exists and is a valid object before accessing properties
        let parentName = "Unknown";
        let parentImage = null;
        let parentPhone = null;
        
        // Handle potentially null or error profiles data safely
        if (ride.profiles && typeof ride.profiles === 'object' && ride.profiles !== null) {
          const profiles = ride.profiles as any;
          parentName = `${profiles?.name || ''} ${profiles?.surname || ''}`.trim() || "Unknown";
          parentImage = profiles?.profile_image;
          parentPhone = profiles?.phone;
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
          parentName,
          parentImage,
          parentPhone,
          otp: ride.otp || "0000",
          driverLocation: ride.driver_location,
          carDetails: transformedCars.length > 0 ? 
            `${transformedCars[0].make} ${transformedCars[0].model} · ${transformedCars[0].color}` : 
            "Vehicle details"
        };
      });

      setRides(transformedRides);
    } catch (err) {
      console.error("Error fetching rides by driver ID:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to load rides");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rides,
    cars,
    isLoading,
    error,
    fetchRidesByDriverId
  };
};
