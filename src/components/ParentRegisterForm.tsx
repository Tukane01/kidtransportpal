
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

const ParentRegisterForm: React.FC = () => {
  const { registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChild, setHasChild] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [childFormCompleted, setChildFormCompleted] = useState(false);
  
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
    // If parent has a child but hasn't completed child form, show child form
    if (hasChild && !childFormCompleted) {
      setShowChildForm(true);
      return;
    }
    
    // If parent doesn't have a child, reject registration
    if (!hasChild) {
      toast.error("You must have a child to register as a parent");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await registerUser({
        role: "parent",
        email: values.email,
        password: values.password, // Now explicitly passing password
        name: values.name,
        surname: values.surname,
        phone: values.phone,
        idNumber: values.idNumber
      });
      
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
  
  const handleToggleHasChild = (checked: boolean) => {
    setHasChild(checked);
    form.setValue("hasChild", checked);
  };
  
  const handleChildFormComplete = () => {
    setChildFormCompleted(true);
    setShowChildForm(false);
    // Now try to submit the parent form again
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
              name="hasChild"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Do you have a child?</FormLabel>
                    <div className="text-sm text-muted-foreground">
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
              <div className="text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>You must have at least one child to register</span>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-schoolride-primary hover:bg-schoolride-secondary"
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
