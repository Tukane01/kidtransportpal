
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nameSchema, phoneSchema, emailSchema } from "@/utils/validation";
import { useAuth } from "@/context/AuthContext";
import { Child, useRide } from "@/context/RideContext";
import { Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChildForm from "@/components/ChildForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const profileSchema = z.object({
  name: nameSchema,
  surname: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

const ParentProfile: React.FC = () => {
  const { currentUser, updateUserProfile, refreshUserProfile } = useAuth();
  const { children, deleteChild } = useRide();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      surname: currentUser?.surname || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
    },
  });
  
  const onSubmitProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    
    try {
      const success = await updateUserProfile(values);
      
      if (success) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteChild = async () => {
    if (!childToDelete) return;
    
    try {
      await deleteChild(childToDelete.id);
      setChildToDelete(null);
    } catch (error) {
      console.error("Error deleting child:", error);
      toast.error("Failed to delete child");
    }
  };
  
  const handleAddChildComplete = () => {
    setShowAddChildDialog(false);
    toast.success("Child added successfully");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
      toast.success("Profile data refreshed");
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">My Profile</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="personal">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                  <AvatarFallback className="text-2xl">
                    {currentUser?.name?.[0]}{currentUser?.surname?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium">
                    {currentUser?.name} {currentUser?.surname}
                  </h3>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                  <p className="text-muted-foreground">{currentUser?.phone}</p>
                  <p className="text-muted-foreground mt-1">ID: {currentUser?.idNumber}</p>
                  
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
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
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-schoolride-primary hover:bg-schoolride-secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="children">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Children</CardTitle>
                <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-schoolride-primary hover:bg-schoolride-secondary">
                      <Plus className="h-4 w-4 mr-1" /> Add Child
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Child</DialogTitle>
                      <DialogDescription>
                        Add your child's details to request rides for them
                      </DialogDescription>
                    </DialogHeader>
                    <ChildForm 
                      onComplete={handleAddChildComplete} 
                      onCancel={() => setShowAddChildDialog(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="border rounded-md p-4 bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">
                          {child.name} {child.surname}
                        </div>
                        <div className="text-sm text-muted-foreground">ID: {child.idNumber}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          School: {child.schoolName}
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => setChildToDelete(child)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Child</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove {child.name} {child.surname}? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setChildToDelete(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleDeleteChild}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No children added yet</p>
                  <Button 
                    variant="link" 
                    className="text-schoolride-primary"
                    onClick={() => setShowAddChildDialog(true)}
                  >
                    Add your first child
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Payment Methods</CardTitle>
                <Button className="bg-schoolride-primary hover:bg-schoolride-secondary">
                  <Plus className="h-4 w-4 mr-1" /> Add Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">SchoolRide Wallet</div>
                      <div className="text-sm text-muted-foreground">Balance: R 500.00</div>
                    </div>
                  </div>
                  <Button variant="link" className="text-schoolride-primary">Top Up</Button>
                </div>
                
                <div className="border rounded-md p-4 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-purple-600 rounded-md flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">Credit Card</div>
                      <div className="text-sm text-muted-foreground">**** **** **** 4328</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentProfile;
