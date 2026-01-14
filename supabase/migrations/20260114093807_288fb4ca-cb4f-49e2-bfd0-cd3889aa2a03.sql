-- Create a function to get top swappers for the leaderboard
CREATE OR REPLACE FUNCTION public.get_top_swappers(_limit integer DEFAULT 5)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  location text,
  is_founder boolean,
  verification_status text,
  completed_swaps bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.location,
    p.is_founder,
    p.verification_status,
    (SELECT COUNT(*) FROM conversations c 
     WHERE (c.participant_1 = p.id OR c.participant_2 = p.id) 
     AND c.completed_by_1 = true AND c.completed_by_2 = true) as completed_swaps
  FROM profiles p
  WHERE p.full_name IS NOT NULL
  ORDER BY completed_swaps DESC, p.created_at ASC
  LIMIT _limit;
$$;