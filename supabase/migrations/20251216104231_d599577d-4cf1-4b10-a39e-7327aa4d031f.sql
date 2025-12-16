-- Add moderation columns to community_posts table
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderation_reason text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS moderated_at timestamp with time zone DEFAULT NULL;

-- Create index for moderation queries
CREATE INDEX IF NOT EXISTS idx_community_posts_moderation_status ON public.community_posts(moderation_status);

-- Update get_visible_board_posts to only show approved posts
CREATE OR REPLACE FUNCTION public.get_visible_board_posts()
 RETURNS TABLE(id uuid, user_id uuid, title text, description text, category text, location text, county text, status text, created_at timestamp with time zone, poster_name text, poster_avatar text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    p.avatar_url as poster_avatar
  FROM community_posts cp
  LEFT JOIN profiles p ON cp.user_id = p.id
  WHERE cp.is_visible = true 
    AND cp.status = 'active'
    AND cp.moderation_status = 'approved'
  ORDER BY cp.created_at DESC
  LIMIT 20;
$function$;

-- Update search_community_posts to respect moderation status (admins see all, users see approved)
CREATE OR REPLACE FUNCTION public.search_community_posts(
  _search text DEFAULT NULL::text, 
  _category text DEFAULT NULL::text, 
  _county text DEFAULT NULL::text, 
  _status text DEFAULT NULL::text, 
  _limit integer DEFAULT 50, 
  _offset integer DEFAULT 0
)
 RETURNS TABLE(id uuid, user_id uuid, title text, description text, category text, location text, county text, status text, created_at timestamp with time zone, poster_name text, poster_avatar text, total_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      p.avatar_url as poster_avatar
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
$function$;