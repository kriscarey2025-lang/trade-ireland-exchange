-- Create a function to get public profile data with limited fields
-- This returns only: first name, avatar, bio, location, registered date, verification status, and completed swaps count
-- Excludes: email, phone, full surname, social media URLs

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
  completed_swaps_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    -- Extract only first name (everything before the first space)
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
    -- Count completed swaps where this user participated and marked complete
    (
      SELECT COUNT(*)
      FROM conversations c
      WHERE (
        (c.participant_1 = p.id AND c.completed_by_1 = true) OR
        (c.participant_2 = p.id AND c.completed_by_2 = true)
      )
    ) as completed_swaps_count
  FROM profiles p
  WHERE p.id = _profile_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_public_profile IS 'Returns limited public profile data: first name only (no surname), avatar, bio, location, registration date, founder status, verification status, and completed swaps count. Excludes email, phone, and social media URLs for privacy.';