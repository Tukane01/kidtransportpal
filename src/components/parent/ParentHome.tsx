
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Child {
  id: string;
  name: string;
  surname: string;
  schoolName: string;
  schoolAddress: string;
}

interface Ride {
  id: string;
  driverName: string;
  childName: string;
  date: string;
  time: string;
  status: "scheduled" | "inProgress" | "completed" | "cancelled";
  pickupLocation: string;
  dropoffLocation: string;
}

const ParentHome: React.FC = () => {
  const { currentUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (currentUser?.id) {
          // Fetch children data
          const { data: childrenData, error: childrenError } = await supabase
            .from('children')
            .select('id, name, surname, school_name, school_address')
            .eq('parent_id', currentUser.id);
            
          if (childrenError) {
            console.error("Error fetching children:", childrenError);
            toast.error("Failed to load children data");
          } else if (childrenData) {
            // Transform snake_case to camelCase
            const formattedChildren = childrenData.map(child => ({
              id: child.id,
              name: child.name,
              surname: child.surname,
              schoolName: child.school_name,
              schoolAddress: child.school_address
            }));
            setChildren(formattedChildren);
          }
          
          // For now, we'll use mock ride data since we don't have a rides table yet
          // This can be replaced with real data later
          setRides([
            {
              id: "ride-1",
              driverName: "Available Driver",
              childName: childrenData?.[0]?.name || "Your Child",
              date: new Date().toLocaleDateString(),
              time: "07:30",
              status: "scheduled",
              pickupLocation: "Home Address",
              dropoffLocation: childrenData?.[0]?.school_name || "School"
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An error occurred while loading your data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser?.id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-schoolride-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black font-heading">Welcome, {currentUser?.name || "User"}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white text-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-black">Upcoming Rides</CardTitle>
          </CardHeader>
          <CardContent>
            {rides.length > 0 ? (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <div key={ride.id} className="border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-black">{ride.childName}</div>
                        <div className="text-sm text-gray-600">with {ride.driverName}</div>
                      </div>
                      <Badge variant={ride.status === "scheduled" ? "outline" : "default"}>
                        {ride.status === "scheduled" ? "Scheduled" : "In Progress"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-black">{ride.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-black">{ride.time}</span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600">Pickup</div>
                          <div className="text-sm text-black">{ride.pickupLocation}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-600">Dropoff</div>
                          <div className="text-sm text-black">{ride.dropoffLocation}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full text-black border-gray-300">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">No upcoming rides</p>
                <Button variant="outline" className="mt-2 text-black border-gray-300">
                  Schedule a Ride
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-black">Your Children</CardTitle>
          </CardHeader>
          <CardContent>
            {children.length > 0 ? (
              <div className="space-y-4">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between border rounded-md p-4 bg-gray-50">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-schoolride-primary text-white">{child.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="font-medium text-black">
                          {child.name} {child.surname}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <School className="h-3 w-3 mr-1" /> {child.schoolName}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-black">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">No children found</p>
                <Button variant="outline" className="mt-2 text-black border-gray-300">
                  Add Child
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-black">User Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                <AvatarFallback className="text-xl bg-schoolride-primary text-white">
                  {currentUser?.name?.charAt(0) || 'U'}{currentUser?.surname?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-3 text-center md:text-left">
                <div>
                  <h3 className="text-xl font-bold text-black">{currentUser?.name} {currentUser?.surname}</h3>
                  <p className="text-gray-600">{currentUser?.email}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-center md:justify-start">
                    <span className="font-medium text-black">Phone:</span>
                    <span className="ml-2 text-gray-700">{currentUser?.phone || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <span className="font-medium text-black">ID Number:</span>
                    <span className="ml-2 text-gray-700">{currentUser?.idNumber || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <span className="font-medium text-black">Role:</span>
                    <span className="ml-2 text-gray-700">{currentUser?.role || "Parent"}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <span className="font-medium text-black">Wallet Balance:</span>
                    <span className="ml-2 text-gray-700">R {currentUser?.walletBalance?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="bg-gray-200" />
            
            <Button 
              variant="outline" 
              className="w-full md:w-auto text-black border-gray-300"
              onClick={() => toast.success("Redirecting to profile page...")}
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentHome;
