
import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSupabaseAuth } from "./SupabaseAuthContext";

interface RideContextType {
  rides: any[];
  isLoading: boolean;
  error: Error | null;
  fetchRidesByParentId: (parentId: string) => Promise<void>;
  fetchRidesByDriverId: (driverId: string) => Promise<void>;
  fetchAvailableRides: () => Promise<void>;
  createRideRequest: (rideData: any) => Promise<any>;
  acceptRideRequest: (requestId: string, driverId: string) => Promise<any>;
  updateRideStatus: (rideId: string, status: string, location?: any) => Promise<any>;
  rateRide: (rideId: string, rating: number, comment: string, isParent: boolean) => Promise<any>;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useSupabaseAuth();

  const fetchRidesByParentId = useCallback(async (parentId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          child_id (name, surname),
          driver_id:profiles!rides_driver_id_fkey (name, surname, profile_image)
        `)
        .eq('parent_id', parentId)
        .order('pickup_time', { ascending: false });

      if (error) throw error;

      // Transform database data to match component expectations
      const transformedRides = data.map(ride => ({
        id: ride.id,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        pickupTime: ride.pickup_time,
        dropoffTime: ride.dropoff_time,
        status: ride.status,
        price: ride.price,
        childName: ride.child_id ? `${ride.child_id.name} ${ride.child_id.surname}` : "Unknown",
        driverName: ride.driver_id ? `${ride.driver_id.name} ${ride.driver_id.surname}` : "Not assigned",
        driverImage: ride.driver_id?.profile_image || null,
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

      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          child_id (name, surname),
          parent_id:profiles!rides_parent_id_fkey (name, surname, profile_image, phone)
        `)
        .eq('driver_id', driverId)
        .order('pickup_time', { ascending: false });

      if (error) throw error;

      // Transform database data to match component expectations
      const transformedRides = data.map(ride => ({
        id: ride.id,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        pickupTime: ride.pickup_time,
        dropoffTime: ride.dropoff_time,
        status: ride.status,
        price: ride.price,
        childName: ride.child_id ? `${ride.child_id.name} ${ride.child_id.surname}` : "Unknown",
        parentName: ride.parent_id ? `${ride.parent_id.name} ${ride.parent_id.surname}` : "Unknown",
        parentImage: ride.parent_id?.profile_image || null,
        parentPhone: ride.parent_id?.phone || null,
        otp: ride.otp,
        driverLocation: ride.driver_location,
        carDetails: "Vehicle details" // Placeholder, will need to link to driver's car
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
          parent_id:profiles!ride_requests_parent_id_fkey (name, surname, profile_image),
          child_id (name, surname, school_name)
        `)
        .eq('status', 'requested')
        .order('pickup_time', { ascending: true });

      if (error) throw error;

      // Transform database data to match component expectations
      const transformedRides = data.map(request => ({
        id: request.id,
        pickupAddress: request.pickup_address,
        dropoffAddress: request.dropoff_address,
        pickupTime: request.pickup_time,
        status: request.status,
        price: request.price,
        childName: request.child_id ? `${request.child_id.name} ${request.child_id.surname}` : "Unknown",
        schoolName: request.child_id?.school_name || "Unknown school",
        parentName: request.parent_id ? `${request.parent_id.name} ${request.parent_id.surname}` : "Unknown",
        parentImage: request.parent_id?.profile_image || null
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
          price: rideData.price,
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

            // Update driver's wallet balance
            await supabase.rpc('increment_wallet', { 
              user_id: rideData.driver_id, 
              amount: rideData.price 
            });
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

  const value = {
    rides,
    isLoading,
    error,
    fetchRidesByParentId,
    fetchRidesByDriverId,
    fetchAvailableRides,
    createRideRequest,
    acceptRideRequest,
    updateRideStatus,
    rateRide
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
