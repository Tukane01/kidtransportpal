
import React, { useState, useEffect } from "react";
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
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  name: nameSchema,
  surname: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  idNumber: z.string().optional(),
});

type Child = {
  id: string;
  name: string;
  surname: string;
  schoolName: string;
  schoolAddress: string;
  idNumber?: string;
};

const ParentProfile: React.FC = () => {
  const { profile, user, updateProfile, refreshProfile, signOut } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoadingChildren(true);
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', user?.id);
          
        if (error) throw error;
        
        // Transform from snake_case to camelCase
        const formattedChildren = data.map(child => ({
          id: child.id,
          name: child.name,
          surname: child.surname,
          schoolName: child.school_name,
          schoolAddress: child.school_address,
          idNumber: child.id_number
        }));
        
        setChildren(formattedChildren);
      } catch (error) {
        console.error('Error fetching children:', error);
        toast.error('Failed to load children');
      } finally {
        setIsLoadingChildren(false);
      }
    };
    
    if (user) {
      fetchChildren();
    }
  }, [user]);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      surname: profile?.surname || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      idNumber: profile?.idNumber || "",
    },
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile && user) {
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
  
  const handleDeleteChild = async () => {
    if (!childToDelete) return;
    
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childToDelete.id);
        
      if (error) throw error;
      
      setChildren(prev => prev.filter(child => child.id !== childToDelete.id));
      setChildToDelete(null);
      toast.success("Child removed successfully");
    } catch (error) {
      console.error("Error deleting child:", error);
      toast.error("Failed to delete child");
    }
  };
  
  const handleAddChildComplete = () => {
    setShowAddChildDialog(false);
    refreshProfile(true); // Refresh to get updated children
    toast.success("Child added successfully");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile(true);
      // Fetch children again
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user?.id);
        
      if (error) throw error;
      
      // Transform from snake_case to camelCase
      const formattedChildren = data.map(child => ({
        id: child.id,
        name: child.name,
        surname: child.surname,
        schoolName: child.school_name,
        schoolAddress: child.school_address,
        idNumber: child.id_number
      }));
      
      setChildren(formattedChildren);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Call the delete_user database function
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      // Sign out the user
      await signOut();
      toast.success("Account deleted successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account: " + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = () => {
    if (!profile?.name || !profile?.surname) return "U";
    return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-800 border-gray-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="text-white">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-700">
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-gray-800 bg-gray-100 hover:bg-gray-200">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Tabs defaultValue="personal">
        <TabsList className="mb-6 bg-gray-100">
          <TabsTrigger value="personal" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-700">Personal Details</TabsTrigger>
          <TabsTrigger value="children" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-700">Children</TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-700">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-gray-900">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.profileImage} alt={profile?.name} />
                  <AvatarFallback className="text-2xl bg-schoolride-primary text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {profile?.name || "Set your name"} {profile?.surname || ""}
                  </h3>
                  <p className="text-gray-600">{user?.email || "No email set"}</p>
                  <p className="text-gray-600">{profile?.phone || "No phone set"}</p>
                  <p className="text-gray-600 mt-1">ID: {profile?.idNumber || "Not provided"}</p>
                  
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="text-gray-800 border-gray-300">
                      Change Photo
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-gray-200" />
              
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
                            <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
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
                            <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
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
                          <Input {...field} disabled={false} className="bg-gray-100 text-gray-800 border-gray-300" />
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
                          <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
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
                          <Input {...field} disabled={isLoading} className="bg-white text-gray-800 border-gray-300" />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-schoolride-primary hover:bg-schoolride-secondary text-white"
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
                <CardTitle className="text-gray-900">Children</CardTitle>
                <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-schoolride-primary hover:bg-schoolride-secondary text-white">
                      <Plus className="h-4 w-4 mr-1" /> Add Child
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Add Child</DialogTitle>
                      <DialogDescription className="text-gray-700">
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
              {isLoadingChildren ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-schoolride-primary" />
                </div>
              ) : children && children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="border rounded-md p-4 bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {child.name} {child.surname}
                        </div>
                        <div className="text-sm text-gray-700">ID: {child.idNumber || "Not provided"}</div>
                        <div className="text-sm text-gray-700 mt-1">
                          School: {child.schoolName}
                        </div>
                        <div className="text-sm text-gray-700">
                          Address: {child.schoolAddress}
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setChildToDelete(child)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-gray-900">Delete Child</DialogTitle>
                            <DialogDescription className="text-gray-700">
                              Are you sure you want to remove {child.name} {child.surname}? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setChildToDelete(null)}
                              className="text-gray-800 border-gray-300"
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleDeleteChild}
                              className="text-white"
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
                  <p className="text-gray-700">No children added yet</p>
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
                <CardTitle className="text-gray-900">Payment Methods</CardTitle>
                <Button className="bg-schoolride-primary hover:bg-schoolride-secondary text-white">
                  <Plus className="h-4 w-4 mr-1" /> Add Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-gray-700">No payment methods added yet</p>
                <Button variant="link" className="text-schoolride-primary">
                  Add your first payment method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentProfile;
