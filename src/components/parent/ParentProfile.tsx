
import React, { useState, useEffect } from "react";
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

const ParentProfile: React.FC = () => {
  const { profile, user, refreshProfile } = useSupabaseAuth();
  
  const handleRefresh = async () => {
    await refreshProfile(true);
    
    // Refresh children data (this is handled in the ChildrenSection component)
  };

  const handlePhotoChange = () => {
    // TODO: Implement photo change functionality
    console.log("Change photo clicked");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <AccountActions onRefresh={handleRefresh} />
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
              <ProfileHeader onPhotoChange={handlePhotoChange} />
              
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
