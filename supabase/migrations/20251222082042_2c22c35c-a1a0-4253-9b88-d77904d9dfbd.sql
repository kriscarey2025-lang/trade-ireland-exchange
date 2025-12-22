-- ===========================================
-- FIX 1: Tighten advertiser_interests policy
-- Currently anyone can insert, which exposes business contact data
-- Change to only allow inserts through the edge function (service role)
-- ===========================================

-- Drop the permissive insert policy
DROP POLICY IF EXISTS "Anyone can submit advertiser interest" ON public.advertiser_interests;

-- Create a more restrictive policy that denies direct client inserts
-- The edge function uses service role which bypasses RLS
CREATE POLICY "Deny direct advertiser interest inserts"
ON public.advertiser_interests
FOR INSERT
WITH CHECK (false);

-- ===========================================
-- FIX 2: Tighten user_feedback insert policy
-- Currently anyone can submit feedback which could expose emails
-- ===========================================

-- Drop the permissive insert policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.user_feedback;

-- Allow authenticated users only OR anonymous with validation via edge function
-- For now, require authentication for feedback
CREATE POLICY "Authenticated users can submit feedback"
ON public.user_feedback
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (user_id IS NULL OR auth.uid() = user_id)
);

-- ===========================================
-- FIX 3: Update community_posts SELECT policy to respect visibility
-- Currently all authenticated users can see all posts regardless of status
-- ===========================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view community posts" ON public.community_posts;

-- Create proper visibility policy
CREATE POLICY "Users can view approved visible posts or their own"
ON public.community_posts
FOR SELECT
USING (
  -- Users can always see their own posts
  (auth.uid() = user_id)
  OR 
  -- Everyone can see visible, approved, active posts
  (is_visible = true AND moderation_status = 'approved' AND status = 'active')
  OR
  -- Admins can see everything
  has_role(auth.uid(), 'admin')
);

-- ===========================================
-- FIX 4: Tighten notifications INSERT policy
-- Currently any authenticated user can insert notifications for anyone
-- ===========================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Deny all direct client inserts - notifications should only be created 
-- by database triggers and functions (which use service role or security definer)
CREATE POLICY "Deny direct notification inserts"
ON public.notifications
FOR INSERT
WITH CHECK (false);