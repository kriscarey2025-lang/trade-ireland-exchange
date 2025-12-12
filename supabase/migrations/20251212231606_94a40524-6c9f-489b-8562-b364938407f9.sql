-- Add restrictive policy to require authentication for profiles
CREATE POLICY "Require authentication for all profile access"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

-- Add restrictive policy to require authentication for verification_requests
CREATE POLICY "Require authentication for verification access"
ON public.verification_requests
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);