-- Drop existing policies on advertisers
DROP POLICY IF EXISTS "Advertisers can insert their own records" ON public.advertisers;
DROP POLICY IF EXISTS "Advertisers can update their own records" ON public.advertisers;
DROP POLICY IF EXISTS "Advertisers can view their own records" ON public.advertisers;

-- Create new policies that also allow admin access
CREATE POLICY "Admins can manage all advertisers"
ON public.advertisers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own advertiser records"
ON public.advertisers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own advertiser records"
ON public.advertisers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own advertiser records"
ON public.advertisers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also allow admins to manage ads
DROP POLICY IF EXISTS "Advertisers can manage their own ads" ON public.ads;

CREATE POLICY "Admins can manage all ads"
ON public.ads
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Advertisers can manage their own ads"
ON public.ads
FOR ALL
USING (advertiser_id IN (
  SELECT id FROM advertisers WHERE user_id = auth.uid()
))
WITH CHECK (advertiser_id IN (
  SELECT id FROM advertisers WHERE user_id = auth.uid()
));