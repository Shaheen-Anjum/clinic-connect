-- Add contact fields to clinic_settings table
ALTER TABLE public.clinic_settings 
ADD COLUMN IF NOT EXISTS phone_number text DEFAULT '+91 XXXXX XXXXX',
ADD COLUMN IF NOT EXISTS email text DEFAULT 'clinic@example.com',
ADD COLUMN IF NOT EXISTS whatsapp_number text DEFAULT '91XXXXXXXXXX';