-- Create trigger function to notify admin of new sponsors
CREATE OR REPLACE FUNCTION public.notify_admin_new_sponsor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Call the edge function to send email notification
  PERFORM net.http_post(
    url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/notify-admin-new-sponsor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
    ),
    body := jsonb_build_object(
      'sponsor_id', NEW.id,
      'email', NEW.email,
      'tier', NEW.tier,
      'is_public', NEW.is_public,
      'display_name', NEW.display_name,
      'website_url', NEW.website_url,
      'message', NEW.message
    )
  );
  
  RAISE LOG 'Admin notification triggered for new sponsor: %', NEW.email;
  RETURN NEW;
END;
$function$;

-- Create trigger on sponsors table for new inserts
CREATE TRIGGER on_new_sponsor_notify_admin
  AFTER INSERT ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_sponsor();