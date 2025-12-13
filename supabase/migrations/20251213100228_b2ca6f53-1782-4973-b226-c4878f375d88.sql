-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger function to notify on new messages
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _recipient_id UUID;
  _sender_name TEXT;
  _conversation RECORD;
BEGIN
  -- Get conversation details
  SELECT * INTO _conversation
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Determine recipient (the other participant)
  IF _conversation.participant_1 = NEW.sender_id THEN
    _recipient_id := _conversation.participant_2;
  ELSE
    _recipient_id := _conversation.participant_1;
  END IF;
  
  -- Get sender name
  SELECT COALESCE(full_name, 'Someone') INTO _sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Create notification for recipient
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    _recipient_id,
    'message',
    'New message from ' || _sender_name,
    CASE 
      WHEN LENGTH(NEW.content) > 100 THEN LEFT(NEW.content, 100) || '...'
      ELSE NEW.content
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message_notification ON messages;
CREATE TRIGGER on_new_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notification();

-- Allow users to insert notifications (for system-generated ones, we use SECURITY DEFINER functions)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);