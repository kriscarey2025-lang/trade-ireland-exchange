-- Add explicit deny-all RLS policies for message_rate_limits table
-- This table is only accessed by the SECURITY DEFINER trigger function (prevent_message_spam)
-- Users should never have direct access to this internal rate limiting data

-- Deny all SELECT access to users
CREATE POLICY "Deny all SELECT access"
ON public.message_rate_limits
FOR SELECT
USING (false);

-- Deny all INSERT access to users  
CREATE POLICY "Deny all INSERT access"
ON public.message_rate_limits
FOR INSERT
WITH CHECK (false);

-- Deny all UPDATE access to users
CREATE POLICY "Deny all UPDATE access"
ON public.message_rate_limits
FOR UPDATE
USING (false);

-- Deny all DELETE access to users
CREATE POLICY "Deny all DELETE access"
ON public.message_rate_limits
FOR DELETE
USING (false);