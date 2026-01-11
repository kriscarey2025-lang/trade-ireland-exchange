-- Drop the existing function first to change return type
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Recreate with social media URLs included
CREATE OR REPLACE FUNCTION public.get_public_profile(_profile_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  avatar_url text,
  bio text,
  location text,
  registered_at timestamptz,
  is_founder boolean,
  verification_status text,
  completed_swaps_count bigint,
  linkedin_url text,
  facebook_url text,
  instagram_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    p.instagram_url
  FROM profiles p
  WHERE p.id = _profile_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_public_profile IS 'Returns public profile data: first name only, avatar, bio, location, registration date, founder/verification status, completed swaps, and social media URLs. Excludes email and phone.';