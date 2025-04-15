import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { toast } from "sonner";

// Define the validation schema using Zod
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
});

const ProfileForm: React.FC = () => {
  const { profile, user, updateProfile } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Track whether the form has been initialized
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      idNumber: "",
    },
    mode: "onChange",
  });

  // Update form only when profile/user data is ready for the first time
  useEffect(() => {
    if (profile && user && !isFormInitialized) {
      form.reset({
        name: profile.name || "",
        surname: profile.surname || "",
        email: user.email || "",
        phone: profile.phone || "",
        idNumber: profile.idNumber || "",
      });

      setIsFormInitialized(true); // Mark the form as initialized to prevent further resets
    }
  }, [profile, user, form, isFormInitialized]);

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
          {/* First Name Input */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">First Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />

          {/* Surname Input */}
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Surname</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
        </div>

        {/* Email Input */}
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

        {/* Phone Input */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Phone Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        {/* ID Number Input */}
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">ID Number</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full sm:w-auto bg-schoolride-primary hover:bg-schoolride-secondary text-white"
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
