import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  DollarSign, 
  MapPin, 
  Plus, 
  School, 
  User 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Create a WalletCard component to replace the missing Wallet reference
const WalletCard = () => {
  const { currentUser } = useAuth();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
          <span className="text-2xl font-bold">
            R {currentUser?.walletBalance.toFixed(2)}
          </span>
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          <CreditCard className="mr-2 h-4 w-4" /> Top Up Balance
        </Button>
      </CardContent>
    </Card>
  );
};

const ParentHome: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Mock data for upcoming rides
  const upcomingRides = [
    {
      id: "ride-1",
      driverName: "Sarah Driver",
      childName: "Emma Parent",
      date: "2023-06-15",
      time: "07:30",
      status: "scheduled",
      pickupLocation: "123 Home Street",
      dropoffLocation: "ABC Primary School"
    },
    {
      id: "ride-2",
      driverName: "John Driver",
      childName: "Emma Parent",
      date: "2023-06-15",
      time: "14:30",
      status: "scheduled",
      pickupLocation: "ABC Primary School",
      dropoffLocation: "123 Home Street"
    }
  ];
  
  // Mock data for children
  const children = [
    {
      id: "child-1",
      name: "Emma",
      surname: "Parent",
      schoolName: "ABC Primary School",
      grade: "Grade 3"
    }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Welcome, {currentUser?.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Upcoming Rides</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingRides.length > 0 ? (
                <div className="space-y-4">
                  {upcomingRides.map((ride) => (
                    <div key={ride.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{ride.childName}</div>
                          <div className="text-sm text-muted-foreground">with {ride.driverName}</div>
                        </div>
                        <Badge variant={ride.status === "scheduled" ? "outline" : "default"}>
                          {ride.status === "scheduled" ? "Scheduled" : "In Progress"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">{ride.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">{ride.time}</span>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">Pickup</div>
                            <div className="text-sm">{ride.pickupLocation}</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                          <div>
                            <div className="text-xs text-muted-foreground">Dropoff</div>
                            <div className="text-sm">{ride.dropoffLocation}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No upcoming rides</p>
                  <Button variant="outline" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Schedule a Ride
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">My Children</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Child
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between border rounded-md p-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="font-medium">
                            {child.name} {child.surname}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <School className="h-3 w-3 mr-1" /> {child.schoolName} · {child.grade}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No children added yet</p>
                  <Button variant="outline" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Child
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                  <AvatarFallback className="text-xl">
                    {currentUser?.name?.charAt(0)}{currentUser?.surname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 text-center">
                  <div className="font-medium text-lg">
                    {currentUser?.name} {currentUser?.surname}
                  </div>
                  <div className="text-sm text-muted-foreground">{currentUser?.email}</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-sm">{currentUser?.phone || "No phone number"}</div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-sm">{"Home address not set"}</div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <WalletCard />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" /> Schedule New Ride
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" /> Update Home Address
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <School className="mr-2 h-4 w-4" /> Update School Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentHome;
