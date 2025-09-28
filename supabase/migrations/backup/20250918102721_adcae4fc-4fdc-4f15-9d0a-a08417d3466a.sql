-- First, drop the foreign key constraints from prescriptions table
ALTER TABLE public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;

-- Update the prescriptions table to reference patients_new
ALTER TABLE public.prescriptions 
ADD CONSTRAINT prescriptions_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients_new(patient_id);

-- Now insert the dummy data
-- Insert dummy users (patient and providers)
INSERT INTO public.users (user_id, name, email, phone, role) VALUES 
-- Patient
('11111111-1111-1111-1111-111111111111', 'Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0123', 'patient'),
-- Doctor
('22222222-2222-2222-2222-222222222222', 'Dr. Emily Rodriguez', 'dr.rodriguez@medical.com', '+1-555-0124', 'doctor'),
-- Nutritionist
('33333333-3333-3333-3333-333333333333', 'Lisa Chen', 'lisa.chen@nutrition.com', '+1-555-0125', 'nutritionist'),
-- Therapist
('44444444-4444-4444-4444-444444444444', 'Dr. Michael Thompson', 'michael.thompson@therapy.com', '+1-555-0126', 'therapist'),
-- Yoga Trainer
('55555555-5555-5555-5555-555555555555', 'Maya Patel', 'maya.patel@yoga.com', '+1-555-0127', 'yoga'),
-- Food Delivery Partner
('66666666-6666-6666-6666-666666666666', 'David Wilson', 'david.wilson@fooddelivery.com', '+1-555-0128', 'food_partner');

-- Insert patient profile
INSERT INTO public.patients_new (patient_id, pregnancy_stage, package_id, expected_delivery_date, address, emergency_contact, notes) VALUES 
('11111111-1111-1111-1111-111111111111', 'Second Trimester', (SELECT package_id FROM packages WHERE name = 'comprehensive'), '2025-06-15', '123 Maple Street, San Francisco, CA 94102', 'John Johnson - +1-555-0199 (Husband)', 'First pregnancy, no complications so far. Patient is very health-conscious and follows all recommendations.');

-- Insert provider profiles
INSERT INTO public.doctors (doctor_id, specialization, license_number, clinic_address, availability_schedule, consultation_fee) VALUES 
('22222222-2222-2222-2222-222222222222', 'Obstetrics & Gynecology', 'MD12345678', '456 Medical Center Dr, San Francisco, CA 94103', '{"monday": ["9:00", "17:00"], "tuesday": ["9:00", "17:00"], "wednesday": ["9:00", "17:00"], "thursday": ["9:00", "17:00"], "friday": ["9:00", "15:00"]}', 200.00);

INSERT INTO public.nutritionists (nutritionist_id, specialization, availability_schedule) VALUES 
('33333333-3333-3333-3333-333333333333', 'Prenatal & Maternal Nutrition', '{"monday": ["10:00", "18:00"], "tuesday": ["10:00", "18:00"], "wednesday": ["10:00", "18:00"], "thursday": ["10:00", "18:00"], "friday": ["10:00", "16:00"]}');

INSERT INTO public.therapists (therapist_id, type, license_number, availability_schedule) VALUES 
('44444444-4444-4444-4444-444444444444', 'Clinical Psychologist', 'PSY987654321', '{"monday": ["9:00", "17:00"], "tuesday": ["9:00", "17:00"], "wednesday": ["9:00", "17:00"], "thursday": ["9:00", "17:00"], "friday": ["9:00", "17:00"]}');

INSERT INTO public.yoga_trainers (trainer_id, certification_details, session_types, availability_schedule) VALUES 
('55555555-5555-5555-5555-555555555555', 'Certified Prenatal Yoga Instructor (500 hours), Registered Yoga Teacher', 'Prenatal Yoga, Postpartum Recovery, Gentle Flow', '{"monday": ["6:00", "20:00"], "tuesday": ["6:00", "20:00"], "wednesday": ["6:00", "20:00"], "thursday": ["6:00", "20:00"], "friday": ["6:00", "20:00"], "saturday": ["8:00", "18:00"], "sunday": ["8:00", "18:00"]}');

INSERT INTO public.food_delivery_partners (partner_id, delivery_zone, vehicle_type, availability_status) VALUES 
('66666666-6666-6666-6666-666666666666', 'San Francisco Bay Area', 'Electric Vehicle', true);

-- Insert appointments (past and future)
INSERT INTO public.appointments_new (patient_id, provider_id, provider_role, date_time, type, status, notes) VALUES 
-- Past appointments
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'doctor', '2024-12-15 10:00:00+00', 'in_person', 'completed', 'Regular checkup - everything looks great. Baby is developing well.'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'nutritionist', '2024-12-20 14:00:00+00', 'video', 'completed', 'Discussed nutrition plan for second trimester. Increased protein and iron intake.'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'therapist', '2024-12-22 11:00:00+00', 'video', 'completed', 'Discussed anxiety about becoming a new parent. Provided coping strategies.'),
-- Upcoming appointments
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'doctor', '2025-01-20 10:30:00+00', 'in_person', 'scheduled', 'Routine checkup and ultrasound'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'nutritionist', '2025-01-25 15:00:00+00', 'video', 'scheduled', 'Review meal plan and discuss any dietary concerns'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'yoga', '2025-01-18 09:00:00+00', 'video', 'scheduled', 'Prenatal yoga session focusing on breathing techniques'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'therapist', '2025-01-22 16:00:00+00', 'video', 'scheduled', 'Follow-up session on stress management');

-- Insert diet plan
INSERT INTO public.diet_plans (patient_id, nutritionist_id, meal_schedule, notes) VALUES 
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 
'{"breakfast": "Greek yogurt with berries and granola, prenatal vitamin", "lunch": "Quinoa salad with grilled chicken, avocado, and mixed vegetables", "dinner": "Baked salmon with sweet potato and steamed broccoli", "snacks": ["Apple with almond butter", "Hummus with carrot sticks", "Glass of milk"]}', 
'Focus on high-protein, high-iron foods. Take prenatal vitamins daily. Stay hydrated with 8-10 glasses of water. Avoid raw fish, unpasteurized dairy, and excessive caffeine.');

-- Insert food orders
INSERT INTO public.food_orders (patient_id, partner_id, meal_type, dietary_plan_id, delivery_status, timestamp) VALUES 
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'breakfast', (SELECT plan_id FROM diet_plans WHERE patient_id = '11111111-1111-1111-1111-111111111111'), 'delivered', '2025-01-17 08:00:00+00'),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'lunch', (SELECT plan_id FROM diet_plans WHERE patient_id = '11111111-1111-1111-1111-111111111111'), 'delivered', '2025-01-17 12:30:00+00'),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'dinner', (SELECT plan_id FROM diet_plans WHERE patient_id = '11111111-1111-1111-1111-111111111111'), 'pending', '2025-01-18 18:00:00+00'),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'breakfast', (SELECT plan_id FROM diet_plans WHERE patient_id = '11111111-1111-1111-1111-111111111111'), 'pending', '2025-01-18 08:00:00+00');

-- Insert therapy sessions
INSERT INTO public.therapy_sessions (patient_id, therapist_id, session_type, mode, notes, session_date) VALUES 
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '1:1', 'video', 'Discussed pregnancy anxiety and preparation for parenthood. Patient responded well to mindfulness techniques.', '2024-12-22 11:00:00+00'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '1:1', 'video', 'Worked on breathing exercises and stress management. Patient reports feeling more confident.', '2025-01-05 11:00:00+00'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '1:1', 'video', 'Upcoming session scheduled', '2025-01-22 16:00:00+00');

-- Insert yoga sessions
INSERT INTO public.yoga_sessions (patient_id, trainer_id, session_type, mode, notes, session_date) VALUES 
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'prenatal', 'video', 'Focus on hip opening poses and breathing techniques. Patient did great with modifications.', '2024-12-18 09:00:00+00'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'prenatal', 'video', 'Gentle flow session with emphasis on core strengthening (pregnancy-safe). Patient feeling more flexible.', '2025-01-08 09:00:00+00'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'prenatal', 'video', 'Upcoming session - breathing techniques focus', '2025-01-18 09:00:00+00'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'prenatal', 'video', 'Upcoming session scheduled', '2025-01-25 09:00:00+00');

-- Insert medical records
INSERT INTO public.medical_records_new (patient_id, doctor_id, record_type, file_url, date) VALUES 
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Ultrasound Report', 'https://example.com/ultrasound_12week.pdf', '2024-11-15 00:00:00+00'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Blood Test Results', 'https://example.com/bloodwork_nov2024.pdf', '2024-11-20 00:00:00+00'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Ultrasound Report', 'https://example.com/ultrasound_16week.pdf', '2024-12-15 00:00:00+00'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Prenatal Vitamins Prescription', 'https://example.com/prescription_vitamins.pdf', '2024-12-15 00:00:00+00');

-- Insert prescriptions
INSERT INTO public.prescriptions (provider_id, patient_id, patient_user_id, medication_name, dosage, frequency, duration, instructions, prescribed_date) VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Prenatal Vitamins', '1 tablet', 'Once daily', '9 months', 'Take with food to avoid nausea. Best taken in the morning.', '2024-11-15 00:00:00+00'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Iron Supplement', '65mg', 'Once daily', '6 months', 'Take on empty stomach if possible, or with vitamin C to enhance absorption. May cause mild stomach upset.', '2024-12-15 00:00:00+00'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Folic Acid', '800mcg', 'Once daily', 'Throughout pregnancy', 'Continue taking until delivery. Important for neural development.', '2024-11-15 00:00:00+00');

-- Insert payment history
INSERT INTO public.payments (patient_id, package_id, amount, payment_status, payment_method, timestamp) VALUES 
('11111111-1111-1111-1111-111111111111', (SELECT package_id FROM packages WHERE name = 'comprehensive'), 2999.00, 'completed', 'Credit Card (****1234)', '2024-11-01 00:00:00+00'),
('11111111-1111-1111-1111-111111111111', (SELECT package_id FROM packages WHERE name = 'comprehensive'), 299.90, 'completed', 'Credit Card (****1234)', '2024-12-01 00:00:00+00'),
('11111111-1111-1111-1111-111111111111', (SELECT package_id FROM packages WHERE name = 'comprehensive'), 299.90, 'pending', 'Credit Card (****1234)', '2025-01-01 00:00:00+00');