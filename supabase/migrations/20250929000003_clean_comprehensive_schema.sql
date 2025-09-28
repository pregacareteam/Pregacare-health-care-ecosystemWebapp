-- ============================================================================
-- PREGACARE COMPREHENSIVE HEALTHCARE ECOSYSTEM - CLEAN INSTALLATION
-- ============================================================================
-- This script handles existing tables and creates our comprehensive schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES IF THEY EXIST (Clean slate approach)
-- ============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.subscription_packages CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.therapy_sessions CASCADE;
DROP TABLE IF EXISTS public.diet_plans CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any existing policies and functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_readable_id(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_patient_dashboard_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_provider_dashboard_data(UUID) CASCADE;

-- ============================================================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'patient', 'doctor', 'radiologist', 'lab_technician', 'nutritionist', 
    'therapist', 'yoga_instructor', 'pharmacy', 'food_service', 
    'community_manager', 'admin'
  )),
  profile_picture TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(auth_user_id)
);

-- ============================================================================
-- PATIENTS
-- ============================================================================

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id TEXT UNIQUE NOT NULL, -- Human readable ID like P001, P002
  
  -- Personal Information
  date_of_birth DATE,
  emergency_contact JSONB,
  address JSONB,
  insurance_info JSONB,
  
  -- Pregnancy Information
  pregnancy_stage TEXT CHECK (pregnancy_stage IN ('first_trimester', 'second_trimester', 'third_trimester', 'postpartum')),
  pregnancy_week INTEGER,
  due_date DATE,
  risk_status TEXT DEFAULT 'normal' CHECK (risk_status IN ('normal', 'medium', 'high', 'critical')),
  
  -- Medical History
  medical_history JSONB DEFAULT '{}',
  allergies TEXT[],
  current_medications TEXT[],
  past_pregnancies INTEGER DEFAULT 0,
  
  -- Provider Assignments
  assigned_doctor_id UUID REFERENCES public.users(id),
  assigned_nutritionist_id UUID,
  assigned_therapist_id UUID,
  assigned_yoga_instructor_id UUID,
  
  -- Subscription & Billing
  subscription_package TEXT,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROVIDERS (DOCTORS, SPECIALISTS, ETC.)
-- ============================================================================

CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  provider_id TEXT UNIQUE NOT NULL, -- Human readable ID like D001, R001, L001
  
  -- Professional Information
  specialization TEXT NOT NULL,
  license_number TEXT,
  experience_years INTEGER DEFAULT 0,
  education TEXT[],
  certifications TEXT[],
  bio TEXT,
  
  -- Service Information
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['English'],
  
  -- Availability
  working_hours JSONB DEFAULT '{}',
  is_accepting_patients BOOLEAN DEFAULT true,
  
  -- Location
  clinic_address JSONB,
  service_areas TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENTS SYSTEM
-- ============================================================================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  
  -- Appointment Details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('video', 'in_person', 'phone', 'home_visit')),
  
  -- Status Management
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 
    'cancelled', 'no_show', 'rescheduled'
  )),
  cancellation_reason TEXT,
  
  -- Content
  patient_notes TEXT,
  provider_notes TEXT,
  symptoms TEXT[],
  diagnosis TEXT,
  
  -- Meeting Details
  meeting_link TEXT,
  meeting_password TEXT,
  
  -- Billing
  consultation_fee DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(provider_id, appointment_date, appointment_time)
);

-- ============================================================================
-- MEDICAL RECORDS & REPORTS
-- ============================================================================

CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  
  -- Record Classification
  record_type TEXT NOT NULL CHECK (record_type IN (
    'lab_report', 'scan_report', 'prescription', 'doctor_notes', 
    'vitals', 'ultrasound', 'consultation_summary'
  )),
  category TEXT, -- e.g., 'blood_test', 'urine_test', 'ultrasound', etc.
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  structured_data JSONB DEFAULT '{}', -- Store lab values, measurements, etc.
  
  -- Files
  file_urls TEXT[],
  file_types TEXT[],
  
  -- Metadata
  test_date DATE,
  report_date DATE DEFAULT CURRENT_DATE,
  is_critical BOOLEAN DEFAULT false,
  is_confidential BOOLEAN DEFAULT false,
  
  -- Workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed', 'flagged')),
  reviewed_by UUID REFERENCES public.providers(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRESCRIPTIONS & MEDICATIONS
-- ============================================================================

CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  pharmacy_id UUID REFERENCES public.providers(id),
  
  -- Prescription Details
  medications JSONB NOT NULL, -- Array of medication objects
  instructions TEXT,
  duration_days INTEGER,
  
  -- Status Tracking
  status TEXT DEFAULT 'prescribed' CHECK (status IN (
    'prescribed', 'sent_to_pharmacy', 'prepared', 'dispensed', 'delivered'
  )),
  
  -- Refill Information
  refills_allowed INTEGER DEFAULT 0,
  refills_used INTEGER DEFAULT 0,
  
  -- Dates
  prescribed_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  dispensed_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DIET PLANS & NUTRITION
-- ============================================================================

CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  food_service_id UUID REFERENCES public.providers(id),
  
  -- Plan Details
  plan_name TEXT NOT NULL,
  plan_description TEXT,
  dietary_restrictions TEXT[],
  calorie_target INTEGER,
  
  -- Meal Plans
  weekly_meals JSONB, -- Structured meal plan data
  shopping_list TEXT[],
  
  -- Delivery Information
  delivery_frequency TEXT CHECK (delivery_frequency IN ('daily', 'alternate_days', 'weekly')),
  delivery_preferences JSONB,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  
  -- Dates
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- THERAPY & WELLNESS SESSIONS
-- ============================================================================

CREATE TABLE public.therapy_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE, -- Therapist or Yoga instructor
  
  -- Session Details
  session_type TEXT NOT NULL CHECK (session_type IN (
    'individual_therapy', 'group_therapy', 'yoga_class', 
    'physiotherapy', 'meditation', 'counseling'
  )),
  session_title TEXT NOT NULL,
  session_description TEXT,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Content
  session_plan JSONB, -- Exercises, topics, etc.
  session_notes TEXT,
  homework_assigned TEXT,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  
  -- Meeting Details
  meeting_type TEXT CHECK (meeting_type IN ('online', 'in_person', 'hybrid')),
  meeting_link TEXT,
  location TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMMUNICATION SYSTEM
-- ============================================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  -- Participants
  participants UUID[] NOT NULL, -- Array of user IDs
  participant_roles TEXT[] NOT NULL, -- Array of roles
  
  -- Conversation Details
  title TEXT,
  conversation_type TEXT DEFAULT 'private' CHECK (conversation_type IN ('private', 'group', 'support')),
  
  -- Metadata
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Message Content
  message_type TEXT DEFAULT 'text' CHECK (message_type IN (
    'text', 'file', 'image', 'voice', 'system', 'appointment_request', 'task_request'
  )),
  content TEXT NOT NULL,
  attachments JSONB,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  read_by JSONB DEFAULT '{}', -- Track who has read the message
  
  -- Task/Request Related
  related_record_type TEXT,
  related_record_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS SYSTEM
-- ============================================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'appointment_reminder', 'test_result', 'prescription_ready', 
    'diet_plan_update', 'session_scheduled', 'urgent_alert', 'system_message'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery
  delivery_methods TEXT[] DEFAULT ARRAY['in_app'], -- 'email', 'sms', 'push', 'in_app'
  is_delivered BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Related Records
  related_record_type TEXT,
  related_record_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TASK MANAGEMENT
-- ============================================================================

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  assigned_to UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Task Details
  task_type TEXT NOT NULL CHECK (task_type IN (
    'lab_test_request', 'scan_request', 'prescription_fulfillment', 
    'diet_plan_creation', 'session_scheduling', 'report_review'
  )),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
  )),
  
  -- Dates
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Results
  completion_notes TEXT,
  attachments JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BILLING & SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  package_name TEXT NOT NULL,
  description TEXT,
  features JSONB,
  
  -- Pricing
  monthly_price DECIMAL(10,2),
  quarterly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),
  
  -- Service Inclusions
  included_consultations INTEGER,
  included_lab_tests INTEGER,
  included_scans INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT UNIQUE NOT NULL, -- Human readable ID
  
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Payment Details
  payment_type TEXT NOT NULL CHECK (payment_type IN (
    'subscription', 'consultation', 'lab_test', 'scan', 'prescription', 'therapy_session'
  )),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Payment Gateway
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  
  -- Related Records
  related_record_type TEXT,
  related_record_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- Patients
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX idx_patients_assigned_doctor ON public.patients(assigned_doctor_id);
CREATE INDEX idx_patients_risk_status ON public.patients(risk_status);
CREATE INDEX idx_patients_due_date ON public.patients(due_date);

-- Providers
CREATE INDEX idx_providers_user_id ON public.providers(user_id);
CREATE INDEX idx_providers_provider_id ON public.providers(provider_id);
CREATE INDEX idx_providers_specialization ON public.providers(specialization);

-- Appointments
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Medical Records
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_provider_id ON public.medical_records(provider_id);
CREATE INDEX idx_medical_records_type ON public.medical_records(record_type);
CREATE INDEX idx_medical_records_date ON public.medical_records(test_date);

-- Messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Notifications
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for);

-- Tasks
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_patient_id ON public.tasks(patient_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapy_sessions_updated_at BEFORE UPDATE ON public.therapy_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();