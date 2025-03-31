
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRide } from "@/context/RideContext";
import { format } from "date-fns";
import { MapPin, Star } from "lucide-react";

const ParentRideHistory: React.FC = () => {
  const { rides, children } = useRide();
  
  // Filter out active rides
  const completedRides = rides.filter(ride => 
    ride.status === "completed" || ride.status === "cancelled"
  );
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Ride History</h1>
      
      <div className="space-y-4">
        {completedRides.length > 0 ? (
          completedRides.map(ride => {
            const child = children.find(c => c.id === ride.childId);
            return (
              <Card key={ride.id} className="shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(new Date(ride.pickupTime), "dd MMM yyyy")} · {format(new Date(ride.pickupTime), "h:mm a")}
                  </CardTitle>
                  <Badge variant={ride.status === "completed" ? "default" : "destructive"}>
                    {ride.status === "completed" ? "Completed" : "Cancelled"}
                  </Badge>
                </CardHeader>
                <CardContent>
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
                        <div className="text-xs text-muted-foreground">From</div>
                        <div className="text-sm font-medium">
                          <MapPin className="h-3.5 w-3.5 inline mr-1 text-schoolride-primary" />
                          {ride.pickupAddress}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground">To</div>
                        <div className="text-sm font-medium">
                          <MapPin className="h-3.5 w-3.5 inline mr-1 text-schoolride-accent" />
                          {ride.dropoffAddress}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-xs text-muted-foreground">Cost</div>
                      <div className="font-medium">R {ride.price.toFixed(2)}</div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">Child</div>
                      <div className="text-sm font-medium">
                        {child ? `${child.name} ${child.surname}` : "Unknown"}
                      </div>
                      
                      {ride.parentRating && (
                        <div className="flex items-center justify-end mt-2">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">{ride.parentRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No ride history found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ParentRideHistory;
