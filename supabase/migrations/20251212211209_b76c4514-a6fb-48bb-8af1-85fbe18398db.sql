-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- The create_match_notifications() trigger runs with SECURITY DEFINER,
-- which bypasses RLS entirely, so it can still insert notifications.
-- No INSERT policy is needed for regular users since they should not
-- be able to create notifications directly.