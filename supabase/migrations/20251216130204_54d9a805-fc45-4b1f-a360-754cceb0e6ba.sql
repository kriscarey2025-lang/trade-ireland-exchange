-- Create function to send advertiser welcome email via edge function
CREATE OR REPLACE FUNCTION public.send_advertiser_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _supabase_url TEXT;
  _service_role_key TEXT;
BEGIN
  -- Only trigger when status changes to 'contacted' or 'approved' (meaning admin approved)
  IF (OLD.status = 'pending' AND (NEW.status = 'contacted' OR NEW.status = 'approved')) THEN
    -- Get Supabase URL and service role key from vault or environment
    _supabase_url := current_setting('app.settings.supabase_url', true);
    _service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Use pg_net to call the edge function
    PERFORM net.http_post(
      url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/send-advertiser-welcome',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'contact_name', NEW.contact_name,
        'business_name', NEW.business_name
      )
    );
    
    RAISE LOG 'Advertiser welcome email triggered for: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on advertiser_interests table
DROP TRIGGER IF EXISTS trigger_send_advertiser_welcome ON public.advertiser_interests;

CREATE TRIGGER trigger_send_advertiser_welcome
  AFTER UPDATE ON public.advertiser_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.send_advertiser_welcome_email();