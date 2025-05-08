
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRide } from "@/context/RideContext";
import { Ride } from "@/types/ride"; 
import { Clock, MapPin, Phone, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CurrentRideCardProps {
  ride: Ride;
}

const CurrentRideCard: React.FC<CurrentRideCardProps> = ({ ride }) => {
  const { updateRideStatus, children } = useRide();

  const child = children.find(c => c.id === ride.childId);

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
        return "Driver assigned";
      case "inProgress":
        return "In progress";
      case "requested":
        return "Finding driver";
      default:
        return ride.status;
    }
  };

  const handleCancelRide = () => {
    updateRideStatus(ride.id, "cancelled");
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
              })}{" "}
              ({formatDistanceToNow(new Date(ride.pickupTime), { addSuffix: true })})
            </div>
          </div>
        </div>

        <div className="rounded-md border p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">Journey Details</div>
            <Badge variant="outline" className="text-schoolride-accent">
              OTP: {ride.otp}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Child</div>
            <div className="font-medium">
              {child ? `${child.name} ${child.surname}` : "Child information"}
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="font-medium">R {ride.price.toFixed(2)}</div>
          </div>
        </div>

        {ride.status === "inProgress" && (
          <div className="rounded-md border border-green-200 bg-green-50 p-4">
            <div className="font-medium text-green-800">Ride in progress</div>
            <div className="text-sm text-green-700">
              Your child is on the way to {ride.dropoffAddress}
            </div>
          </div>
        )}
      </CardContent>

      <Separator />

      {ride.driverId && (
        <CardFooter className="pt-4">
          <div className="w-full">
            <div className="font-medium mb-3">Driver</div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200">
                  {/* Driver Avatar would go here */}
                </div>
                <div className="ml-3">
                  <div className="font-medium">Sarah Driver</div>
                  <div className="text-sm text-muted-foreground">
                    Toyota Corolla · Silver · CA123456
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {ride.status === "accepted" && (
              <Button
                variant="outline"
                className="w-full mt-4 text-red-500 border-red-200"
                onClick={handleCancelRide}
              >
                Cancel Ride
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CurrentRideCard;
