
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, MapPin, Home, School } from "lucide-react";
import { useRide, RideRequest } from "@/context/RideContext";

const requestRideSchema = z.object({
  childId: z.string().min(1, "Please select a child"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  dropoffAddress: z.string().min(5, "Drop-off address is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
});

interface RequestRideFormProps {
  onCancel: () => void;
}

const RequestRideForm: React.FC<RequestRideFormProps> = ({ onCancel }) => {
  const { children, requestRide } = useRide();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof requestRideSchema>>({
    resolver: zodResolver(requestRideSchema),
    defaultValues: {
      childId: "",
      pickupAddress: "",
      dropoffAddress: "",
      pickupTime: "",
      pickupDate: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof requestRideSchema>) => {
    setIsLoading(true);
    
    try {
      const pickupDateTime = new Date(`${values.pickupDate}T${values.pickupTime}`);
      
      // Check if pickup time is in the future
      if (pickupDateTime < new Date()) {
        form.setError("pickupTime", { 
          type: "manual", 
          message: "Pickup time must be in the future" 
        });
        return;
      }
      
      const child = children.find(c => c.id === values.childId);
      
      const success = await requestRide({
        childId: values.childId,
        pickupAddress: values.pickupAddress,
        dropoffAddress: values.dropoffAddress || (child ? child.schoolAddress : ""),
        pickupTime: pickupDateTime,
      });
      
      if (success) {
        onCancel();
      }
    } catch (error) {
      console.error("Error requesting ride:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fill school address when selecting a child
  const handleChildChange = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      form.setValue("dropoffAddress", child.schoolAddress);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          Request a Ride
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="childId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Child</FormLabel>
                  <Select
                    disabled={isLoading || children.length === 0}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleChildChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a child" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {children.length > 0 ? (
                        children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name} {child.surname}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No children added
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <div className="rounded-md border p-4 bg-gray-50">
              <div className="flex items-start">
                <div className="mr-3 flex flex-col items-center">
                  <div className="rounded-full w-6 h-6 bg-schoolride-primary flex items-center justify-center text-white">
                    <Home className="h-3 w-3" />
                  </div>
                  <div className="h-12 w-0.5 bg-gray-300 my-1"></div>
                  <div className="rounded-full w-6 h-6 bg-schoolride-accent flex items-center justify-center text-white">
                    <School className="h-3 w-3" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                  <FormField
                    control={form.control}
                    name="pickupAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          Pickup Address
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pickup address" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dropoffAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          Drop-off Address (School)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter school address" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pickupTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="flex-1 bg-schoolride-primary hover:bg-schoolride-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Requesting...
                  </>
                ) : (
                  "Request Ride"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RequestRideForm;
