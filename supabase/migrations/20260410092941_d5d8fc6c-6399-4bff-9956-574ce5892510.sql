
CREATE OR REPLACE FUNCTION public.get_public_services(
  _category text DEFAULT NULL,
  _location text DEFAULT NULL,
  _search text DEFAULT NULL,
  _status text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, user_id uuid, title text, description text, category text, type text,
  price numeric, price_type text, location text, images text[], status text,
  accepted_categories text[], created_at timestamptz, updated_at timestamptz,
  provider_name text, provider_avatar text, provider_linkedin text, provider_facebook text,
  provider_instagram text, provider_website text, provider_verification_status text,
  provider_is_founder boolean, completed_swaps_count integer,
  is_time_sensitive boolean, needed_by_date timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
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
    COALESCE(user_totals.total_swaps, 0)::integer AS completed_swaps_count,
    COALESCE(s.is_time_sensitive, false) AS is_time_sensitive,
    s.needed_by_date
  FROM services s
  LEFT JOIN profiles p ON s.user_id = p.id
  LEFT JOIN boosted_listings bl ON s.id = bl.service_id 
    AND bl.status = 'active' AND bl.expires_at > now()
  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(s2.completed_swaps_count), 0) AS total_swaps
    FROM services s2
    WHERE s2.user_id = s.user_id
  ) user_totals ON true
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
