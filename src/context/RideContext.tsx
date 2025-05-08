
import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSupabaseAuth } from "./SupabaseAuthContext";
import { Ride, RideRequest, Child, Car } from "@/types/ride";

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

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [rideChildren, setRideChildren] = useState<Child[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useSupabaseAuth();

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
      const transformedRides = data.map(ride => ({
        id: ride.id,
        parentId: ride.parent_id,
        driverId: ride.driver_id,
        childId: ride.child_id,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        pickupTime: ride.pickup_time,
        dropoffTime: ride.dropoff_time,
        status: ride.status,
        price: ride.price,
        childName: ride.children ? `${ride.children.name} ${ride.children.surname}` : "Unknown",
        driverName: ride.profiles ? `${ride.profiles.name} ${ride.profiles.surname}` : "Not assigned",
        driverImage: ride.profiles?.profile_image || null,
        otp: ride.otp,
        driverLocation: ride.driver_location
      }));

      setRides(transformedRides);
    } catch (err) {
      console.error("Error fetching rides by parent ID:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to load rides");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      const transformedRides = data.map(ride => ({
        id: ride.id,
        parentId: ride.parent_id,
        driverId: ride.driver_id,
        childId: ride.child_id,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        pickupTime: ride.pickup_time,
        dropoffTime: ride.dropoff_time,
        status: ride.status,
        price: ride.price,
        childName: ride.children ? `${ride.children.name} ${ride.children.surname}` : "Unknown",
        parentName: ride.profiles ? `${ride.profiles.name} ${ride.profiles.surname}` : "Unknown",
        parentImage: ride.profiles?.profile_image || null,
        parentPhone: ride.profiles?.phone || null,
        otp: ride.otp,
        driverLocation: ride.driver_location,
        carDetails: transformedCars.length > 0 ? 
          `${transformedCars[0].make} ${transformedCars[0].model} · ${transformedCars[0].color}` : 
          "Vehicle details"
      }));

      setRides(transformedRides);
    } catch (err) {
      console.error("Error fetching rides by driver ID:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to load rides");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableRides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only drivers should see available rides
      if (profile?.role !== 'driver') {
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
      const transformedRides = data.map(request => ({
        id: request.id,
        parentId: request.parent_id,
        childId: request.child_id,
        pickupAddress: request.pickup_address,
        dropoffAddress: request.dropoff_address,
        pickupTime: request.pickup_time,
        status: request.status,
        price: request.price,
        childName: request.children ? `${request.children.name} ${request.children.surname}` : "Unknown",
        schoolName: request.children?.school_name || "Unknown school",
        parentName: request.profiles ? `${request.profiles.name} ${request.profiles.surname}` : "Unknown",
        parentImage: request.profiles?.profile_image || null
      }));

      setRides(transformedRides);
    } catch (err) {
      console.error("Error fetching available rides:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to load available rides");
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const createRideRequest = useCallback(async (rideData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Insert into ride_requests table
      const { data, error } = await supabase
        .from('ride_requests')
        .insert({
          parent_id: rideData.parentId,
          child_id: rideData.childId,
          pickup_address: rideData.pickupAddress,
          dropoff_address: rideData.dropoffAddress,
          pickup_time: rideData.pickupTime,
          price: rideData.price || 150, // Default price if not provided
          status: 'requested'
        })
        .select();

      if (error) throw error;

      toast.success("Ride request created successfully!");
      return data[0];
    } catch (err) {
      console.error("Error creating ride request:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to create ride request");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestRide = useCallback(async (rideRequest: RideRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const price = rideRequest.price || 150; // Default price if not provided
      
      const result = await createRideRequest({
        parentId: profile?.id,
        childId: rideRequest.childId,
        pickupAddress: rideRequest.pickupAddress,
        dropoffAddress: rideRequest.dropoffAddress,
        pickupTime: rideRequest.pickupTime.toISOString(),
        price: price
      });
      
      return !!result;
    } catch (error) {
      console.error("Error requesting ride:", error);
      toast.error("Failed to request ride");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createRideRequest, profile]);

  const acceptRideRequest = useCallback(async (requestId, driverId) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, update the request status
      const { data: requestData, error: requestError } = await supabase
        .from('ride_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select();

      if (requestError) throw requestError;
      if (!requestData || requestData.length === 0) throw new Error("Request not found");

      const request = requestData[0];

      // Generate a random 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Create a new ride based on the request
      const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .insert({
          request_id: requestId,
          driver_id: driverId,
          parent_id: request.parent_id,
          child_id: request.child_id,
          pickup_address: request.pickup_address,
          dropoff_address: request.dropoff_address,
          pickup_time: request.pickup_time,
          status: 'accepted',
          price: request.price,
          otp: otp
        })
        .select();

      if (rideError) throw rideError;

      // Create notification for the parent
      await supabase
        .from('notifications')
        .insert({
          user_id: request.parent_id,
          title: 'Ride Accepted',
          message: 'A driver has accepted your ride request.',
          type: 'ride_accepted',
          reference_id: rideData[0].id,
          reference_type: 'ride'
        });

      toast.success("Ride request accepted successfully!");
      return rideData[0];
    } catch (err) {
      console.error("Error accepting ride request:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to accept ride request");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRideStatus = useCallback(async (rideId, status, location = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const updateData: any = { status };
      if (location) {
        updateData.driver_location = location;
      }

      if (status === 'completed') {
        updateData.dropoff_time = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('rides')
        .update(updateData)
        .eq('id', rideId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Create a notification for the parent
        let notificationTitle = '';
        let notificationMessage = '';
        
        switch (status) {
          case 'inProgress':
            notificationTitle = 'Ride Started';
            notificationMessage = 'Your child\'s ride has started.';
            break;
          case 'completed':
            notificationTitle = 'Ride Completed';
            notificationMessage = 'Your child\'s ride has been completed.';
            break;
          case 'cancelled':
            notificationTitle = 'Ride Cancelled';
            notificationMessage = 'Your scheduled ride has been cancelled.';
            break;
        }

        if (notificationTitle) {
          await supabase
            .from('notifications')
            .insert({
              user_id: data[0].parent_id,
              title: notificationTitle,
              message: notificationMessage,
              type: `ride_${status}`,
              reference_id: rideId,
              reference_type: 'ride'
            });
        }

        // If ride is completed, add payment to driver's wallet
        if (status === 'completed') {
          const { data: rideData } = await supabase
            .from('rides')
            .select('price, driver_id')
            .eq('id', rideId)
            .single();

          if (rideData && rideData.driver_id) {
            // Add transaction record
            await supabase
              .from('transactions')
              .insert({
                user_id: rideData.driver_id,
                type: 'ride_payment',
                amount: rideData.price,
                reference_id: rideId,
                reference_type: 'ride',
                description: `Payment for ride ${rideId}`
              });

            // Update driver's wallet balance manually since we can't use rpc
            const { data: profileData } = await supabase
              .from('profiles')
              .select('wallet_balance')
              .eq('id', rideData.driver_id)
              .single();
              
            if (profileData) {
              await supabase
                .from('profiles')
                .update({ 
                  wallet_balance: profileData.wallet_balance + rideData.price 
                })
                .eq('id', rideData.driver_id);
            }
          }
        }

        toast.success(`Ride status updated to ${status}`);

        // Update local state with the new ride status
        setRides(prevRides => 
          prevRides.map(ride => 
            ride.id === rideId 
              ? { ...ride, status, ...(location && { driverLocation: location }) }
              : ride
          )
        );
      }

      return data?.[0] || null;
    } catch (err) {
      console.error("Error updating ride status:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to update ride status");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rateRide = useCallback(async (rideId, rating, comment, isParent) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get ride details to make sure the user has permission to rate
      const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .select('parent_id, driver_id')
        .eq('id', rideId)
        .single();

      if (rideError) throw rideError;

      // Check if rating exists
      const { data: existingRating, error: ratingCheckError } = await supabase
        .from('ratings')
        .select('*')
        .eq('ride_id', rideId)
        .maybeSingle();
      
      if (ratingCheckError) throw ratingCheckError;

      let ratingData;
      if (existingRating) {
        // Update existing rating
        const updateData = isParent 
          ? { parent_rating: rating, parent_comment: comment }
          : { driver_rating: rating, driver_comment: comment };
        
        const { data, error } = await supabase
          .from('ratings')
          .update(updateData)
          .eq('id', existingRating.id)
          .select();
        
        if (error) throw error;
        ratingData = data;
      } else {
        // Create new rating
        const newRating = {
          ride_id: rideId,
          parent_id: rideData.parent_id,
          driver_id: rideData.driver_id,
          ...(isParent ? { parent_rating: rating, parent_comment: comment } : { driver_rating: rating, driver_comment: comment })
        };
        
        const { data, error } = await supabase
          .from('ratings')
          .insert(newRating)
          .select();
        
        if (error) throw error;
        ratingData = data;
      }

      toast.success("Rating submitted successfully");
      return ratingData;
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to submit rating");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get the current active ride
  const getCurrentRide = useCallback(() => {
    // Find the first ride with status "accepted" or "inProgress"
    const currentRide = rides.find(ride => 
      ride.status === "accepted" || ride.status === "inProgress"
    );
    
    return currentRide || null;
  }, [rides]);

  const value = {
    rides,
    children: rideChildren,
    cars,
    isLoading,
    error,
    fetchRidesByParentId,
    fetchRidesByDriverId,
    fetchAvailableRides,
    requestRide,
    createRideRequest,
    acceptRideRequest,
    updateRideStatus,
    rateRide,
    getCurrentRide
  };

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error("useRide must be used within a RideProvider");
  }
  return context;
};

export { type Child, type Ride, type Car, type RideRequest };
