-- Create function to call welcome email edge function
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email text;
  _full_name text;
BEGIN
  -- Get email and name from the new profile
  _email := NEW.email;
  _full_name := COALESCE(NEW.full_name, 'there');
  
  -- Only send if email exists
  IF _email IS NOT NULL AND _email != '' THEN
    -- Use pg_net to call the edge function asynchronously
    PERFORM net.http_post(
      url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
      ),
      body := jsonb_build_object('email', _email, 'fullName', _full_name)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table for new inserts
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();