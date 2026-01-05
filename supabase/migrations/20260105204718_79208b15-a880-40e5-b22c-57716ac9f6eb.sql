-- Drop and recreate get_public_services with SECURITY INVOKER
DROP FUNCTION IF EXISTS public.get_public_services(text,text,text,text);

CREATE FUNCTION public.get_public_services(
  _category TEXT DEFAULT NULL,
  _location TEXT DEFAULT NULL,
  _search TEXT DEFAULT NULL,
  _status TEXT DEFAULT 'active'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  location TEXT,
  type TEXT,
  status TEXT,
  price NUMERIC,
  price_type TEXT,
  images TEXT[],
  accepted_categories TEXT[],
  completed_swaps_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  provider_name TEXT,
  provider_avatar TEXT,
  provider_verification_status TEXT,
  provider_is_founder BOOLEAN,
  provider_facebook TEXT,
  provider_instagram TEXT,
  provider_linkedin TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.user_id,
    s.title,
    s.description,
    s.category,
    s.location,
    s.type,
    s.status,
    s.price,
    s.price_type,
    s.images,
    s.accepted_categories,
    s.completed_swaps_count,
    s.created_at,
    s.updated_at,
    p.full_name AS provider_name,
    p.avatar_url AS provider_avatar,
    p.verification_status AS provider_verification_status,
    p.is_founder AS provider_is_founder,
    p.facebook_url AS provider_facebook,
    p.instagram_url AS provider_instagram,
    p.linkedin_url AS provider_linkedin
  FROM public.services s
  LEFT JOIN public.profiles p ON s.user_id = p.id
  WHERE
    s.status = COALESCE(_status, 'active')
    AND (s.moderation_status IS NULL OR s.moderation_status = 'approved')
    AND (_category IS NULL OR s.category = _category)
    AND (_location IS NULL OR s.location ILIKE '%' || _location || '%')
    AND (_search IS NULL OR s.title ILIKE '%' || _search || '%' OR s.description ILIKE '%' || _search || '%')
  ORDER BY s.created_at DESC;
END;
$$;