-- Drop the overly permissive policy that exposes all profile columns
DROP POLICY IF EXISTS "Conversation participants can view basic profiles" ON public.profiles;

-- Create a more restrictive policy that only allows access to non-sensitive columns
-- by wrapping the access check in a function that returns only safe columns
-- Note: RLS can't do column-level restrictions, so we remove this policy entirely
-- and rely on the get_profile_for_conversation() RPC for any profile access between users

-- The only profile access policies should be:
-- 1. Users can view their own profile (already exists)
-- 2. Service providers' basic info is accessible via a new function

-- Create a function to get basic (non-sensitive) profile info for any user
-- This returns ONLY id, full_name, avatar_url, bio, location - never email/phone
CREATE OR REPLACE FUNCTION public.get_basic_profile(_profile_id UUID)
RETURNS TABLE(
  id UUID, 
  full_name TEXT, 
  avatar_url TEXT, 
  bio TEXT, 
  location TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.bio, p.location
  FROM profiles p
  WHERE p.id = _profile_id;
$$;