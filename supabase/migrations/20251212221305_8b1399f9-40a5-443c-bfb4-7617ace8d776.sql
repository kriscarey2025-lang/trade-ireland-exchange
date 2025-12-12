-- Create table to track message rate limits per user
CREATE TABLE IF NOT EXISTS public.message_rate_limits (
  user_id UUID PRIMARY KEY,
  message_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on the rate limits table (only system can access)
ALTER TABLE public.message_rate_limits ENABLE ROW LEVEL SECURITY;

-- Update the prevent_message_spam function to include per-minute limits
CREATE OR REPLACE FUNCTION public.prevent_message_spam()
RETURNS TRIGGER AS $$
DECLARE
  v_last_message_time TIMESTAMPTZ;
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Check 1: Minimum 1 second between messages
  SELECT created_at INTO v_last_message_time
  FROM messages
  WHERE sender_id = NEW.sender_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_last_message_time IS NOT NULL AND 
     (now() - v_last_message_time) < INTERVAL '1 second' THEN
    RAISE EXCEPTION 'Please wait before sending another message';
  END IF;
  
  -- Check 2: Maximum 30 messages per minute
  -- Upsert the rate limit record
  INSERT INTO message_rate_limits (user_id, message_count, window_start)
  VALUES (NEW.sender_id, 0, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current count and window
  SELECT message_count, window_start INTO v_count, v_window_start
  FROM message_rate_limits
  WHERE user_id = NEW.sender_id
  FOR UPDATE;
  
  -- Reset window if more than 1 minute has passed
  IF (now() - v_window_start) > INTERVAL '1 minute' THEN
    UPDATE message_rate_limits 
    SET message_count = 1, window_start = now()
    WHERE user_id = NEW.sender_id;
  ELSE
    -- Check if limit exceeded
    IF v_count >= 30 THEN
      RAISE EXCEPTION 'Rate limit exceeded: maximum 30 messages per minute';
    END IF;
    
    -- Increment counter
    UPDATE message_rate_limits
    SET message_count = message_count + 1
    WHERE user_id = NEW.sender_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;