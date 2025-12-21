-- The signup_rate_limits table should only be accessed via the check_signup_rate_limit SECURITY DEFINER function
-- Add deny-all policies to prevent any direct access

CREATE POLICY "Deny all direct access"
ON public.signup_rate_limits
FOR ALL
TO public
USING (false)
WITH CHECK (false);