-- Drop the trigger that sends admin notification on new signup
DROP TRIGGER IF EXISTS on_new_user_signup_notify_admin ON public.profiles;

-- Drop the function that triggers the notification
DROP FUNCTION IF EXISTS public.notify_admin_new_signup();