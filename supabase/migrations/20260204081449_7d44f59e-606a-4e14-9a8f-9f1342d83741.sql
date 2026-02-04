-- Fix RLS issue: welcome_emails_sent has RLS enabled but no policies
-- This is an internal tracking table that should only be accessed by edge functions (service role)

-- Add policy to deny all public access (service role bypasses RLS)
CREATE POLICY "Deny all public access"
  ON public.welcome_emails_sent
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Note: ad_clicks and ad_impressions have WITH CHECK (true) for INSERT
-- This is intentional for anonymous analytics tracking and is acceptable
-- The linter flags it but it's a valid use case for public analytics