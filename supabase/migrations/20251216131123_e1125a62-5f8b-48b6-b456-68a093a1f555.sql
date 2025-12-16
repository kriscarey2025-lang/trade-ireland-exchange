-- Update function to handle both approvals and rejections
CREATE OR REPLACE FUNCTION public.send_advertiser_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle approval: status changes to 'contacted' or 'approved'
  IF (OLD.status = 'pending' AND (NEW.status = 'contacted' OR NEW.status = 'approved')) THEN
    PERFORM net.http_post(
      url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/send-advertiser-welcome',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'contact_name', NEW.contact_name,
        'business_name', NEW.business_name
      )
    );
    RAISE LOG 'Advertiser welcome email triggered for: %', NEW.email;
  
  -- Handle rejection: status changes to 'rejected'
  ELSIF (OLD.status = 'pending' AND NEW.status = 'rejected') THEN
    PERFORM net.http_post(
      url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/send-advertiser-rejection',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'contact_name', NEW.contact_name,
        'business_name', NEW.business_name
      )
    );
    RAISE LOG 'Advertiser rejection email triggered for: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;