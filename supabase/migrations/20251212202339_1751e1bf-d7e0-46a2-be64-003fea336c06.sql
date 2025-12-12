-- Drop and recreate the SELECT policy to explicitly target only authenticated users
DROP POLICY IF EXISTS "Users can view own profile fully" ON public.profiles;

CREATE POLICY "Users can view own profile fully"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);