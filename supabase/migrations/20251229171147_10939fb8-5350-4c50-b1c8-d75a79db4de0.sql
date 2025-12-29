-- Create function to notify admin of new service offers
CREATE OR REPLACE FUNCTION public.notify_admin_new_service_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_name TEXT;
  _user_email TEXT;
BEGIN
  -- Only notify for offers (not requests)
  IF NEW.type != 'offer' THEN
    RETURN NEW;
  END IF;

  -- Get the user's profile info
  SELECT full_name, email INTO _user_name, _user_email
  FROM profiles
  WHERE id = NEW.user_id;

  -- Call the edge function to send email
  PERFORM net.http_post(
    url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/notify-admin-new-service',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
    ),
    body := jsonb_build_object(
      'service_id', NEW.id,
      'service_title', NEW.title,
      'service_description', NEW.description,
      'service_category', NEW.category,
      'service_location', NEW.location,
      'user_id', NEW.user_id,
      'user_name', _user_name,
      'user_email', _user_email
    )
  );
  
  RAISE LOG 'Admin notification triggered for new service offer: %', NEW.title;
  RETURN NEW;
END;
$function$;

-- Create trigger for new service offers
CREATE TRIGGER on_new_service_offer_notify_admin
  AFTER INSERT ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_service_offer();