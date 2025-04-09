import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { childRegistrationSchema } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import { useRide } from "@/context/RideContext";

// Define the Child interface
export interface ChildFormData {
  name: string;
  surname: string;
  idNumber: string;
  schoolName: string;
  schoolAddress: string;
}

interface ChildFormProps {
  onComplete: (data: ChildFormData) => void;
  onCancel: () => void;
}

const ChildForm: React.FC<ChildFormProps> = ({ onComplete, onCancel }) => {
  const { addChild } = useRide();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof childRegistrationSchema>>({
    resolver: zodResolver(childRegistrationSchema),
    defaultValues: {
      name: "",
      surname: "",
      idNumber: "",
      schoolName: "",
      schoolAddress: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof childRegistrationSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Ensure all required fields are present
      const childData: ChildFormData = {
        name: values.name,
        surname: values.surname,
        idNumber: values.idNumber,
        schoolName: values.schoolName,
        schoolAddress: values.schoolAddress
      };
      
      await addChild(childData);
      onComplete(childData);
    } catch (error) {
      console.error("Error adding child:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-4">Child Information</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Child's First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Child's first name" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Child's Surname</FormLabel>
                <FormControl>
                  <Input placeholder="Child's surname" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Child's ID Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Child's 13-digit ID number" 
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
            name="schoolName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter school name" 
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
            name="schoolAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter school address" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
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
                "Save Child"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChildForm;
