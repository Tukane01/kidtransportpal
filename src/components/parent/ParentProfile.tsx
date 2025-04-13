
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

const ParentProfile: React.FC = () => {
  const { profile, user, refreshProfile } = useSupabaseAuth();
  const [isUploading, setIsUploading] = useState(false);
  const isMobile = useIsMobile();
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <AccountActions onRefresh={handleRefresh} />
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
              
              <ProfileForm />
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
