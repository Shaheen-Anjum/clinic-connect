-- Add booking close time columns to clinic_settings
ALTER TABLE public.clinic_settings 
ADD COLUMN morning_booking_close_time time without time zone NOT NULL DEFAULT '12:30:00'::time without time zone,
ADD COLUMN evening_booking_close_time time without time zone NOT NULL DEFAULT '19:30:00'::time without time zone;