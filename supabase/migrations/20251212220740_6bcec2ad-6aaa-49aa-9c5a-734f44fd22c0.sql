-- Fix 1: Add message content length constraint
ALTER TABLE messages ADD CONSTRAINT check_content_length 
  CHECK (char_length(content) <= 10000);

-- Fix 2: Harden storage policies with strict filename pattern validation
DROP POLICY IF EXISTS "Users can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own service images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own service images" ON storage.objects;

-- Recreate with strict pattern matching (user_id folder + safe filename + image extension only)
CREATE POLICY "Users can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND name ~ ('^[0-9a-f-]{36}/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$')
);

CREATE POLICY "Users can update their own service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND name ~ ('^[0-9a-f-]{36}/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$')
);

CREATE POLICY "Users can delete their own service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND name ~ ('^[0-9a-f-]{36}/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$')
);

-- Fix 3: Add simple rate limiting (1 second minimum between messages)
CREATE OR REPLACE FUNCTION public.prevent_message_spam()
RETURNS TRIGGER AS $$
DECLARE
  v_last_message_time TIMESTAMPTZ;
BEGIN
  -- Get sender's last message time
  SELECT created_at INTO v_last_message_time
  FROM messages
  WHERE sender_id = NEW.sender_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Require at least 1 second between messages
  IF v_last_message_time IS NOT NULL AND 
     (now() - v_last_message_time) < INTERVAL '1 second' THEN
    RAISE EXCEPTION 'Please wait before sending another message';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_message_spacing
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION public.prevent_message_spam();