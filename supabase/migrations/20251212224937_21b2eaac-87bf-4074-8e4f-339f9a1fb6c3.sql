-- Add restrictive policy to require authentication for all profile access
CREATE POLICY "Require authentication for profile access"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);