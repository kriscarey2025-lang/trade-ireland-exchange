-- Create a trigger function to prevent updates to protected fields
CREATE OR REPLACE FUNCTION public.prevent_profile_field_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow changes if this is the first time setting the values (from null to a value)
  -- But prevent changes once values are already set
  
  -- Check full_name
  IF OLD.full_name IS NOT NULL AND NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    RAISE EXCEPTION 'Name cannot be changed after registration';
  END IF;
  
  -- Check email
  IF OLD.email IS NOT NULL AND NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Email cannot be changed after registration';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_profile_field_changes_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_field_changes_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_field_changes();