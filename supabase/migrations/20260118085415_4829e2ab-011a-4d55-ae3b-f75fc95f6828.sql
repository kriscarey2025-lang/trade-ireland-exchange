-- Create function to get total message count (bypasses RLS for public stats)
CREATE OR REPLACE FUNCTION public.get_message_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM messages;
$$;