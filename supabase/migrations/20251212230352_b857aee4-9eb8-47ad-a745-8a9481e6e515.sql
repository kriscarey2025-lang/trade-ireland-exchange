-- Fix 1: Remove overly permissive profile access policy
-- The current "Require authentication for profile access" allows any authenticated user to see all profiles
DROP POLICY IF EXISTS "Require authentication for profile access" ON public.profiles;

-- Add policy to allow viewing profiles of users you're in conversation with
CREATE POLICY "Users can view profiles of conversation partners"
ON public.profiles
AS PERMISSIVE
FOR SELECT
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM conversations 
    WHERE (participant_1 = auth.uid() AND participant_2 = profiles.id)
    OR (participant_2 = auth.uid() AND participant_1 = profiles.id)
  )
);

-- Drop the old "Users can view their own profile" since we merged it above
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Fix 2: Add extra protection for verification document storage
-- Ensure admins can also access documents (for review purposes)
CREATE POLICY "Admins can view all ID documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'id-documents' 
  AND public.has_role(auth.uid(), 'admin')
);