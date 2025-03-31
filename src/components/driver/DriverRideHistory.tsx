
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRide } from "@/context/RideContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DriverRideHistory: React.FC = () => {
  const { rides } = useRide();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Get only the rides for the current driver (in a real app, we'd filter by driverId)
  const driverRides = rides.filter(ride => ride.driverId);
  
  const filteredRides = driverRides.filter(ride => {
    const matchesSearch = 
      ride.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ride.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ? true : ride.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const completedRides = filteredRides.filter(ride => ride.status === "completed");
  const pendingRides = filteredRides.filter(ride => ["accepted", "inProgress"].includes(ride.status));
  
  const renderRideItem = (ride: typeof rides[0]) => {
    const rideDate = new Date(ride.pickupTime);
    
    return (
      <div key={ride.id} className="border rounded-md p-4 bg-gray-50 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">
              {format(rideDate, "dd MMM yyyy")}
            </span>
            <Clock className="h-4 w-4 text-muted-foreground ml-3 mr-1" />
            <span className="text-sm text-muted-foreground">
              {format(rideDate, "h:mm a")}
            </span>
          </div>
          <Badge
            className={
              ride.status === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
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
        
        <div className="mt-4 pt-3 border-t flex justify-between items-center">
          <div className="font-medium">R {ride.price.toFixed(2)}</div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Ride History</h1>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Your Rides</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <Input 
                placeholder="Search rides..." 
                className="md:w-60" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Rides</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {filteredRides.length > 0 ? (
                filteredRides.map(renderRideItem)
              ) : (
                <div className="text-center py-8">
                  <h3 className="font-medium text-lg mb-2">No rides found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedRides.length > 0 ? (
                completedRides.map(renderRideItem)
              ) : (
                <div className="text-center py-8">
                  <h3 className="font-medium text-lg mb-2">No completed rides</h3>
                  <p className="text-muted-foreground">
                    Rides you complete will appear here
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingRides.length > 0 ? (
                pendingRides.map(renderRideItem)
              ) : (
                <div className="text-center py-8">
                  <h3 className="font-medium text-lg mb-2">No pending rides</h3>
                  <p className="text-muted-foreground">
                    Rides in progress will appear here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverRideHistory;
