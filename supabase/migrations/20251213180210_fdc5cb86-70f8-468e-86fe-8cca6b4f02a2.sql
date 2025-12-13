-- Add social media link columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN linkedin_url text,
ADD COLUMN facebook_url text,
ADD COLUMN instagram_url text;