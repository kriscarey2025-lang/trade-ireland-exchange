
-- Create boosted_listings table
CREATE TABLE public.boosted_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  stripe_session_id text,
  boosted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT boosted_listings_service_id_unique UNIQUE (service_id)
);

-- Enable RLS
ALTER TABLE public.boosted_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active boosts (needed for badge rendering)
CREATE POLICY "Anyone can view active boosts"
  ON public.boosted_listings
  FOR SELECT
  USING (status = 'active' AND expires_at > now());

-- Users can view their own boosts regardless of status
CREATE POLICY "Users can view their own boosts"
  ON public.boosted_listings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role inserts (via edge function)
CREATE POLICY "Deny direct inserts"
  ON public.boosted_listings
  FOR INSERT
  WITH CHECK (false);

-- Update get_public_services to sort boosted listings first
CREATE OR REPLACE FUNCTION public.get_public_services(
  _category text DEFAULT NULL,
  _location text DEFAULT NULL,
  _search text DEFAULT NULL,
  _status text DEFAULT 'active'
)
RETURNS TABLE(
  id uuid, user_id uuid, title text, description text, category text,
  type text, price numeric, price_type text, location text, images text[],
  status text, accepted_categories text[], created_at timestamp with time zone,
  updated_at timestamp with time zone, provider_name text, provider_avatar text,
  provider_linkedin text, provider_facebook text, provider_instagram text,
  provider_website text, provider_verification_status text, provider_is_founder boolean,
  completed_swaps_count integer, is_time_sensitive boolean, needed_by_date timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.user_id, s.title, s.description, s.category, s.type,
    s.price, s.price_type, s.location, s.images, s.status,
    s.accepted_categories, s.created_at, s.updated_at,
    p.full_name AS provider_name, p.avatar_url AS provider_avatar,
    p.linkedin_url AS provider_linkedin, p.facebook_url AS provider_facebook,
    p.instagram_url AS provider_instagram, p.website_url AS provider_website,
    p.verification_status AS provider_verification_status,
    COALESCE(p.is_founder, false) AS provider_is_founder,
    COALESCE(s.completed_swaps_count, 0) AS completed_swaps_count,
    COALESCE(s.is_time_sensitive, false) AS is_time_sensitive,
    s.needed_by_date
  FROM services s
  LEFT JOIN profiles p ON s.user_id = p.id
  LEFT JOIN boosted_listings bl ON s.id = bl.service_id 
    AND bl.status = 'active' AND bl.expires_at > now()
  WHERE 
    (s.moderation_status IS NULL OR s.moderation_status = 'approved')
    AND (_status IS NULL OR s.status = _status)
    AND (_category IS NULL OR s.category = _category)
    AND (_location IS NULL OR s.location ILIKE '%' || _location || '%')
    AND (
      _search IS NULL 
      OR s.title ILIKE '%' || _search || '%' 
      OR s.description ILIKE '%' || _search || '%'
    )
  ORDER BY 
    CASE WHEN bl.id IS NOT NULL THEN 0 ELSE 1 END,
    bl.boosted_at DESC NULLS LAST,
    s.created_at DESC;
END;
$$;
