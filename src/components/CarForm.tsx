
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { carRegistrationSchema } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import { useRide } from "@/context/RideContext";
import { toast } from "sonner";
import { Car } from "@/context/AuthContext";

export interface CarFormData {
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  vinNumber: string;
  ownerIdNumber: string;
}

interface CarFormProps {
  onComplete: (data: CarFormData) => void;
  onCancel: () => void;
  driverIdNumber: string;
}

const CarForm: React.FC<CarFormProps> = ({ onComplete, onCancel, driverIdNumber }) => {
  const { addCar } = useRide();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof carRegistrationSchema>>({
    resolver: zodResolver(carRegistrationSchema),
    defaultValues: {
      make: "",
      model: "",
      registrationNumber: "",
      color: "",
      vinNumber: "",
      ownerIdNumber: driverIdNumber || "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof carRegistrationSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Verify that the owner ID matches the driver ID
      if (values.ownerIdNumber !== driverIdNumber) {
        toast.error("The car owner ID must match your ID number");
        return;
      }
      
      // Ensure all required fields are present
      const carData: CarFormData = {
        make: values.make,
        model: values.model,
        registrationNumber: values.registrationNumber,
        color: values.color,
        vinNumber: values.vinNumber,
        ownerIdNumber: values.ownerIdNumber
      };
      
      await addCar(carData);
      onComplete(carData);
    } catch (error) {
      console.error("Error adding car:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-4">Vehicle Information</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Toyota" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Corolla" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CA123456" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Silver" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="vinNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="17-character VIN number" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ownerIdNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner's ID Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Must match your ID number" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-xs">
                  Must match your ID number used for registration
                </FormMessage>
              </FormItem>
            )}
          />
          
          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Back
            </Button>
            
            <Button
              type="submit"
              className="bg-schoolride-primary hover:bg-schoolride-secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Saving...
                </>
              ) : (
                "Save Vehicle"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CarForm;
