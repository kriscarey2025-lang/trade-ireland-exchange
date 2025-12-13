-- Update reviews policy to require authentication instead of being fully public
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.reviews;

CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
USING (auth.uid() IS NOT NULL);