-- Pregacare Database Schema
-- Migration: Create core tables for pregnancy care platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Users table with role-based access
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nutritionist', 'yoga_trainer', 'therapist', 'delivery_partner', 'admin')),
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table for pregnancy tracking
CREATE TABLE public.patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    profile_picture TEXT,
    pregnancy_stage TEXT NOT NULL CHECK (pregnancy_stage IN ('first_trimester', 'second_trimester', 'third_trimester', 'postpartum')),
    due_date DATE,
    risk_status TEXT NOT NULL CHECK (risk_status IN ('normal', 'medium', 'high')) DEFAULT 'normal',
    medical_history JSONB DEFAULT '{}',
    emergency_contact JSONB,
    address JSONB,
    insurance_info JSONB,
    assigned_providers JSONB DEFAULT '{}',
    package_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers table for healthcare professionals
CREATE TABLE public.providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('doctor', 'nutritionist', 'yoga_trainer', 'therapist')),
    specialization TEXT NOT NULL,
    license_number TEXT,
    experience_years INTEGER DEFAULT 0,
    education TEXT[],
    certifications TEXT[],
    languages TEXT[],
    consultation_fee DECIMAL(10,2),
    availability JSONB DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    bio TEXT,
    profile_picture TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('doctor', 'nutritionist', 'yoga_trainer', 'therapist')),
    appointment_date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30, -- minutes
    type TEXT NOT NULL CHECK (type IN ('video_call', 'in_person', 'phone_call', 'chat')),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    consultation_fee DECIMAL(10,2),
    meeting_link TEXT,
    location TEXT,
    reminders JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE public.medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL CHECK (record_type IN ('scan', 'lab_report', 'prescription', 'notes', 'vitals', 'ultrasound')),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    content JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE public.prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    prescription_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    medications JSONB NOT NULL,
    instructions TEXT,
    duration_days INTEGER,
    refills_allowed INTEGER DEFAULT 0,
    pharmacy_info JSONB,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diet Plans table
CREATE TABLE public.diet_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    nutritionist_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    description TEXT,
    plan_type TEXT CHECK (plan_type IN ('weight_gain', 'weight_maintenance', 'gestational_diabetes', 'general_wellness')),
    start_date DATE NOT NULL,
    end_date DATE,
    daily_calories INTEGER,
    daily_protein DECIMAL(5,2),
    daily_carbs DECIMAL(5,2),
    daily_fats DECIMAL(5,2),
    meals JSONB NOT NULL,
    supplements JSONB DEFAULT '{}',
    restrictions TEXT[],
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yoga Sessions table
CREATE TABLE public.yoga_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('prenatal', 'postpartum', 'gentle', 'breathing')),
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- minutes
    session_date TIMESTAMPTZ NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('video', 'in_person', 'group')),
    poses JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Therapy Sessions table
CREATE TABLE public.therapy_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('individual', 'group', 'family')),
    session_date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- minutes
    focus_areas TEXT[],
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
    techniques_used TEXT[],
    homework_assigned TEXT,
    progress_notes TEXT,
    next_session_goals TEXT[],
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food Orders table
CREATE TABLE public.food_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    diet_plan_id UUID REFERENCES public.diet_plans(id),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivery_date TIMESTAMPTZ NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address JSONB NOT NULL,
    special_instructions TEXT,
    status TEXT NOT NULL CHECK (status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'placed',
    delivery_partner_id UUID,
    delivery_tracking JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communications table
CREATE TABLE public.communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'appointment_request', 'prescription', 'reminder', 'alert')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    related_id UUID, -- appointment, prescription, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table for care packages
CREATE TABLE public.packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'premium', 'comprehensive')),
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    features TEXT[] NOT NULL,
    included_services JSONB NOT NULL,
    consultation_limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.packages(id),
    appointment_id UUID REFERENCES public.appointments(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'upi', 'wallet', 'cash')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id TEXT UNIQUE,
    payment_gateway TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table for tracking metrics
CREATE TABLE public.analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'appointment', 'payment', 'communication')),
    entity_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4),
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_pregnancy_stage ON public.patients(pregnancy_stage);
CREATE INDEX idx_providers_user_id ON public.providers(user_id);
CREATE INDEX idx_providers_type ON public.providers(provider_type);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_communications_sender ON public.communications(sender_id);
CREATE INDEX idx_communications_receiver ON public.communications(receiver_id);
CREATE INDEX idx_communications_created ON public.communications(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (will be expanded)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users 
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

-- Patients can view their own records
CREATE POLICY "Patients can view own records" ON public.patients 
    FOR SELECT USING (user_id = auth.uid());

-- Providers can view their assigned patients
CREATE POLICY "Providers can view assigned patients" ON public.patients 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.providers p 
            WHERE p.user_id = auth.uid() 
            AND (
                (assigned_providers->>'doctorId' = p.id::text) OR
                (assigned_providers->>'nutritionistId' = p.id::text) OR
                (assigned_providers->>'yogaTrainerId' = p.id::text) OR
                (assigned_providers->>'therapistId' = p.id::text)
            )
        )
    );

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();