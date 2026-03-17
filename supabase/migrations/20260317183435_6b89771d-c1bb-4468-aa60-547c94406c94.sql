
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _service RECORD;
  _commenter_name TEXT;
  _display_name TEXT;
  _name_parts TEXT[];
BEGIN
  SELECT s.user_id, s.title INTO _service
  FROM services s
  WHERE s.id = NEW.service_id;

  IF _service.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO _commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  IF _commenter_name IS NOT NULL AND _commenter_name != 'Someone' THEN
    _name_parts := string_to_array(trim(_commenter_name), ' ');
    IF array_length(_name_parts, 1) >= 2 THEN
      _display_name := _name_parts[1] || ' ' || left(_name_parts[array_length(_name_parts, 1)], 1) || '.';
    ELSE
      _display_name := _commenter_name;
    END IF;
  ELSE
    _display_name := 'Someone';
  END IF;

  -- In-app notification
  INSERT INTO notifications (user_id, type, title, message, related_service_id, related_user_id)
  VALUES (
    _service.user_id,
    'comment',
    _display_name || ' commented on your listing',
    CASE
      WHEN LENGTH(NEW.content) > 100 THEN LEFT(NEW.content, 100) || '...'
      ELSE NEW.content
    END,
    NEW.service_id,
    NEW.user_id
  );

  -- Email notification
  PERFORM net.http_post(
    url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/send-comment-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
    ),
    body := jsonb_build_object(
      'service_owner_id', _service.user_id,
      'commenter_name', _display_name,
      'comment_text', NEW.content,
      'service_id', NEW.service_id,
      'service_title', _service.title
    )
  );

  RETURN NEW;
END;
$$;
