-- Allow inserting user_roles for the first doctor (bootstrap)
-- This is a temporary policy that allows inserting a doctor role when no doctors exist
CREATE OR REPLACE FUNCTION public.no_doctors_exist()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'doctor'
  )
$$;

-- Policy to allow first doctor signup
CREATE POLICY "Allow first doctor signup"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    role = 'doctor' AND public.no_doctors_exist()
  );

-- Also allow authenticated users to insert patient roles for themselves
CREATE POLICY "Users can add patient role for themselves"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND role = 'patient'
  );