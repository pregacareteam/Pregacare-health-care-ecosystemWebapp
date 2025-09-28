-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'nutritionist', 'therapist', 'yoga', 'food_partner');

-- Create enum for package types
CREATE TYPE package_type AS ENUM ('basic', 'medium', 'comprehensive');

-- Create enum for appointment status
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Create enum for delivery status
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered', 'cancelled');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 1. Users Table (Base Table for Authentication)
CREATE TABLE public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (user_id = auth.uid());

-- 8. Packages Table
CREATE TABLE public.packages (
    package_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name package_type NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER DEFAULT 9,
    included_services JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- RLS Policy - packages are viewable by all authenticated users
CREATE POLICY "Everyone can view packages" ON public.packages
    FOR SELECT TO authenticated USING (true);

-- 2. Patients Table
CREATE TABLE public.patients_new (
    patient_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    pregnancy_stage TEXT,
    package_id UUID REFERENCES public.packages(package_id),
    expected_delivery_date DATE,
    address TEXT,
    emergency_contact TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Patients can view their own profile" ON public.patients_new
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can update their own profile" ON public.patients_new
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Patients can create their own profile" ON public.patients_new
    FOR INSERT WITH CHECK (patient_id = auth.uid());

-- 3. Doctors Table
CREATE TABLE public.doctors (
    doctor_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    specialization TEXT,
    license_number TEXT,
    clinic_address TEXT,
    availability_schedule JSONB DEFAULT '{}',
    consultation_fee DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctors
CREATE POLICY "Doctors can view their own profile" ON public.doctors
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their own profile" ON public.doctors
    FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create their own profile" ON public.doctors
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Everyone can view doctor profiles" ON public.doctors
    FOR SELECT TO authenticated USING (true);

-- 4. Nutritionists Table
CREATE TABLE public.nutritionists (
    nutritionist_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    specialization TEXT,
    availability_schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutritionists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutritionists
CREATE POLICY "Nutritionists can view their own profile" ON public.nutritionists
    FOR SELECT USING (nutritionist_id = auth.uid());

CREATE POLICY "Nutritionists can update their own profile" ON public.nutritionists
    FOR UPDATE USING (nutritionist_id = auth.uid());

CREATE POLICY "Nutritionists can create their own profile" ON public.nutritionists
    FOR INSERT WITH CHECK (nutritionist_id = auth.uid());

CREATE POLICY "Everyone can view nutritionist profiles" ON public.nutritionists
    FOR SELECT TO authenticated USING (true);

-- 5. Therapists Table
CREATE TABLE public.therapists (
    therapist_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    type TEXT, -- counselor / clinical psychologist
    license_number TEXT,
    availability_schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for therapists
CREATE POLICY "Therapists can view their own profile" ON public.therapists
    FOR SELECT USING (therapist_id = auth.uid());

CREATE POLICY "Therapists can update their own profile" ON public.therapists
    FOR UPDATE USING (therapist_id = auth.uid());

CREATE POLICY "Therapists can create their own profile" ON public.therapists
    FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Everyone can view therapist profiles" ON public.therapists
    FOR SELECT TO authenticated USING (true);

-- 6. Yoga Trainers Table
CREATE TABLE public.yoga_trainers (
    trainer_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    certification_details TEXT,
    session_types TEXT, -- prenatal yoga, postpartum recovery
    availability_schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yoga_trainers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for yoga trainers
CREATE POLICY "Yoga trainers can view their own profile" ON public.yoga_trainers
    FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Yoga trainers can update their own profile" ON public.yoga_trainers
    FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Yoga trainers can create their own profile" ON public.yoga_trainers
    FOR INSERT WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Everyone can view yoga trainer profiles" ON public.yoga_trainers
    FOR SELECT TO authenticated USING (true);

-- 7. Food Delivery Partners Table
CREATE TABLE public.food_delivery_partners (
    partner_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    delivery_zone TEXT,
    vehicle_type TEXT,
    availability_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_delivery_partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food delivery partners
CREATE POLICY "Food partners can view their own profile" ON public.food_delivery_partners
    FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY "Food partners can update their own profile" ON public.food_delivery_partners
    FOR UPDATE USING (partner_id = auth.uid());

CREATE POLICY "Food partners can create their own profile" ON public.food_delivery_partners
    FOR INSERT WITH CHECK (partner_id = auth.uid());

-- 9. Appointments Table (Updated)
CREATE TABLE public.appointments_new (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients_new(patient_id),
    provider_id UUID NOT NULL REFERENCES public.users(user_id),
    provider_role user_role NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT DEFAULT 'video', -- in-person / video
    status appointment_status DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Patients can view their appointments" ON public.appointments_new
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can create their appointments" ON public.appointments_new
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Providers can view their appointments" ON public.appointments_new
    FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Providers can update their appointments" ON public.appointments_new
    FOR UPDATE USING (provider_id = auth.uid());

-- 11. Diet Plans Table
CREATE TABLE public.diet_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients_new(patient_id),
    nutritionist_id UUID NOT NULL REFERENCES public.nutritionists(nutritionist_id),
    meal_schedule JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diet plans
CREATE POLICY "Patients can view their diet plans" ON public.diet_plans
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Nutritionists can view their diet plans" ON public.diet_plans
    FOR SELECT USING (nutritionist_id = auth.uid());

CREATE POLICY "Nutritionists can create diet plans" ON public.diet_plans
    FOR INSERT WITH CHECK (nutritionist_id = auth.uid());

CREATE POLICY "Nutritionists can update their diet plans" ON public.diet_plans
    FOR UPDATE USING (nutritionist_id = auth.uid());

-- 10. Food Orders Table
CREATE TABLE public.food_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients_new(patient_id),
    partner_id UUID NOT NULL REFERENCES public.food_delivery_partners(partner_id),
    meal_type TEXT NOT NULL, -- breakfast/lunch/dinner/snack
    dietary_plan_id UUID REFERENCES public.diet_plans(plan_id),
    delivery_status delivery_status DEFAULT 'pending',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food orders
CREATE POLICY "Patients can view their food orders" ON public.food_orders
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can create food orders" ON public.food_orders
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Food partners can view their orders" ON public.food_orders
    FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY "Food partners can update order status" ON public.food_orders
    FOR UPDATE USING (partner_id = auth.uid());

-- 12. Therapy Sessions Table
CREATE TABLE public.therapy_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients_new(patient_id),
    therapist_id UUID NOT NULL REFERENCES public.therapists(therapist_id),
    session_type TEXT, -- 1:1, group
    mode TEXT DEFAULT 'video', -- chat, video, in-person
    notes TEXT,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for therapy sessions
CREATE POLICY "Patients can view their therapy sessions" ON public.therapy_sessions
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Therapists can view their therapy sessions" ON public.therapy_sessions
    FOR SELECT USING (therapist_id = auth.uid());

CREATE POLICY "Therapists can create therapy sessions" ON public.therapy_sessions
    FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Therapists can update their therapy sessions" ON public.therapy_sessions
    FOR UPDATE USING (therapist_id = auth.uid());

-- 13. Yoga Sessions Table
CREATE TABLE public.yoga_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients_new(patient_id),
    trainer_id UUID NOT NULL REFERENCES public.yoga_trainers(trainer_id),
    session_type TEXT, -- prenatal, postpartum
    mode TEXT DEFAULT 'video', -- video/in-person
    notes TEXT,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yoga_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for yoga sessions
CREATE POLICY "Patients can view their yoga sessions" ON public.yoga_sessions
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Yoga trainers can view their yoga sessions" ON public.yoga_sessions
    FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Yoga trainers can create yoga sessions" ON public.yoga_sessions
    FOR INSERT WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Yoga trainers can update their yoga sessions" ON public.yoga_sessions
    FOR UPDATE USING (trainer_id = auth.uid());

-- 14. Medical Records Table (Updated)
CREATE TABLE public.medical_records_new (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients_new(patient_id),
    doctor_id UUID NOT NULL REFERENCES public.doctors(doctor_id),
    record_type TEXT NOT NULL, -- scan, lab report, prescription
    file_url TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_records_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical records
CREATE POLICY "Patients can view their medical records" ON public.medical_records_new
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their patients' medical records" ON public.medical_records_new
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create medical records" ON public.medical_records_new
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their medical records" ON public.medical_records_new
    FOR UPDATE USING (doctor_id = auth.uid());

-- 15. Payments Table
CREATE TABLE public.payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients_new(patient_id),
    package_id UUID NOT NULL REFERENCES public.packages(package_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_method TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Patients can view their payments" ON public.payments
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can create payments" ON public.payments
    FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_new_updated_at
    BEFORE UPDATE ON public.patients_new
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutritionists_updated_at
    BEFORE UPDATE ON public.nutritionists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at
    BEFORE UPDATE ON public.therapists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yoga_trainers_updated_at
    BEFORE UPDATE ON public.yoga_trainers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_delivery_partners_updated_at
    BEFORE UPDATE ON public.food_delivery_partners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_new_updated_at
    BEFORE UPDATE ON public.appointments_new
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_orders_updated_at
    BEFORE UPDATE ON public.food_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_plans_updated_at
    BEFORE UPDATE ON public.diet_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapy_sessions_updated_at
    BEFORE UPDATE ON public.therapy_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yoga_sessions_updated_at
    BEFORE UPDATE ON public.yoga_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_new_updated_at
    BEFORE UPDATE ON public.medical_records_new
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON public.packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample packages
INSERT INTO public.packages (name, price, duration_months, included_services) VALUES
('basic', 999.00, 9, '{"doctor_consultations": 4, "nutritionist_sessions": 2, "yoga_sessions": 8}'),
('medium', 1999.00, 9, '{"doctor_consultations": 8, "nutritionist_sessions": 6, "yoga_sessions": 16, "therapy_sessions": 4}'),
('comprehensive', 2999.00, 9, '{"doctor_consultations": 12, "nutritionist_sessions": 12, "yoga_sessions": 24, "therapy_sessions": 8, "food_delivery": true}');