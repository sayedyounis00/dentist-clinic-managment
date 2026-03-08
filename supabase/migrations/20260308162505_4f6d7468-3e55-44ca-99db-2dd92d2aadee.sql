
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'receptionist');

-- Users/profiles table (not referencing auth.users since this app uses custom auth)
CREATE TABLE public.clinic_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role app_role NOT NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  date_of_birth TEXT NOT NULL DEFAULT '',
  blood_type TEXT NOT NULL DEFAULT '',
  medical_history TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '',
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.clinic_users(id)
);

-- Treatments table
CREATE TABLE public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  tooth TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT NOT NULL DEFAULT '',
  added_by UUID REFERENCES public.clinic_users(id)
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT NOT NULL DEFAULT 'cash',
  note TEXT NOT NULL DEFAULT '',
  recorded_by UUID REFERENCES public.clinic_users(id)
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL DEFAULT '09:00',
  duration INTEGER NOT NULL DEFAULT 30,
  type TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES public.clinic_users(id)
);

-- Disable RLS on all tables since this app uses custom auth (not Supabase Auth)
ALTER TABLE public.clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access since we're using custom auth, not Supabase Auth
CREATE POLICY "Allow all access" ON public.clinic_users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.patients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.treatments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.appointments FOR ALL TO anon USING (true) WITH CHECK (true);
