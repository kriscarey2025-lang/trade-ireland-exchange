-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_visible_board_posts();
DROP FUNCTION IF EXISTS public.search_community_posts(text, text, text, text, integer, integer);

-- Recreate get_visible_board_posts with image_url
CREATE FUNCTION public.get_visible_board_posts()
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  title text, 
  description text, 
  category text, 
  location text, 
  county text, 
  status text, 
  created_at timestamp with time zone, 
  poster_name text, 
  poster_avatar text,
  image_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cp.id,
    cp.user_id,
    cp.title,
    cp.description,
    cp.category,
    cp.location,
    cp.county,
    cp.status,
    cp.created_at,
    p.full_name as poster_name,
    p.avatar_url as poster_avatar,
    cp.image_url
  FROM community_posts cp
  LEFT JOIN profiles p ON cp.user_id = p.id
  WHERE cp.is_visible = true 
    AND cp.status = 'active'
    AND cp.moderation_status = 'approved'
  ORDER BY cp.created_at DESC
  LIMIT 20;
$$;

-- Recreate search_community_posts with image_url
CREATE FUNCTION public.search_community_posts(
  _search text DEFAULT NULL,
  _category text DEFAULT NULL,
  _county text DEFAULT NULL,
  _status text DEFAULT NULL,
  _limit integer DEFAULT 50,
  _offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  title text, 
  description text, 
  category text, 
  location text, 
  county text, 
  status text, 
  created_at timestamp with time zone, 
  poster_name text, 
  poster_avatar text,
  image_url text,
  total_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT 
      cp.id,
      cp.user_id,
      cp.title,
      cp.description,
      cp.category,
      cp.location,
      cp.county,
      cp.status,
      cp.created_at,
      p.full_name as poster_name,
      p.avatar_url as poster_avatar,
      cp.image_url
    FROM community_posts cp
    LEFT JOIN profiles p ON cp.user_id = p.id
    WHERE 
      cp.moderation_status = 'approved'
      AND (_category IS NULL OR cp.category = _category)
      AND (_county IS NULL OR cp.county = _county)
      AND (_status IS NULL OR cp.status = _status)
      AND (_search IS NULL OR cp.title ILIKE '%' || _search || '%' OR cp.description ILIKE '%' || _search || '%')
    ORDER BY cp.created_at DESC
  )
  SELECT *, (SELECT COUNT(*) FROM filtered) as total_count
  FROM filtered
  LIMIT _limit
  OFFSET _offset;
$$;