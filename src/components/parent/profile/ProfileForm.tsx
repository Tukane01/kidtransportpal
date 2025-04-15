
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { nameSchema, phoneSchema, emailSchema, idNumberSchema } from "@/utils/validation";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: nameSchema,
  surname: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  idNumber: idNumberSchema.optional(),
});

const ProfileForm: React.FC = () => {
  const { profile, user, updateProfile } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      surname: profile?.surname || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      idNumber: profile?.idNumber || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
  if (profile && user) {
    // Only reset the form if the profile or user values change.
    form.reset({
      name: profile.name || "",
      surname: profile.surname || "",
      email: user.email || "",
      phone: profile.phone || "",
      idNumber: profile.idNumber || "",
    });
  }
}, [profile, user, form]);

  
  const onSubmitProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    
    try {
      const { error } = await updateProfile({
        name: values.name,
        surname: values.surname,
        phone: values.phone,
        idNumber: values.idNumber,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">First Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={isLoading} 
                    className="bg-white text-gray-800 border-gray-300"
                    placeholder="Enter your first name" 
                  />
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
                  <Input 
                    {...field} 
                    disabled={isLoading} 
                    className="bg-white text-gray-800 border-gray-300" 
                    placeholder="Enter your surname"
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Email</FormLabel>
              <FormControl>
                <Input {...field} disabled={true} className="bg-gray-100 text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Phone Number</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={isLoading} 
                  className="bg-white text-gray-800 border-gray-300" 
                  placeholder="0712345678"
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">ID Number</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={isLoading} 
                  className="bg-white text-gray-800 border-gray-300" 
                  placeholder="Enter your 13-digit ID number"
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full sm:w-auto bg-schoolride-primary hover:bg-schoolride-secondary text-white"
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
