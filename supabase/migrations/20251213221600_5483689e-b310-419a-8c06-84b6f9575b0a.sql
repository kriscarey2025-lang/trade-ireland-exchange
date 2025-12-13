-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_public_services(text, text, text, text);
DROP FUNCTION IF EXISTS public.get_service_by_id(uuid);

-- Recreate get_public_services with verification_status
CREATE FUNCTION public.get_public_services(_category text DEFAULT NULL::text, _location text DEFAULT NULL::text, _search text DEFAULT NULL::text, _status text DEFAULT 'active'::text)
 RETURNS TABLE(id uuid, user_id uuid, title text, description text, category text, type text, price numeric, price_type text, location text, images text[], status text, accepted_categories text[], created_at timestamp with time zone, updated_at timestamp with time zone, provider_name text, provider_avatar text, provider_linkedin text, provider_facebook text, provider_instagram text, provider_verification_status text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_authenticated BOOLEAN;
BEGIN
  is_authenticated := auth.uid() IS NOT NULL;
  
  RETURN QUERY
  SELECT 
    s.id,
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
    CASE WHEN is_authenticated THEN p.full_name ELSE NULL END AS provider_name,
    CASE WHEN is_authenticated THEN p.avatar_url ELSE NULL END AS provider_avatar,
    CASE WHEN is_authenticated THEN p.linkedin_url ELSE NULL END AS provider_linkedin,
    CASE WHEN is_authenticated THEN p.facebook_url ELSE NULL END AS provider_facebook,
    CASE WHEN is_authenticated THEN p.instagram_url ELSE NULL END AS provider_instagram,
    CASE WHEN is_authenticated THEN p.verification_status ELSE NULL END AS provider_verification_status
  FROM services s
  LEFT JOIN profiles p ON s.user_id = p.id
  WHERE 
    s.status = COALESCE(_status, 'active')
    AND (_category IS NULL OR s.category = _category)
    AND (_location IS NULL OR s.location ILIKE '%' || _location || '%')
    AND (_search IS NULL OR s.title ILIKE '%' || _search || '%' OR s.description ILIKE '%' || _search || '%')
  ORDER BY s.created_at DESC;
END;
$function$;

-- Recreate get_service_by_id with verification_status
CREATE FUNCTION public.get_service_by_id(_service_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, title text, description text, category text, type text, price numeric, price_type text, location text, images text[], status text, accepted_categories text[], created_at timestamp with time zone, updated_at timestamp with time zone, provider_name text, provider_avatar text, provider_bio text, provider_location text, provider_linkedin text, provider_facebook text, provider_instagram text, provider_verification_status text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_authenticated BOOLEAN;
BEGIN
  is_authenticated := auth.uid() IS NOT NULL;
  
  RETURN QUERY
  SELECT 
    s.id,
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
    CASE WHEN is_authenticated THEN p.full_name ELSE NULL END AS provider_name,
    CASE WHEN is_authenticated THEN p.avatar_url ELSE NULL END AS provider_avatar,
    CASE WHEN is_authenticated THEN p.bio ELSE NULL END AS provider_bio,
    CASE WHEN is_authenticated THEN p.location ELSE NULL END AS provider_location,
    CASE WHEN is_authenticated THEN p.linkedin_url ELSE NULL END AS provider_linkedin,
    CASE WHEN is_authenticated THEN p.facebook_url ELSE NULL END AS provider_facebook,
    CASE WHEN is_authenticated THEN p.instagram_url ELSE NULL END AS provider_instagram,
    CASE WHEN is_authenticated THEN p.verification_status ELSE NULL END AS provider_verification_status
  FROM services s
  LEFT JOIN profiles p ON s.user_id = p.id
  WHERE s.id = _service_id;
END;
$function$;