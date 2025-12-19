-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;

-- Create new policy that requires authentication for direct table access
CREATE POLICY "Authenticated users can view community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (true);

-- Update get_visible_board_posts to mask user_id for unauthenticated users
CREATE OR REPLACE FUNCTION public.get_visible_board_posts()
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_authenticated BOOLEAN;
BEGIN
  is_authenticated := auth.uid() IS NOT NULL;
  
  RETURN QUERY
  SELECT 
    cp.id,
    CASE WHEN is_authenticated THEN cp.user_id ELSE NULL END AS user_id,
    cp.title,
    cp.description,
    cp.category,
    cp.location,
    cp.county,
    cp.status,
    cp.created_at,
    CASE WHEN is_authenticated THEN p.full_name ELSE NULL END AS poster_name,
    CASE WHEN is_authenticated THEN p.avatar_url ELSE NULL END AS poster_avatar,
    cp.image_url
  FROM community_posts cp
  LEFT JOIN profiles p ON cp.user_id = p.id
  WHERE cp.is_visible = true 
    AND cp.status = 'active'
    AND cp.moderation_status = 'approved'
  ORDER BY cp.created_at DESC
  LIMIT 20;
END;
$$;

-- Update search_community_posts to mask user_id for unauthenticated users
CREATE OR REPLACE FUNCTION public.search_community_posts(
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_authenticated BOOLEAN;
BEGIN
  is_authenticated := auth.uid() IS NOT NULL;
  
  RETURN QUERY
  WITH filtered AS (
    SELECT 
      cp.id,
      CASE WHEN is_authenticated THEN cp.user_id ELSE NULL END AS user_id,
      cp.title,
      cp.description,
      cp.category,
      cp.location,
      cp.county,
      cp.status,
      cp.created_at,
      CASE WHEN is_authenticated THEN p.full_name ELSE NULL END AS poster_name,
      CASE WHEN is_authenticated THEN p.avatar_url ELSE NULL END AS poster_avatar,
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
  SELECT f.*, (SELECT COUNT(*) FROM filtered) as total_count
  FROM filtered f
  LIMIT _limit
  OFFSET _offset;
END;
$$;