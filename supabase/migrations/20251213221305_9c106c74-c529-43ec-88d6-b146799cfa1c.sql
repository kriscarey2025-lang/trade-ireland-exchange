-- Fix user_ip_logs: Add explicit INSERT deny policy
-- Inserts should only happen via the security definer function log_user_ip()
CREATE POLICY "Deny direct INSERT - use log_user_ip function"
ON public.user_ip_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Also deny for anonymous users
CREATE POLICY "Deny anonymous INSERT"
ON public.user_ip_logs
FOR INSERT
TO anon
WITH CHECK (false);