
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "./profile/ProfileHeader";
import ProfileForm from "./profile/ProfileForm";
import ChildrenSection from "./profile/ChildrenSection";
import PaymentSection from "./profile/PaymentSection";
import AccountActions from "./profile/AccountActions";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ParentProfile: React.FC = () => {
  const { profile, user, refreshProfile, signOut } = useSupabaseAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handleRefresh = async () => {
    await refreshProfile(true);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    try {
      setIsUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      
      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: data.publicUrl })
        .eq('id', profile?.id);
        
      if (updateError) {
        throw updateError;
      }
      
      await refreshProfile(false);
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile photo');
    } finally {
      setIsUploading(false);
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <div className="flex items-center gap-2">
          <AccountActions onRefresh={handleRefresh} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Tabs defaultValue="personal" className={isMobile ? "w-full" : ""}>
        <TabsList className="mb-6 bg-gray-100 w-full justify-start">
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
              <ProfileHeader 
                onPhotoChange={(e) => handlePhotoChange(e)} 
                isUploading={isUploading} 
              />
              
              <Separator className="bg-gray-200" />
              
              <ProfileForm profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="children">
          <ChildrenSection />
        </TabsContent>
        
        <TabsContent value="payment">
          <PaymentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentProfile;
