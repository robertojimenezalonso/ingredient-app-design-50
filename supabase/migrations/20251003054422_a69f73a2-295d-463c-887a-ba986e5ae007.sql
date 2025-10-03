-- Add profile_color and avatar_url columns to meal_profiles
ALTER TABLE meal_profiles 
ADD COLUMN profile_color text,
ADD COLUMN avatar_url text;

-- Create storage bucket for profile avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile avatars
CREATE POLICY "Users can view profile avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own profile avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own profile avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own profile avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);