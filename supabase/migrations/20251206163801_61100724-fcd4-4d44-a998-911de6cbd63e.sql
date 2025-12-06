-- Create role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'receptionist', 'patient');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create clinic_settings table (single row for global settings)
CREATE TABLE public.clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_available BOOLEAN NOT NULL DEFAULT true,
  minutes_per_patient INTEGER NOT NULL DEFAULT 10,
  morning_clinic_name TEXT NOT NULL DEFAULT 'Clinic A',
  morning_clinic_address TEXT NOT NULL DEFAULT '123 Main Street',
  morning_start_time TIME NOT NULL DEFAULT '10:00',
  morning_end_time TIME NOT NULL DEFAULT '13:00',
  morning_booking_open_time TIME NOT NULL DEFAULT '09:00',
  evening_clinic_name TEXT NOT NULL DEFAULT 'Clinic B',
  evening_clinic_address TEXT NOT NULL DEFAULT '456 Park Avenue',
  evening_start_time TIME NOT NULL DEFAULT '17:00',
  evening_end_time TIME NOT NULL DEFAULT '20:00',
  evening_booking_open_time TIME NOT NULL DEFAULT '18:00',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('morning', 'evening')),
  queue_number INTEGER NOT NULL,
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'consulted', 'no_show')),
  consulted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_stats table for doctor dashboard
CREATE TABLE public.daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  patients_consulted INTEGER NOT NULL DEFAULT 0,
  patients_no_show INTEGER NOT NULL DEFAULT 0,
  morning_bookings INTEGER NOT NULL DEFAULT 0,
  evening_bookings INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (stat_date)
);

-- Insert default clinic settings
INSERT INTO public.clinic_settings (id) VALUES (gen_random_uuid());

-- Insert today's stats row
INSERT INTO public.daily_stats (stat_date) VALUES (CURRENT_DATE);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is staff (doctor or receptionist)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('doctor', 'receptionist')
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_staff(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Doctor can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'doctor'));

-- Clinic settings policies (anyone can read, staff can update)
CREATE POLICY "Anyone can view clinic settings"
  ON public.clinic_settings FOR SELECT
  USING (true);

CREATE POLICY "Staff can update clinic settings"
  ON public.clinic_settings FOR UPDATE
  USING (public.is_staff(auth.uid()));

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view today bookings"
  ON public.bookings FOR SELECT
  USING (booking_date = CURRENT_DATE);

CREATE POLICY "Staff can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.is_staff(auth.uid()));

-- Daily stats policies
CREATE POLICY "Anyone can view daily stats"
  ON public.daily_stats FOR SELECT
  USING (true);

CREATE POLICY "Staff can update daily stats"
  ON public.daily_stats FOR UPDATE
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert daily stats"
  ON public.daily_stats FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_settings_updated_at
  BEFORE UPDATE ON public.clinic_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
  BEFORE UPDATE ON public.daily_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;