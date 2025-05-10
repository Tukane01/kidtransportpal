import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRide } from "@/context/ride";
import { Car, Clock, MapPin, Star, Wallet } from "lucide-react";
import DriverCurrentRide from "./DriverCurrentRide";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const DriverHome: React.FC = () => {
  const { currentUser } = useAuth();
  const { rides, cars, updateRideStatus, getCurrentRide } = useRide();
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  
  const currentRide = getCurrentRide();
  
  // Get available rides (status: requested and no driver assigned)
  const availableRides = rides.filter(
    ride => ride.status === "requested" && !ride.driverId
  );
  
  const handleAcceptRide = async (rideId: string) => {
    setIsAccepting(rideId);
    
    try {
      const success = await updateRideStatus(rideId, "accepted");
      
      if (success) {
        toast.success("Ride accepted");
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
      toast.error("Failed to accept ride");
    } finally {
      setIsAccepting(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Driver Dashboard</h1>
      
      {currentRide ? (
        <DriverCurrentRide ride={currentRide} />
      ) : (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-4">
                  <Car className="h-8 w-8 text-schoolride-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium">Ready to Drive</h3>
                  <p className="text-muted-foreground">
                    You're online and ready to accept rides
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <div className="text-sm text-muted-foreground">Today's Earnings</div>
                  <div className="text-xl font-bold">R 0.00</div>
                </div>
                <Button size="lg" variant="outline" className="border-red-300 text-red-500">
                  Go Offline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-schoolride-primary" />
                Available Ride Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px] pr-4">
                {availableRides.length > 0 ? (
                  <div className="space-y-4">
                    {availableRides.map((ride) => (
                      <div key={ride.id} className="border rounded-md p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">
                            {format(new Date(ride.pickupTime), "dd MMM yyyy")} · {format(new Date(ride.pickupTime), "h:mm a")}
                          </div>
                          <Badge>R {ride.price.toFixed(2)}</Badge>
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
                          
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="text-xs text-muted-foreground">Pickup</div>
                              <div className="text-sm font-medium">
                                <MapPin className="h-3.5 w-3.5 inline mr-1 text-schoolride-primary" />
                                {ride.pickupAddress}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-muted-foreground">Drop-off</div>
                              <div className="text-sm font-medium">
                                <MapPin className="h-3.5 w-3.5 inline mr-1 text-schoolride-accent" />
                                {ride.dropoffAddress}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t flex justify-end">
                          <Button 
                            className="bg-schoolride-primary hover:bg-schoolride-secondary"
                            onClick={() => handleAcceptRide(ride.id)}
                            disabled={!!isAccepting}
                          >
                            {isAccepting === ride.id ? "Accepting..." : "Accept Ride"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No ride requests</h3>
                    <p className="text-muted-foreground">
                      New ride requests will appear here when available
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-schoolride-primary" />
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-schoolride-primary to-schoolride-secondary rounded-lg text-white p-4">
                  <div className="text-sm opacity-80">Available Balance</div>
                  <div className="text-2xl font-bold mt-1">
                    R {currentUser?.walletBalance || 0}.00
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-3 bg-gray-50 text-center">
                    <div className="text-xs text-muted-foreground">This Week</div>
                    <div className="text-lg font-bold">R 0.00</div>
                  </div>
                  
                  <div className="border rounded-md p-3 bg-gray-50 text-center">
                    <div className="text-xs text-muted-foreground">This Month</div>
                    <div className="text-lg font-bold">R 0.00</div>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  View Earnings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Car className="w-5 h-5 mr-2 text-schoolride-primary" />
                Your Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cars.length > 0 ? (
                <div className="space-y-4">
                  {cars.map((car) => (
                    <div key={car.id} className="border rounded-md p-4 bg-gray-50">
                      <div className="font-medium">
                        {car.make} {car.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {car.color} · {car.registrationNumber}
                      </div>
                      <div className="mt-3 flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4" />
                        <span className="ml-2 text-sm">4.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No vehicles added</p>
                  <Button variant="link" className="mt-2">
                    Add Vehicle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverHome;
