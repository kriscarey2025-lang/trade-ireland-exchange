-- Create function to send admin notification on new signup
CREATE OR REPLACE FUNCTION public.notify_admin_new_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/notify-new-signup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'full_name', NEW.full_name,
      'location', NEW.location
    )
  );
  RAISE LOG 'Admin notification triggered for new signup: %', NEW.email;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table for new signups
DROP TRIGGER IF EXISTS on_new_user_signup_notify_admin ON public.profiles;
CREATE TRIGGER on_new_user_signup_notify_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_signup();