
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRide } from "@/context/RideContext";
import { MapPin, Calendar, Clock, Plus, User, School } from "lucide-react";
import RequestRideForm from "./RequestRideForm";
import CurrentRideCard from "./CurrentRideCard";
import { ScrollArea } from "@/components/ui/scroll-area";

const ParentHome: React.FC = () => {
  const { children, getCurrentRide } = useRide();
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  const currentRide = getCurrentRide();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
      
      {currentRide ? (
        <CurrentRideCard ride={currentRide} />
      ) : showRequestForm ? (
        <RequestRideForm onCancel={() => setShowRequestForm(false)} />
      ) : (
        <Card className="bg-white shadow-sm border-2 border-dashed border-schoolride-primary/20">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="rounded-full bg-schoolride-primary/10 p-3 mb-4">
              <Plus className="h-6 w-6 text-schoolride-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Request a Ride</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Need to get your child to school? Request a ride now and our
              trusted drivers will be there for you.
            </p>
            <Button onClick={() => setShowRequestForm(true)} className="bg-schoolride-primary hover:bg-schoolride-secondary">
              Request Ride
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <User className="w-5 h-5 mr-2 text-schoolride-primary" />
              Your Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 pr-4">
              {children.length > 0 ? (
                <div className="space-y-3">
                  {children.map((child) => (
                    <div key={child.id} className="border rounded-md p-3 bg-gray-50">
                      <div className="font-medium">
                        {child.name} {child.surname}
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {child.idNumber}</div>
                      <div className="flex items-center mt-2 text-sm">
                        <School className="w-3.5 h-3.5 mr-1 text-schoolride-primary" />
                        <span>{child.schoolName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No children added yet</p>
                  <Button variant="link" className="mt-2 text-schoolride-primary">
                    Add Child
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-schoolride-primary" />
              Upcoming Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="font-medium">Tomorrow</div>
                <div className="text-sm flex items-center mt-1">
                  <Clock className="w-3.5 h-3.5 mr-1 text-schoolride-primary" />
                  <span>07:15 AM</span>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-schoolride-primary" />
                  <span>Springfield Elementary School</span>
                </div>
              </div>
              
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="font-medium">Wednesday</div>
                <div className="text-sm flex items-center mt-1">
                  <Clock className="w-3.5 h-3.5 mr-1 text-schoolride-primary" />
                  <span>07:15 AM</span>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-schoolride-primary" />
                  <span>Springfield Elementary School</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-schoolride-primary" />
              Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-schoolride-primary to-schoolride-secondary rounded-lg text-white p-4">
                <div className="text-sm opacity-80">Available Balance</div>
                <div className="text-2xl font-bold mt-1">R 500.00</div>
                <div className="flex justify-between mt-4">
                  <div className="text-xs opacity-80">SchoolRide Wallet</div>
                  <div className="text-xs">**** 4328</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full text-schoolride-primary border-schoolride-primary">
                Top Up Balance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentHome;
