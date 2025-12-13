-- Drop the current policy that exposes profiles to conversation partners
DROP POLICY IF EXISTS "Users can view profiles of conversation partners" ON public.profiles;

-- Create new restrictive policy: only own profile OR explicit contact shares
CREATE POLICY "Users can view own profile or shared contacts"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM contact_shares 
    WHERE owner_id = profiles.id 
    AND shared_with_id = auth.uid()
  )
);