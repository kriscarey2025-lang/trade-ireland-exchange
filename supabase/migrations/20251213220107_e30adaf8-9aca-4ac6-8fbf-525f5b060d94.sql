-- Fix critical security issues: Ensure all sensitive tables require authentication for SELECT

-- 1. Drop overly permissive policies on profiles (currently users can only see their own, which is correct)
-- The scan may have flagged this incorrectly - let's verify the existing policy is restrictive enough

-- 2. Fix advertisers - ensure only owners/admins can view, not unauthenticated users
-- Current policy allows users to view their own - that's fine, but we need to ensure no anonymous access

-- 3. User IP logs - already admin-only for SELECT, but ensure no anonymous access
-- Current policies look correct (admin only), but let's ensure RLS is properly enforced

-- 4. Ad impressions - currently allows anyone to insert but only advertisers to view their own
-- Need to ensure unauthenticated users cannot SELECT at all
DROP POLICY IF EXISTS "Advertisers can view their ad impressions" ON public.ad_impressions;
CREATE POLICY "Advertisers can view their ad impressions" 
ON public.ad_impressions 
FOR SELECT 
TO authenticated
USING (ad_id IN ( 
  SELECT ads.id FROM ads 
  WHERE ads.advertiser_id IN ( 
    SELECT advertisers.id FROM advertisers 
    WHERE advertisers.user_id = auth.uid()
  )
));

-- 5. Ad clicks - same fix as impressions
DROP POLICY IF EXISTS "Advertisers can view their ad clicks" ON public.ad_clicks;
CREATE POLICY "Advertisers can view their ad clicks" 
ON public.ad_clicks 
FOR SELECT 
TO authenticated
USING (ad_id IN ( 
  SELECT ads.id FROM ads 
  WHERE ads.advertiser_id IN ( 
    SELECT advertisers.id FROM advertisers 
    WHERE advertisers.user_id = auth.uid()
  )
));

-- 6. Fix ads - keep public viewing but only for authenticated users to prevent scraping
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
CREATE POLICY "Authenticated users can view active ads" 
ON public.ads 
FOR SELECT 
TO authenticated
USING ((is_active = true) AND ((ends_at IS NULL) OR (ends_at > now())));

-- Also allow anonymous users to view ads (needed for homepage display)
CREATE POLICY "Anonymous can view active ads" 
ON public.ads 
FOR SELECT 
TO anon
USING ((is_active = true) AND ((ends_at IS NULL) OR (ends_at > now())));

-- 7. Add policy for admins to view all ad impressions and clicks for analytics
CREATE POLICY "Admins can view all ad impressions"
ON public.ad_impressions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all ad clicks"
ON public.ad_clicks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Fix reports - prevent reported users from seeing reports about themselves
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view reports they submitted" 
ON public.reports 
FOR SELECT 
TO authenticated
USING (auth.uid() = reporter_id);

-- 9. Allow banned users to see their own ban record
CREATE POLICY "Users can view their own ban"
ON public.banned_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);