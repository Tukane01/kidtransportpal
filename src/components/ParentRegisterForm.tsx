
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { parentRegistrationSchema } from "@/utils/validation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import ChildForm from "@/components/ChildForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ParentRegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChild, setHasChild] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [childFormCompleted, setChildFormCompleted] = useState(false);
  const [childData, setChildData] = useState(null);
  
  const form = useForm<z.infer<typeof parentRegistrationSchema>>({
    resolver: zodResolver(parentRegistrationSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      idNumber: "",
      hasChild: false,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof parentRegistrationSchema>) => {
    if (hasChild && !childFormCompleted) {
      setShowChildForm(true);
      return;
    }
    
    if (!hasChild) {
      toast.error("You must have a child to register as a parent");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register({
        role: "parent",
        email: values.email,
        password: values.password,
        name: values.name,
        surname: values.surname,
        phone: values.phone,
        idNumber: values.idNumber
      });
      
      if (success && childData) {
        const { data: authData } = await supabase.auth.getUser();
        
        if (authData?.user) {
          const { error: childError } = await supabase
            .from('children')
            .insert({
              parent_id: authData.user.id,
              name: childData.name,
              surname: childData.surname,
              school_name: childData.schoolName,
              school_address: childData.schoolAddress,
              id_number: childData.idNumber
            });
            
          if (childError) {
            console.error("Error saving child data:", childError);
            toast.error("Registration successful but failed to save child data: " + childError.message);
          } else {
            toast.success("Registration successful with child data saved");
          }
        }
      }
      
      if (success) {
        toast.success("Registration successful");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleHasChild = (checked: boolean) => {
    setHasChild(checked);
    form.setValue("hasChild", checked);
  };
  
  // Fix: Update the type signature to match what ChildForm expects
  const handleChildFormComplete = (data: any) => {
    setChildData(data);
    setChildFormCompleted(true);
    setShowChildForm(false);
    form.handleSubmit(onSubmit)();
  };
  
  return (
    <>
      {showChildForm ? (
        <ChildForm onComplete={handleChildFormComplete} onCancel={() => setShowChildForm(false)} />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} disabled={isLoading} className="bg-white text-black" />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Surname</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your surname" {...field} disabled={isLoading} className="bg-white text-black" />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@gmail.com"
                      type="email"
                      {...field}
                      disabled={isLoading}
                      className="bg-white text-black"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Create password" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Confirm password" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0821234567" 
                      {...field} 
                      disabled={isLoading}
                      className="bg-white text-black"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">ID Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your 13-digit ID number" 
                      {...field} 
                      disabled={isLoading}
                      className="bg-white text-black"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasChild"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                  <div className="space-y-0.5">
                    <FormLabel className="text-black text-base">Do you have a child?</FormLabel>
                    <div className="text-sm text-gray-600">
                      You must have at least one child to register
                    </div>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={hasChild}
                      onCheckedChange={handleToggleHasChild}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {!hasChild && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>You must have at least one child to register</span>
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
      )}
    </>
  );
};

export default ParentRegisterForm;
