
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { Camera, User, Car as CarIcon, CheckCircle, RefreshCw, Trash2, Plus } from "lucide-react";
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

const DriverProfile: React.FC = () => {
  const { currentUser, updateUserProfile, refreshUserProfile, deleteAccount } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddCarDialog, setShowAddCarDialog] = useState(false);
  const navigate = useNavigate();
  
  const getInitials = () => {
    if (!currentUser?.name || !currentUser?.surname) return "U";
    return `${currentUser.name.charAt(0)}${currentUser.surname.charAt(0)}`.toUpperCase();
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
      name: currentUser?.name || "",
      surname: currentUser?.surname || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      idNumber: currentUser?.idNumber || "",
    },
  });
  
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await updateUserProfile(data);
      
      if (success) {
        setIsEditMode(false);
        toast.success("Profile updated successfully");
      }
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
      await refreshUserProfile(true);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteAccount();
      if (success) {
        navigate('/auth');
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCarComplete = () => {
    setShowAddCarDialog(false);
    toast.success("Vehicle added successfully");
    handleRefresh();
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
                  <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                  <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium">
                  {currentUser?.name || "Set your name"} {currentUser?.surname || ""}
                </h3>
                <p className="text-muted-foreground text-sm">{currentUser?.email || "No email set"}</p>
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
                    <div className="font-medium">{currentUser?.idNumber || "Not provided"}</div>
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
                      <div className="font-medium mt-1">{currentUser?.name || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Last Name</Label>
                      <div className="font-medium mt-1">{currentUser?.surname || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="font-medium mt-1">{currentUser?.email || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Phone Number</Label>
                      <div className="font-medium mt-1">{currentUser?.phone || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">ID Number</Label>
                      <div className="font-medium mt-1">{currentUser?.idNumber || "Not provided"}</div>
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
              {currentUser?.cars && currentUser.cars.length > 0 ? (
                <div className="space-y-4">
                  {currentUser.cars.map((car, index) => (
                    <div key={car.id} className="border rounded-md p-4 bg-gray-50">
                      <div className="font-medium">
                        {car.make} {car.model}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {car.color} · {car.registrationNumber}
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
