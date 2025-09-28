-- ============================================================================
-- PREGACARE APPOINTMENT BOOKING SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Created for UI-First Development Approach
-- This migration creates minimal tables needed for Appointment Booking feature

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- AUTHENTICATION & USERS
-- ============================================================================

-- Custom user profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nutritionist', 'yoga_trainer', 'therapist', 'delivery_partner', 'admin')),
  profile_picture TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique email and auth_user_id
  UNIQUE(email),
  UNIQUE(auth_user_id)
);

-- ============================================================================
-- HEALTHCARE PROVIDERS
-- ============================================================================

CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT,
  experience_years INTEGER DEFAULT 0,
  education TEXT[],
  certifications TEXT[],
  bio TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['English'],
  clinic_address JSONB,
  availability JSONB DEFAULT '{}', -- Store weekly availability schedule
  is_accepting_patients BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PATIENTS
-- ============================================================================

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  pregnancy_stage TEXT CHECK (pregnancy_stage IN ('first_trimester', 'second_trimester', 'third_trimester', 'postpartum')),
  due_date DATE,
  risk_level TEXT DEFAULT 'normal' CHECK (risk_level IN ('normal', 'medium', 'high')),
  medical_history JSONB DEFAULT '{}',
  emergency_contact JSONB,
  insurance_info JSONB,
  assigned_doctor_id UUID REFERENCES public.doctors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENTS SYSTEM
-- ============================================================================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  
  -- Appointment Details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('video', 'in_person', 'phone')),
  duration_minutes INTEGER DEFAULT 30,
  
  -- Status & Management
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  cancellation_reason TEXT,
  
  -- Content & Notes
  patient_notes TEXT,
  doctor_notes TEXT,
  symptoms TEXT[],
  
  -- Pricing
  consultation_fee DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Meeting Details (for video/phone calls)
  meeting_link TEXT,
  meeting_password TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no double booking
  UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- ============================================================================
-- DOCTOR AVAILABILITY SYSTEM
-- ============================================================================

CREATE TABLE public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  
  -- Date and Time
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Availability Status
  is_available BOOLEAN DEFAULT true,
  max_appointments INTEGER DEFAULT 1,
  booked_appointments INTEGER DEFAULT 0,
  
  -- Special Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no overlapping slots for same doctor
  UNIQUE(doctor_id, available_date, start_time)
);

-- ============================================================================
-- APPOINTMENT NOTIFICATIONS
-- ============================================================================

CREATE TABLE public.appointment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'doctor')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('confirmation', 'reminder', 'cancellation', 'rescheduled')),
  
  -- Notification Details
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery
  delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'push')),
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling
  send_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- Doctors indexes
CREATE INDEX idx_doctors_user_profile_id ON public.doctors(user_profile_id);
CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX idx_doctors_accepting_patients ON public.doctors(is_accepting_patients);

-- Patients indexes
CREATE INDEX idx_patients_user_profile_id ON public.patients(user_profile_id);
CREATE INDEX idx_patients_assigned_doctor ON public.patients(assigned_doctor_id);
CREATE INDEX idx_patients_due_date ON public.patients(due_date);

-- Appointments indexes
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_datetime ON public.appointments(appointment_date, appointment_time);

-- Availability indexes
CREATE INDEX idx_availability_doctor_date ON public.doctor_availability(doctor_id, available_date);
CREATE INDEX idx_availability_date_range ON public.doctor_availability(available_date, start_time, end_time);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Doctors Policies
CREATE POLICY "Anyone can view active doctors" ON public.doctors
  FOR SELECT USING (is_accepting_patients = true);

CREATE POLICY "Doctors can update their own profile" ON public.doctors
  FOR ALL USING (
    auth.uid() IN (
      SELECT up.auth_user_id 
      FROM public.user_profiles up 
      WHERE up.id = doctors.user_profile_id
    )
  );

-- Patients Policies
CREATE POLICY "Patients can view their own data" ON public.patients
  FOR ALL USING (
    auth.uid() IN (
      SELECT up.auth_user_id 
      FROM public.user_profiles up 
      WHERE up.id = patients.user_profile_id
    )
  );

CREATE POLICY "Doctors can view their assigned patients" ON public.patients
  FOR SELECT USING (
    assigned_doctor_id IN (
      SELECT d.id 
      FROM public.doctors d
      JOIN public.user_profiles up ON up.id = d.user_profile_id
      WHERE up.auth_user_id = auth.uid()
    )
  );

-- Appointments Policies
CREATE POLICY "Patients can view their appointments" ON public.appointments
  FOR ALL USING (
    patient_id IN (
      SELECT p.id 
      FROM public.patients p
      JOIN public.user_profiles up ON up.id = p.user_profile_id
      WHERE up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR ALL USING (
    doctor_id IN (
      SELECT d.id 
      FROM public.doctors d
      JOIN public.user_profiles up ON up.id = d.user_profile_id
      WHERE up.auth_user_id = auth.uid()
    )
  );

-- Doctor Availability Policies
CREATE POLICY "Anyone can view doctor availability" ON public.doctor_availability
  FOR SELECT USING (is_available = true);

CREATE POLICY "Doctors can manage their availability" ON public.doctor_availability
  FOR ALL USING (
    doctor_id IN (
      SELECT d.id 
      FROM public.doctors d
      JOIN public.user_profiles up ON up.id = d.user_profile_id
      WHERE up.auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Note: This will be populated by the application
-- Sample doctors and availability will be inserted via the UI

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================