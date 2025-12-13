-- Drop the existing policy that exposes data through contact_shares
DROP POLICY IF EXISTS "Users can view own profile or shared contacts" ON public.profiles;

-- Create a new policy that only allows viewing your own profile
-- Access to other users' profiles must go through secure RPC functions
CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);