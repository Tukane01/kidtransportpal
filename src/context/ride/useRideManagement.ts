
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ride, RideRequest } from "./types";

export const useRideManagement = (profile: any, updateRidesState: (rideId: string, status: Ride["status"], location?: any) => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createRideRequest = useCallback(async (rideData: any) => {
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

  const acceptRideRequest = useCallback(async (requestId: string, driverId: string) => {
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

  const updateRideStatus = useCallback(async (rideId: string, status: Ride["status"], location = null) => {
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
        updateRidesState(rideId, status, location);
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
  }, [updateRidesState]);

  const rateRide = useCallback(async (rideId: string, rating: number, comment: string, isParent: boolean) => {
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

  return {
    isLoading,
    error,
    createRideRequest,
    requestRide,
    acceptRideRequest,
    updateRideStatus,
    rateRide
  };
};
