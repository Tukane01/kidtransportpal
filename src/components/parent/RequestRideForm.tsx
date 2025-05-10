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
import { useRide, RideRequest } from "@/context/ride";

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
        setIsLoading(false);
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
    <div></div>
  );
};

export default RequestRideForm;
