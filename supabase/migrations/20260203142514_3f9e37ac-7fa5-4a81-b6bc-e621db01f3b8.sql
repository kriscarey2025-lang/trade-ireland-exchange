
-- First add the website_url column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS website_url text DEFAULT NULL;
