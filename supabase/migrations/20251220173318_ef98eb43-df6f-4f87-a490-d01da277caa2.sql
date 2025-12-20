-- Update the interest notification function to also call the email edge function
CREATE OR REPLACE FUNCTION public.create_interest_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service_owner_id uuid;
  v_service_title text;
  v_interested_user_name text;
  v_user_services text;
BEGIN
  -- Get service owner and title
  SELECT user_id, title INTO v_service_owner_id, v_service_title
  FROM public.services
  WHERE id = NEW.service_id;

  -- Don't notify if the user is interested in their own service
  IF v_service_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get interested user's name
  SELECT full_name INTO v_interested_user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get services the interested user offers (for potential swaps)
  SELECT string_agg(title, ', ' ORDER BY created_at DESC)
  INTO v_user_services
  FROM (
    SELECT title, created_at
    FROM public.services
    WHERE user_id = NEW.user_id
    AND status = 'active'
    LIMIT 3
  ) sub;

  -- Create in-app notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_service_id
  ) VALUES (
    v_service_owner_id,
    'interest',
    COALESCE(v_interested_user_name, 'Someone') || ' is interested!',
    COALESCE(v_interested_user_name, 'A user') || ' expressed interest in "' || v_service_title || '"' ||
    CASE 
      WHEN v_user_services IS NOT NULL THEN '. They offer: ' || v_user_services
      ELSE ''
    END,
    NEW.service_id
  );

  -- Call the edge function to send email notification (async via pg_net if available)
  -- This is handled by the application layer instead for better reliability

  RETURN NEW;
END;
$$;