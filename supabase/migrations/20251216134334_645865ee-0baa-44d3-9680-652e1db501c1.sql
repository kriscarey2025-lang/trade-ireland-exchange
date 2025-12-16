-- Create trigger for sending advertiser emails on status change
CREATE TRIGGER on_advertiser_interest_status_change
  AFTER UPDATE ON public.advertiser_interests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.send_advertiser_welcome_email();