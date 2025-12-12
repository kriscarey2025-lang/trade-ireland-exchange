-- Create a function to get services with conditional user exposure
-- Unauthenticated users can only see service details, not user_id
-- Authenticated users can see user_id and profile info

CREATE OR REPLACE FUNCTION public.get_public_services(
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
  type TEXT,
  price NUMERIC,
  price_type TEXT,
  location TEXT,
  images TEXT[],
  status TEXT,
  accepted_categories TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  provider_name TEXT,
  provider_avatar TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_authenticated BOOLEAN;
BEGIN
  is_authenticated := auth.uid() IS NOT NULL;
  
  RETURN QUERY
  SELECT 
    s.id,
    -- Only expose user_id to authenticated users
    CASE WHEN is_authenticated THEN s.user_id ELSE NULL END AS user_id,
    s.title,
    s.description,
    s.category,
    s.type,
    s.price,
    s.price_type,
    s.location,
    s.images,
    s.status,
    s.accepted_categories,
    s.created_at,
    s.updated_at,
    -- Only expose provider info to authenticated users
    CASE WHEN is_authenticated THEN p.full_name ELSE NULL END AS provider_name,
    CASE WHEN is_authenticated THEN p.avatar_url ELSE NULL END AS provider_avatar
  FROM services s
  LEFT JOIN profiles p ON s.user_id = p.id
  WHERE 
    s.status = COALESCE(_status, 'active')
    AND (_category IS NULL OR s.category = _category)
    AND (_location IS NULL OR s.location ILIKE '%' || _location || '%')
    AND (_search IS NULL OR s.title ILIKE '%' || _search || '%' OR s.description ILIKE '%' || _search || '%')
  ORDER BY s.created_at DESC;
END;
$$;

-- Create a function to get a single service by ID with conditional user exposure
CREATE OR REPLACE FUNCTION public.get_service_by_id(_service_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  type TEXT,
  price NUMERIC,
  price_type TEXT,
  location TEXT,
  images TEXT[],
  status TEXT,
  accepted_categories TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  provider_name TEXT,
  provider_avatar TEXT,
  provider_bio TEXT,
  provider_location TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_authenticated BOOLEAN;
BEGIN
  is_authenticated := auth.uid() IS NOT NULL;
  
  RETURN QUERY
  SELECT 
    s.id,
    -- Only expose user_id to authenticated users
    CASE WHEN is_authenticated THEN s.user_id ELSE NULL END AS user_id,
    s.title,
    s.description,
    s.category,
    s.type,
    s.price,
    s.price_type,
    s.location,
    s.images,
    s.status,
    s.accepted_categories,
    s.created_at,
    s.updated_at,
    -- Only expose provider info to authenticated users
    CASE WHEN is_authenticated THEN p.full_name ELSE NULL END AS provider_name,
    CASE WHEN is_authenticated THEN p.avatar_url ELSE NULL END AS provider_avatar,
    CASE WHEN is_authenticated THEN p.bio ELSE NULL END AS provider_bio,
    CASE WHEN is_authenticated THEN p.location ELSE NULL END AS provider_location
  FROM services s
  LEFT JOIN profiles p ON s.user_id = p.id
  WHERE s.id = _service_id;
END;
$$;