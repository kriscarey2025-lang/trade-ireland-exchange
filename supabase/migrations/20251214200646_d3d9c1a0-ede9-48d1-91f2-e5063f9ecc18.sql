-- Add approved column to ads table (ads require approval before being shown)
ALTER TABLE public.ads ADD COLUMN approved BOOLEAN DEFAULT false;

-- Drop the old policies for viewing ads
DROP POLICY IF EXISTS "Anonymous can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can view active ads" ON public.ads;

-- Create new policies that require both active AND approved
CREATE POLICY "Anyone can view active approved ads"
ON public.ads
FOR SELECT
USING (
  is_active = true 
  AND approved = true 
  AND (ends_at IS NULL OR ends_at > now())
);

-- Admins and advertisers can still see all their ads (approved or not) via existing policies