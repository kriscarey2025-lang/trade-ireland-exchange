-- Fix verification_requests: Remove overly permissive policy
DROP POLICY IF EXISTS "Require authentication for verification access" ON public.verification_requests;

-- Add admin access policy for verification requests (users already have their own policy)
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix profiles: Remove overly permissive policy and keep the conversation-based one
DROP POLICY IF EXISTS "Require authentication for all profile access" ON public.profiles;