
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

export interface ChildFormData {
  name: string;
  surname: string;
  schoolName: string;
  schoolAddress: string;
  idNumber: string;
  id?: string;
}

interface ChildFormProps {
  onComplete: (data: ChildFormData) => void;
  onCancel: () => void;
  existingChild?: ChildFormData;
}

const childSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolAddress: z.string().min(5, "School address must be at least 5 characters"),
  idNumber: z.string().optional(),
});

const ChildForm: React.FC<ChildFormProps> = ({ onComplete, onCancel, existingChild }) => {
  const { user } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUpdating = !!existingChild;
  
  const form = useForm<z.infer<typeof childSchema>>({
    resolver: zodResolver(childSchema),
    defaultValues: existingChild || {
      name: "",
      surname: "",
      schoolName: "",
      schoolAddress: "",
      idNumber: "",
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof childSchema>) => {
    if (!user) {
      toast.error("You must be logged in to add a child");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isUpdating && existingChild?.id) {
        // Update existing child
        const { error } = await supabase
          .from('children')
          .update({
            name: values.name,
            surname: values.surname,
            school_name: values.schoolName,
            school_address: values.schoolAddress,
            id_number: values.idNumber || null,
          })
          .eq('id', existingChild.id);
          
        if (error) throw error;
        
        toast.success("Child updated successfully");
      } else {
        // Create new child
        const { error } = await supabase
          .from('children')
          .insert({
            parent_id: user.id,
            name: values.name,
            surname: values.surname,
            school_name: values.schoolName,
            school_address: values.schoolAddress,
            id_number: values.idNumber || null,
          });
          
        if (error) throw error;
        
        toast.success("Child added successfully");
      }
      
      const formattedData: ChildFormData = {
        name: values.name,
        surname: values.surname,
        schoolName: values.schoolName,
        schoolAddress: values.schoolAddress,
        idNumber: values.idNumber || "",
        id: existingChild?.id
      };
      
      onComplete(formattedData);
    } catch (error) {
      console.error("Error saving child:", error);
      toast.error(`Failed to ${isUpdating ? 'update' : 'add'} child`);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">First Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Surname</FormLabel>
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
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">ID Number (Optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="schoolName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">School Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} className="bg-white text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="schoolAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">School Address</FormLabel>
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
              isUpdating ? "Update Child" : "Add Child"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChildForm;
