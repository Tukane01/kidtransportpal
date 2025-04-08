
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LucideEdit, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DriverProfile: React.FC = () => {
  const { currentUser, updateUserProfile, deleteUserProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [surname, setSurname] = useState(currentUser?.surname || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setSurname(currentUser.surname || "");
      setPhone(currentUser.phone || "");
      setProfileImage(currentUser.profileImage || "");
    }
  }, [currentUser]);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
    setName(currentUser?.name || "");
    setSurname(currentUser?.surname || "");
    setPhone(currentUser?.phone || "");
    setProfileImage(currentUser?.profileImage || "");
    setNewProfileImage(null);
  };
  
  const handleSaveClick = async () => {
    setIsLoading(true);
    
    try {
      let imageUrl = profileImage;
      
      if (newProfileImage) {
        // Upload the new image to Supabase storage
        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(`${currentUser?.id}/${newProfileImage.name}`, newProfileImage, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload new profile image");
          setIsLoading(false);
          return;
        }
        
        // Construct the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(`${currentUser?.id}/${newProfileImage.name}`);
          
        imageUrl = publicUrlData.publicUrl;
      }
      
      const updatedData = {
        name,
        surname,
        phone,
        profileImage: imageUrl
      };
      
      const success = await updateUserProfile(updatedData);
      
      if (success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        await refreshUserProfile();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProfileImage = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteUserProfile();
      
      if (success) {
        toast.success("Profile image removed successfully!");
        setProfileImage("");
        await refreshUserProfile();
      } else {
        toast.error("Failed to remove profile image");
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
      toast.error("Failed to remove profile image");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfileImage(file);
      
      // Optionally, display a local preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getInitials = () => {
    if (!currentUser) return "U";
    const firstInitial = currentUser.name?.[0] || "";
    const lastInitial = currentUser.surname?.[0] || "";
    return `${firstInitial}${lastInitial}`;
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Driver Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            {profileImage ? (
              <AvatarImage src={profileImage} alt="Profile Image" />
            ) : (
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <UserRound className="h-8 w-8" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            {isEditing ? (
              <>
                <Input type="file" id="profile-image-input" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Label htmlFor="profile-image-input" className="bg-blue-500 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-blue-600">
                  {newProfileImage ? "Change Image" : "Upload Image"}
                </Label>
                {profileImage && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteProfileImage} disabled={isDeleting} className="ml-2">
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Remove"
                    )}
                  </Button>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">{name} {surname}</h2>
                <p className="text-muted-foreground">{phone}</p>
              </>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">First Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="surname">Surname</Label>
                <Input
                  type="text"
                  id="surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={handleCancelClick} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveClick} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={handleEditClick} className="w-full">
            <LucideEdit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverProfile;
