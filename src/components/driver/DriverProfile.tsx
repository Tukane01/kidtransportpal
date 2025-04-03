
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Camera, User, Car as CarIcon, CheckCircle, RefreshCw, Trash2, Plus, Loader2 } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CarForm from "@/components/CarForm";

type Car = {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  vinNumber: string;
  ownerIdNumber: string;
};

const DriverProfile: React.FC = () => {
  const { profile, user, updateProfile, refreshProfile, signOut } = useSupabaseAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddCarDialog, setShowAddCarDialog] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCars = async () => {
      setIsLoadingCars(true);
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('owner_id', user?.id);
          
        if (error) throw error;
        
        // Transform from snake_case to camelCase
        const formattedCars = data.map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          registrationNumber: car.registration_number,
          color: car.color,
          vinNumber: car.vin_number,
          ownerIdNumber: car.owner_id_number
        }));
        
        setCars(formattedCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error('Failed to load cars');
      } finally {
        setIsLoadingCars(false);
      }
    };
    
    if (user) {
      fetchCars();
    }
  }, [user]);
  
  const getInitials = () => {
    if (!profile?.name || !profile?.surname) return "U";
    return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
  };
  
  const profileFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    surname: z.string().min(1, "Surname is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(7, "Phone number must be valid"),
    idNumber: z.string().optional(),
  });
  
  type ProfileFormValues = z.infer<typeof profileFormSchema>;
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
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
      profileForm.reset({
        name: profile.name || "",
        surname: profile.surname || "",
        email: user.email || "",
        phone: profile.phone || "",
        idNumber: profile.idNumber || "",
      });
    }
  }, [profile, user, profileForm]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await updateProfile({
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        idNumber: data.idNumber,
      });
      
      if (error) {
        throw error;
      }
      
      setIsEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile(true);
      // Fetch cars again
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('owner_id', user?.id);
        
      if (error) throw error;
      
      // Transform from snake_case to camelCase
      const formattedCars = data.map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        registrationNumber: car.registration_number,
        color: car.color,
        vinNumber: car.vin_number,
        ownerIdNumber: car.owner_id_number
      }));
      
      setCars(formattedCars);
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
      // First delete the user from the auth system
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      // Sign out the user
      await signOut();
      toast.success("Account deleted successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);
        
      if (error) throw error;
      
      setCars(prev => prev.filter(car => car.id !== carId));
      toast.success("Vehicle removed successfully");
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  const handleAddCarComplete = () => {
    setShowAddCarDialog(false);
    handleRefresh();
    toast.success("Vehicle added successfully");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">Driver Profile</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.profileImage} alt={profile?.name} />
                  <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium">
                  {profile?.name || "Set your name"} {profile?.surname || ""}
                </h3>
                <p className="text-muted-foreground text-sm">{user?.email || "No email set"}</p>
                <div className="flex items-center justify-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm">Verified Driver</span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4 w-full">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-schoolride-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-schoolride-primary" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-muted-foreground">ID Number</div>
                    <div className="font-medium">{profile?.idNumber || "Not provided"}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-schoolride-primary/10 flex items-center justify-center">
                    <CarIcon className="h-5 w-5 text-schoolride-primary" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-muted-foreground">Driver Status</div>
                    <div className="font-medium">Active</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!isEditMode && (
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="surname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditMode(false)}
                        type="button"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">First Name</Label>
                      <div className="font-medium mt-1">{profile?.name || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Last Name</Label>
                      <div className="font-medium mt-1">{profile?.surname || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium mt-1">{user?.email || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Phone Number</Label>
                      <div className="font-medium mt-1">{profile?.phone || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">ID Number</Label>
                      <div className="font-medium mt-1">{profile?.idNumber || "Not provided"}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vehicle Information</CardTitle>
              <Dialog open={showAddCarDialog} onOpenChange={setShowAddCarDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-schoolride-primary hover:bg-schoolride-secondary">
                    <Plus className="h-4 w-4 mr-1" /> Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Vehicle</DialogTitle>
                    <DialogDescription>
                      Add your vehicle details to use for rides
                    </DialogDescription>
                  </DialogHeader>
                  <CarForm 
                    onComplete={handleAddCarComplete} 
                    onCancel={() => setShowAddCarDialog(false)} 
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingCars ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-schoolride-primary" />
                </div>
              ) : cars && cars.length > 0 ? (
                <div className="space-y-4">
                  {cars.map((car) => (
                    <div key={car.id} className="border rounded-md p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {car.make} {car.model}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {car.color} · {car.registrationNumber}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteCar(car.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Registration Number</Label>
                          <div className="text-sm font-medium">{car.registrationNumber}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">VIN Number</Label>
                          <div className="text-sm font-medium">{car.vinNumber || "Not provided"}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Owner ID</Label>
                          <div className="text-sm font-medium">{car.ownerIdNumber || "Not provided"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No vehicle information found</p>
                  <Button variant="link" className="mt-2" onClick={() => setShowAddCarDialog(true)}>
                    Add Vehicle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
