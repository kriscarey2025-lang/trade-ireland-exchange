-- Update profiles SELECT policy to explicitly require authentication
DROP POLICY IF EXISTS "Users can view own profile or shared contacts" ON public.profiles;

CREATE POLICY "Users can view own profile or shared contacts"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM contact_shares 
      WHERE contact_shares.owner_id = profiles.id 
      AND contact_shares.shared_with_id = auth.uid()
    )
  )
);