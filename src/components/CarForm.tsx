
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CarFormData {
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  vinNumber: string;
  ownerIdNumber: string;
  id?: string;
}

interface CarFormProps {
  onComplete: (data: CarFormData) => void;
  onCancel: () => void;
  driverIdNumber: string;
  existingCar?: CarFormData;
}

const carSchema = z.object({
  make: z.string().min(2, "Make must be at least 2 characters"),
  model: z.string().min(2, "Model must be at least 2 characters"),
  registrationNumber: z.string().min(5, "Registration number must be at least 5 characters"),
  color: z.string().min(3, "Color must be at least 3 characters"),
  vinNumber: z.string().min(5, "VIN number must be at least 5 characters"),
});

const CarForm: React.FC<CarFormProps> = ({ onComplete, onCancel, driverIdNumber, existingCar }) => {
  const { user } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUpdating = !!existingCar;
  
  const form = useForm<z.infer<typeof carSchema>>({
    resolver: zodResolver(carSchema),
    defaultValues: existingCar || {
      make: "",
      model: "",
      registrationNumber: "",
      color: "",
      vinNumber: "",
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof carSchema>) => {
    if (!user) {
      toast.error("You must be logged in to add a car");
      return;
    }
    
    if (!driverIdNumber) {
      toast.error("Please provide your ID number in your profile first");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isUpdating && existingCar?.id) {
        // Update existing car
        const { error } = await supabase
          .from('cars')
          .update({
            make: values.make,
            model: values.model,
            registration_number: values.registrationNumber,
            color: values.color,
            vin_number: values.vinNumber,
          })
          .eq('id', existingCar.id);
          
        if (error) throw error;
        
        toast.success("Vehicle updated successfully");
      } else {
        // Create new car
        const { error } = await supabase
          .from('cars')
          .insert({
            owner_id: user.id,
            make: values.make,
            model: values.model,
            registration_number: values.registrationNumber,
            color: values.color,
            vin_number: values.vinNumber,
            owner_id_number: driverIdNumber
          });
          
        if (error) throw error;
        
        toast.success("Vehicle added successfully");
      }
      
      const formattedData: CarFormData = {
        make: values.make,
        model: values.model,
        registrationNumber: values.registrationNumber,
        color: values.color,
        vinNumber: values.vinNumber,
        ownerIdNumber: driverIdNumber,
        id: existingCar?.id
      };
      
      onComplete(formattedData);
    } catch (error) {
      console.error("Error saving car:", error);
      toast.error(`Failed to ${isUpdating ? 'update' : 'add'} vehicle`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Make</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Model</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Color</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="registrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Registration Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="vinNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">VIN Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-800 border-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-schoolride-primary hover:bg-schoolride-secondary text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {isUpdating ? "Updating..." : "Adding..."}
              </>
            ) : (
              isUpdating ? "Update Vehicle" : "Add Vehicle"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CarForm;
