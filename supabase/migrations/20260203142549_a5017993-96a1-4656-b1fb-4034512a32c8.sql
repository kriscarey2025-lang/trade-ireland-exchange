
-- Drop both functions first
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);
DROP FUNCTION IF EXISTS public.get_public_services(text, text, text, text);

-- Recreate get_public_profile with website_url
CREATE FUNCTION public.get_public_profile(_profile_id uuid)
 RETURNS TABLE(id uuid, first_name text, avatar_url text, bio text, location text, registered_at timestamp with time zone, is_founder boolean, verification_status text, completed_swaps_count bigint, linkedin_url text, facebook_url text, instagram_url text, website_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    COALESCE(
      CASE 
        WHEN position(' ' in COALESCE(p.full_name, '')) > 0 
        THEN left(p.full_name, position(' ' in p.full_name) - 1)
        ELSE p.full_name
      END,
      'Anonymous'
    ) as first_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.created_at as registered_at,
    COALESCE(p.is_founder, false) as is_founder,
    COALESCE(p.verification_status, 'unverified') as verification_status,
    (
      SELECT COUNT(*)
      FROM conversations c
      WHERE (
        (c.participant_1 = p.id AND c.completed_by_1 = true) OR
        (c.participant_2 = p.id AND c.completed_by_2 = true)
      )
    ) as completed_swaps_count,
    p.linkedin_url,
    p.facebook_url,
    p.instagram_url,
    p.website_url
  FROM profiles p
  WHERE p.id = _profile_id;
$function$;

-- Recreate get_public_services with provider_website
CREATE FUNCTION public.get_public_services(_category text DEFAULT NULL::text, _location text DEFAULT NULL::text, _search text DEFAULT NULL::text, _status text DEFAULT 'active'::text)
 RETURNS TABLE(id uuid, user_id uuid, title text, description text, category text, type text, price numeric, price_type text, location text, images text[], status text, accepted_categories text[], created_at timestamp with time zone, updated_at timestamp with time zone, provider_name text, provider_avatar text, provider_linkedin text, provider_facebook text, provider_instagram text, provider_website text, provider_verification_status text, provider_is_founder boolean, completed_swaps_count integer, is_time_sensitive boolean, needed_by_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
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
    p.full_name AS provider_name,
    p.avatar_url AS provider_avatar,
    p.linkedin_url AS provider_linkedin,
    p.facebook_url AS provider_facebook,
    p.instagram_url AS provider_instagram,
    p.website_url AS provider_website,
    p.verification_status AS provider_verification_status,
    COALESCE(p.is_founder, false) AS provider_is_founder,
    COALESCE(s.completed_swaps_count, 0) AS completed_swaps_count,
    COALESCE(s.is_time_sensitive, false) AS is_time_sensitive,
    s.needed_by_date
  FROM services s
  LEFT JOIN profiles p ON s.user_id = p.id
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
  ORDER BY s.created_at DESC;
END;
$function$;
