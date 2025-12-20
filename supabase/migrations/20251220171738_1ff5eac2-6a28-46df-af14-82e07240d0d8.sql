-- Create interests table to track user interest in services
CREATE TABLE public.interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);

-- Enable RLS
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own interests"
ON public.interests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can express interest"
ON public.interests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their interest"
ON public.interests FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service owners can see who's interested"
ON public.interests FOR SELECT
USING (
  service_id IN (
    SELECT id FROM services WHERE user_id = auth.uid()
  )
);

-- Function to create interest notification with match info
CREATE OR REPLACE FUNCTION public.create_interest_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _service RECORD;
  _interested_user RECORD;
  _interested_user_services TEXT;
  _notification_title TEXT;
  _notification_message TEXT;
  _name_parts TEXT[];
  _display_name TEXT;
BEGIN
  -- Get the service details
  SELECT s.*, p.id as owner_id
  INTO _service
  FROM services s
  JOIN profiles p ON s.user_id = p.id
  WHERE s.id = NEW.service_id;
  
  -- Get the interested user's info
  SELECT p.full_name, p.id
  INTO _interested_user
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Format display name as "FirstName L."
  IF _interested_user.full_name IS NOT NULL THEN
    _name_parts := string_to_array(trim(_interested_user.full_name), ' ');
    IF array_length(_name_parts, 1) >= 2 THEN
      _display_name := _name_parts[1] || ' ' || left(_name_parts[array_length(_name_parts, 1)], 1) || '.';
    ELSE
      _display_name := _interested_user.full_name;
    END IF;
  ELSE
    _display_name := 'Someone';
  END IF;
  
  -- Check if the interested user has active services to offer
  SELECT string_agg(title, ', ')
  INTO _interested_user_services
  FROM (
    SELECT title FROM services 
    WHERE user_id = NEW.user_id 
    AND status = 'active'
    AND moderation_status = 'approved'
    LIMIT 3
  ) sub;
  
  -- Create notification
  IF _interested_user_services IS NOT NULL THEN
    _notification_title := _display_name || ' is interested in your skill!';
    _notification_message := 'They can offer: ' || _interested_user_services;
  ELSE
    _notification_title := _display_name || ' is interested!';
    _notification_message := 'Someone is interested in "' || _service.title || '"';
  END IF;
  
  INSERT INTO notifications (user_id, type, title, message, related_service_id)
  VALUES (_service.user_id, 'interest', _notification_title, _notification_message, NEW.service_id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for interest notifications
CREATE TRIGGER on_interest_created
  AFTER INSERT ON public.interests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_interest_notification();

-- Enable realtime for interests
ALTER PUBLICATION supabase_realtime ADD TABLE public.interests;