-- Create table to track rate limits for advertiser interest submissions
CREATE TABLE public.advertiser_interest_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  submission_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertiser_interest_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow access through SECURITY DEFINER functions
CREATE POLICY "Deny all direct access"
ON public.advertiser_interest_rate_limits
FOR ALL
USING (false);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_advertiser_rate_limit(_ip_hash TEXT, _max_requests INTEGER DEFAULT 3, _window_minutes INTEGER DEFAULT 60)
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
  FROM advertiser_interest_rate_limits
  WHERE ip_hash = _ip_hash
  FOR UPDATE;
  
  -- If no record exists, create one and allow
  IF NOT FOUND THEN
    INSERT INTO advertiser_interest_rate_limits (ip_hash, submission_count, window_start)
    VALUES (_ip_hash, 1, now());
    RETURN true;
  END IF;
  
  -- Check if window has expired (reset if so)
  IF (now() - v_window_start) > ((_window_minutes || ' minutes')::interval) THEN
    UPDATE advertiser_interest_rate_limits 
    SET submission_count = 1, window_start = now()
    WHERE ip_hash = _ip_hash;
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF v_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter and allow
  UPDATE advertiser_interest_rate_limits 
  SET submission_count = submission_count + 1
  WHERE ip_hash = _ip_hash;
  
  RETURN true;
END;
$$;

-- Function to insert advertiser interest (for use by edge function)
CREATE OR REPLACE FUNCTION public.insert_advertiser_interest(
  _business_name TEXT,
  _contact_name TEXT,
  _email TEXT,
  _phone TEXT DEFAULT NULL,
  _location TEXT DEFAULT NULL,
  _website TEXT DEFAULT NULL,
  _message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_id UUID;
BEGIN
  INSERT INTO advertiser_interests (business_name, contact_name, email, phone, location, website, message)
  VALUES (_business_name, _contact_name, _email, _phone, _location, _website, _message)
  RETURNING id INTO _new_id;
  
  RETURN _new_id;
END;
$$;