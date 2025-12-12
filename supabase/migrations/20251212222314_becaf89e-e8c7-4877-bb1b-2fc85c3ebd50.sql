-- Fix conflicting RLS policies on profiles table
-- The current setup has two restrictive SELECT policies that conflict

-- Drop the problematic deny_public_access policy
-- This policy blocks ALL access including legitimate authenticated users
DROP POLICY IF EXISTS "deny_public_access" ON public.profiles;

-- Drop the existing view policy to recreate it properly
DROP POLICY IF EXISTS "Users can view own profile fully" ON public.profiles;

-- Create a single clear permissive policy for authenticated users to view their own profile
-- This replaces both previous policies with a properly scoped one
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Note: The SECURITY DEFINER functions (get_basic_profile, get_profile_for_conversation)
-- will still work as they bypass RLS by design. These are needed for:
-- - Showing provider names on services (get_basic_profile)
-- - Showing profile info in conversations with conditional contact sharing (get_profile_for_conversation)