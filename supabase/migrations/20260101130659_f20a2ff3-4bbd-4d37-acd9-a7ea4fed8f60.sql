-- Create or replace the review_verification function to send email notifications
CREATE OR REPLACE FUNCTION public.review_verification(_request_id uuid, _approved boolean, _notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _new_status text;
  _user_email text;
  _user_name text;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  _new_status := CASE WHEN _approved THEN 'approved' ELSE 'rejected' END;
  
  -- Get the user_id from the request
  SELECT user_id INTO _user_id
  FROM verification_requests
  WHERE id = _request_id;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Verification request not found';
  END IF;
  
  -- Get user's email and name
  SELECT email, full_name INTO _user_email, _user_name
  FROM profiles
  WHERE id = _user_id;
  
  -- Update the verification request
  UPDATE verification_requests
  SET 
    status = _new_status,
    admin_notes = _notes,
    reviewed_at = now()
  WHERE id = _request_id;
  
  -- Update the user's profile verification status
  UPDATE profiles
  SET verification_status = CASE WHEN _approved THEN 'verified' ELSE 'rejected' END
  WHERE id = _user_id;
  
  -- Send email notification via edge function
  IF _user_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://lporltdxjhouspwmmrjd.supabase.co/functions/v1/send-verification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3JsdGR4amhvdXNwd21tcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU2NzUsImV4cCI6MjA4MTEzMTY3NX0.AitiS6e2TQQJS0VgIV9OrbtZ8YJ1_HekbT5BgnYeI-s'
      ),
      body := jsonb_build_object(
        'email', _user_email,
        'full_name', _user_name,
        'approved', _approved,
        'rejection_reason', _notes
      )
    );
    RAISE LOG 'Verification email triggered for user: %', _user_email;
  END IF;
END;
$$;