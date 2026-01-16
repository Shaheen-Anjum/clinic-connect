-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Anyone can view today bookings" ON public.bookings;

-- Create new policy: Anyone can view today's bookings, Staff can view all bookings
CREATE POLICY "Anyone can view today bookings" 
ON public.bookings 
FOR SELECT 
USING (
  booking_date = CURRENT_DATE 
  OR is_staff(auth.uid())
);