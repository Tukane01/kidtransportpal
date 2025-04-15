
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { driverRegistrationSchema } from "@/utils/validation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkAgeFromIdNumber } from "@/utils/validation";

const DriverRegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  
  const form = useForm<z.infer<typeof driverRegistrationSchema>>({
    resolver: zodResolver(driverRegistrationSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      idNumber: "",
      hasCar: false,
      carData: {
        make: "",
        model: "",
        registrationNumber: "",
        color: "",
        vinNumber: "",
      },
    },
  });
  
  const onSubmit = async (values: z.infer<typeof driverRegistrationSchema>) => {
    const idValidation = checkAgeFromIdNumber(values.idNumber);
    if (!idValidation.isValid) {
      toast.error(`Drivers must be between 25-65 years old. You are ${idValidation.age}`);
      return;
    }
    
    if (!hasCar) {
      toast.error("You must have a car to register as a driver");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register({
        role: "driver",
        email: values.email,
        password: values.password,
        name: values.name,
        surname: values.surname,
        phone: values.phone,
        idNumber: values.idNumber
      });
      
      if (success && hasCar && values.carData) {
        const { data: authData } = await supabase.auth.getUser();
        
        if (authData?.user) {
          const { error: carError } = await supabase
            .from('cars')
            .insert({
              owner_id: authData.user.id,
              make: values.carData.make,
              model: values.carData.model,
              registration_number: values.carData.registrationNumber,
              color: values.carData.color,
              vin_number: values.carData.vinNumber,
              owner_id_number: values.idNumber
            });
            
          if (carError) {
            console.error("Error saving car data:", carError);
            toast.error("Registration successful but failed to save car data");
          } else {
            toast.success("Registration successful with car data saved");
          }
        }
      }
      
      if (success) {
        toast.success("Registration successful");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleHasCar = (checked: boolean) => {
    setHasCar(checked);
    form.setValue("hasCar", checked);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your first name" {...field} disabled={isLoading} />
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
              <FormLabel>Surname</FormLabel>
              <FormControl>
                <Input placeholder="Enter your surname" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="your.email@gmail.com"
                  type="email"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Create password" 
                    type="password" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Confirm password" 
                    type="password" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="0821234567" 
                  {...field} 
                  disabled={isLoading}
                />
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
              <FormLabel>ID Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your 13-digit ID number" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hasCar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Do you have a car?</FormLabel>
                <div className="text-sm text-muted-foreground">
                  You must have a car to register as a driver
                </div>
              </div>
              <FormControl>
                <Switch 
                  checked={hasCar}
                  onCheckedChange={handleToggleHasCar}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {!hasCar && (
          <div className="text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>You must have a car to register as a driver</span>
          </div>
        )}

        {hasCar && (
          <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
            <h3 className="font-medium text-lg">Vehicle Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="carData.make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Toyota" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="carData.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Corolla" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="carData.color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Silver" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="carData.registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., ABC123GP" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="carData.vinNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vehicle Identification Number" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full bg-schoolride-primary hover:bg-schoolride-secondary text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default DriverRegisterForm;
