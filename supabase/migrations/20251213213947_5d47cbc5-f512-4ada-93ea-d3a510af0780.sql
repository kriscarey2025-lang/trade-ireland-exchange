-- Create a function to check ad count limit
CREATE OR REPLACE FUNCTION public.check_ad_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ad_count INTEGER;
  max_ads INTEGER := 3;
BEGIN
  -- Count existing ads for this advertiser
  SELECT COUNT(*) INTO ad_count
  FROM ads
  WHERE advertiser_id = NEW.advertiser_id;
  
  IF ad_count >= max_ads THEN
    RAISE EXCEPTION 'Maximum of % ads per advertiser reached', max_ads;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce the limit on insert
CREATE TRIGGER enforce_ad_limit
  BEFORE INSERT ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_ad_limit();