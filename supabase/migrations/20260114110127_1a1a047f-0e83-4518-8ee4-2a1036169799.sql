-- Create a function to get public swap statistics
CREATE OR REPLACE FUNCTION public.get_swap_stats()
RETURNS TABLE (
  completed_count bigint,
  in_progress_count bigint,
  pending_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM conversations WHERE swap_status = 'completed') as completed_count,
    (SELECT COUNT(*) FROM conversations WHERE swap_status = 'accepted') as in_progress_count,
    (SELECT COUNT(*) FROM conversations WHERE swap_status = 'pending') as pending_count;
END;
$$;