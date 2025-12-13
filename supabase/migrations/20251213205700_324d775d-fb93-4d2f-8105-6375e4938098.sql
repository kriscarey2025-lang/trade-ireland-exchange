-- Function for admins to create an advertiser by email
CREATE OR REPLACE FUNCTION public.create_advertiser_by_email(
  _email text,
  _business_name text,
  _business_email text,
  _business_phone text DEFAULT NULL,
  _business_website text DEFAULT NULL,
  _location text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _advertiser_id uuid;
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Find the user by email
  SELECT id INTO _user_id
  FROM profiles
  WHERE LOWER(email) = LOWER(_email);
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;
  
  -- Check if advertiser already exists for this user
  IF EXISTS (SELECT 1 FROM advertisers WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already has an advertiser account';
  END IF;
  
  -- Create the advertiser
  INSERT INTO advertisers (user_id, business_name, business_email, business_phone, business_website, location)
  VALUES (_user_id, _business_name, _business_email, _business_phone, _business_website, _location)
  RETURNING id INTO _advertiser_id;
  
  RETURN _advertiser_id;
END;
$$;