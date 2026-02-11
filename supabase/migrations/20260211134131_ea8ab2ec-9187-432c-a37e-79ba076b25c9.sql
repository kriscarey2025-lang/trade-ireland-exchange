
-- Create community hero nominations table
CREATE TABLE public.community_hero_nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_name TEXT NOT NULL,
  description TEXT NOT NULL,
  nominator_name TEXT,
  nominator_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_hero_nominations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit nominations"
ON public.community_hero_nominations
FOR INSERT
WITH CHECK (true);

-- Only admins can view nominations
CREATE POLICY "Admins can view nominations"
ON public.community_hero_nominations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
