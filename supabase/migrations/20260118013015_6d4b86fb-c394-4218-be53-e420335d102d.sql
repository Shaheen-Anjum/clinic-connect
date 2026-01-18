-- Add unique constraint on phone in profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- Create function to check if phone belongs to staff
CREATE OR REPLACE FUNCTION public.is_staff_phone(_phone text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE p.phone = _phone
      AND ur.role IN ('doctor', 'receptionist')
  )
$$;