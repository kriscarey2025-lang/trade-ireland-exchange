-- Update the message notification trigger to use formatted display name
CREATE OR REPLACE FUNCTION public.create_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _recipient_id UUID;
  _sender_name TEXT;
  _display_name TEXT;
  _conversation RECORD;
  _name_parts TEXT[];
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
  
  -- Format display name as "FirstName L."
  IF _sender_name IS NOT NULL AND _sender_name != 'Someone' THEN
    _name_parts := string_to_array(trim(_sender_name), ' ');
    IF array_length(_name_parts, 1) >= 2 THEN
      _display_name := _name_parts[1] || ' ' || left(_name_parts[array_length(_name_parts, 1)], 1) || '.';
    ELSE
      _display_name := _sender_name;
    END IF;
  ELSE
    _display_name := 'Someone';
  END IF;
  
  -- Create notification for recipient
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    _recipient_id,
    'message',
    'New message from ' || _display_name,
    CASE 
      WHEN LENGTH(NEW.content) > 100 THEN LEFT(NEW.content, 100) || '...'
      ELSE NEW.content
    END
  );
  
  RETURN NEW;
END;
$function$;