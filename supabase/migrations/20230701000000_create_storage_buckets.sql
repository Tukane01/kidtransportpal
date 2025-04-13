
-- Create a storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'Profile Images', true);

-- Create a policy to allow users to upload their own profile images
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'profile-photos');

-- Create a policy to allow users to update their own profile images
CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'profile-photos');

-- Create a policy to allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'profile-photos');

-- Create a policy to allow public access to read profile images
CREATE POLICY "Public access to profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profiles');
