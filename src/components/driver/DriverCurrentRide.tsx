
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRide, Ride } from "@/context/RideContext";
import { Clock, MapPin, Phone, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { otpSchema } from "@/utils/validation";

interface DriverCurrentRideProps {
  ride: Ride;
}

const DriverCurrentRide: React.FC<DriverCurrentRideProps> = ({ ride }) => {
  const { updateRideStatus } = useRide();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  
  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(z.object({ otp: otpSchema })),
    defaultValues: {
      otp: "",
    },
  });
  
  const handleUpdateStatus = async (status: Ride["status"]) => {
    setIsLoading(true);
    
    try {
      const success = await updateRideStatus(ride.id, status);
      
      if (success) {
        if (status === "inProgress") {
          toast.success("Ride started");
        } else if (status === "completed") {
          toast.success("Ride completed");
        }
        setShowOTPDialog(false);
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
      toast.error("Failed to update ride");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOTP = async (values: { otp: string }) => {
    if (values.otp === ride.otp) {
      await handleUpdateStatus("inProgress");
    } else {
      otpForm.setError("otp", { 
        type: "manual", 
        message: "Invalid OTP. Please check with the parent" 
      });
    }
  };
  
  const getRideStatusColor = () => {
    switch (ride.status) {
      case "accepted":
        return "bg-yellow-500";
      case "inProgress":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };
  
  const getRideStatusText = () => {
    switch (ride.status) {
      case "accepted":
        return "Accepted";
      case "inProgress":
        return "In progress";
      default:
        return ride.status;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Current Ride</CardTitle>
          <Badge className={getRideStatusColor()}>{getRideStatusText()}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-schoolride-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-schoolride-primary" />
          </div>
          <div className="ml-3">
            <div className="text-sm text-muted-foreground">Pickup Time</div>
            <div className="font-medium">
              {new Date(ride.pickupTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
        
        <div className="rounded-md border p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">Journey Details</div>
            <Badge variant="secondary" className="bg-schoolride-primary/10 text-schoolride-primary">
              R{ride.price.toFixed(2)}
            </Badge>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 flex flex-col items-center">
              <div className="rounded-full w-6 h-6 bg-schoolride-primary flex items-center justify-center text-white">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
              <div className="h-12 w-0.5 bg-gray-300 my-1"></div>
              <div className="rounded-full w-6 h-6 bg-schoolride-accent flex items-center justify-center text-white">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="text-sm text-muted-foreground">Pickup</div>
                <div className="font-medium flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-schoolride-primary" />
                  {ride.pickupAddress}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Drop-off</div>
                <div className="font-medium flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-schoolride-accent" />
                  {ride.dropoffAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Contact Parent</div>
              <div className="text-sm text-muted-foreground">
                Need to reach the parent?
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-full">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-full">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-end gap-3">
          {ride.status === "accepted" ? (
            <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
              <DialogTrigger asChild>
                <Button className="bg-schoolride-primary hover:bg-schoolride-secondary">
                  Start Trip
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter OTP to Start Trip</DialogTitle>
                  <DialogDescription>
                    Ask the parent or child for the one-time password to begin the journey
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter OTP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="6-digit code"
                              {...field}
                              disabled={isLoading}
                              maxLength={6}
                              className="text-center text-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowOTPDialog(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-schoolride-primary hover:bg-schoolride-secondary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Verifying...
                          </>
                        ) : (
                          "Verify & Start"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : ride.status === "inProgress" ? (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleUpdateStatus("completed")}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Completing...
                </>
              ) : (
                "Complete Trip"
              )}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverCurrentRide;
