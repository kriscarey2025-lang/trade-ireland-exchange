-- Create table to track signup rate limits by IP
CREATE TABLE public.signup_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  submission_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.signup_rate_limits ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - this table is only accessed by edge functions using service role

-- Function to check and update rate limit for signups
CREATE OR REPLACE FUNCTION public.check_signup_rate_limit(
  _ip_hash TEXT,
  _max_requests INTEGER DEFAULT 5,
  _window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Get current rate limit record
  SELECT submission_count, window_start INTO v_count, v_window_start
  FROM signup_rate_limits
  WHERE ip_hash = _ip_hash
  FOR UPDATE;
  
  -- If no record exists, create one and allow
  IF NOT FOUND THEN
    INSERT INTO signup_rate_limits (ip_hash, submission_count, window_start)
    VALUES (_ip_hash, 1, now());
    RETURN true;
  END IF;
  
  -- Check if window has expired (reset if so)
  IF (now() - v_window_start) > ((_window_minutes || ' minutes')::interval) THEN
    UPDATE signup_rate_limits 
    SET submission_count = 1, window_start = now()
    WHERE ip_hash = _ip_hash;
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF v_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter and allow
  UPDATE signup_rate_limits 
  SET submission_count = submission_count + 1
  WHERE ip_hash = _ip_hash;
  
  RETURN true;
END;
$$;