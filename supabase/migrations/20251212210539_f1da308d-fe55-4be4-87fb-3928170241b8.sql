-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'match',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create function to find matches and create notifications
CREATE OR REPLACE FUNCTION public.create_match_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matching_service RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- If new service is an OFFER, find matching REQUESTS in the same category
  IF NEW.type = 'offer' THEN
    FOR matching_service IN
      SELECT s.id, s.title, s.user_id, p.full_name, p.email
      FROM services s
      LEFT JOIN profiles p ON s.user_id = p.id
      WHERE s.type = 'request'
        AND s.category = NEW.category
        AND s.user_id != NEW.user_id
        AND s.status = 'active'
    LOOP
      -- Notify the requester that someone is now offering what they need
      notification_title := 'New match found!';
      notification_message := 'Someone is now offering "' || NEW.title || '" which matches your request.';
      
      INSERT INTO notifications (user_id, type, title, message, related_service_id)
      VALUES (matching_service.user_id, 'match', notification_title, notification_message, NEW.id);
    END LOOP;
    
  -- If new service is a REQUEST, find matching OFFERS in the same category
  ELSIF NEW.type = 'request' THEN
    FOR matching_service IN
      SELECT s.id, s.title, s.user_id, p.full_name, p.email
      FROM services s
      LEFT JOIN profiles p ON s.user_id = p.id
      WHERE s.type = 'offer'
        AND s.category = NEW.category
        AND s.user_id != NEW.user_id
        AND s.status = 'active'
    LOOP
      -- Notify the offerer that someone is looking for their service
      notification_title := 'Someone needs your service!';
      notification_message := 'Someone is looking for "' || NEW.title || '" which matches what you offer.';
      
      INSERT INTO notifications (user_id, type, title, message, related_service_id)
      VALUES (matching_service.user_id, 'match', notification_title, notification_message, NEW.id);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run on new service insert
CREATE TRIGGER on_service_created_find_matches
  AFTER INSERT ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.create_match_notifications();