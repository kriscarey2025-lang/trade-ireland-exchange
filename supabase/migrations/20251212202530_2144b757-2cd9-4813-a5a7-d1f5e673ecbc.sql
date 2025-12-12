-- Add explicit deny policy for anonymous users on profiles
CREATE POLICY "deny_public_access"
ON public.profiles FOR SELECT
TO anon
USING (false);