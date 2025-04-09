
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProfileImage = (profileId: string | undefined) => {
  const [profileImage, setProfileImage] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileId) {
      return;
    }

    try {
      const fileName = `profile-image-${profileId}-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image.');
      } else {
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
        setProfileImage(imageUrl);
        toast.success('Image uploaded successfully!');
        return imageUrl;
      }
    } catch (error) {
      console.error('Unexpected error uploading image:', error);
      toast.error('Unexpected error during image upload.');
    }
    
    return null;
  };

  return {
    profileImage,
    setProfileImage,
    handleImageUpload
  };
};
