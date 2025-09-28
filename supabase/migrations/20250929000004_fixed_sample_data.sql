-- ============================================================================
-- ROW LEVEL SECURITY POLICIES AND SAMPLE DATA (FIXED UUIDS)
-- ============================================================================

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Users table policies
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth_user_id = auth.uid());

-- Patients table policies
CREATE POLICY "Patients can view their own profile"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = patients.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Providers can view their assigned patients"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.auth_user_id = auth.uid() 
    AND (
      users.id = patients.assigned_doctor_id OR
      users.id = patients.assigned_nutritionist_id OR
      users.id = patients.assigned_therapist_id OR
      users.id = patients.assigned_yoga_instructor_id
    )
  ) OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.auth_user_id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Providers table policies
CREATE POLICY "Providers can view their own profile"
ON public.providers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = providers.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view active providers"
ON public.providers FOR SELECT
USING (is_accepting_patients = true);

-- Appointments table policies
CREATE POLICY "Users can view their own appointments"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = p.user_id
    WHERE p.id = appointments.patient_id 
    AND u.auth_user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.providers pr
    JOIN public.users u ON u.id = pr.user_id
    WHERE pr.id = appointments.provider_id 
    AND u.auth_user_id = auth.uid()
  )
);

-- Medical records table policies
CREATE POLICY "Patients can view their own medical records"
ON public.medical_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = p.user_id
    WHERE p.id = medical_records.patient_id 
    AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Providers can view medical records of their patients"
ON public.medical_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.providers pr
    JOIN public.users u ON u.id = pr.user_id
    WHERE pr.id = medical_records.provider_id 
    AND u.auth_user_id = auth.uid()
  )
);

-- Messages table policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.users u ON u.id = ANY(c.participants)
    WHERE c.id = messages.conversation_id 
    AND u.auth_user_id = auth.uid()
  )
);

-- Notifications table policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = notifications.recipient_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT (USING PROPER UUID GENERATION)
-- ============================================================================

-- Sample subscription packages
INSERT INTO public.subscription_packages (package_id, package_name, description, features, monthly_price, quarterly_price, yearly_price, included_consultations, included_lab_tests, included_scans) VALUES
('PKG001', 'Basic Care', 'Essential pregnancy care package', '{"consultations": "2 per month", "lab_tests": "Basic tests", "support": "Chat support"}', 1999.00, 5497.00, 19990.00, 2, 5, 1),
('PKG002', 'Complete Care', 'Comprehensive pregnancy care', '{"consultations": "Unlimited", "lab_tests": "All tests", "nutrition": "Diet planning", "yoga": "Classes included"}', 4999.00, 13497.00, 49990.00, 999, 20, 5),
('PKG003', 'Premium Care', 'Premium pregnancy care with 24/7 support', '{"consultations": "Unlimited", "lab_tests": "All tests", "nutrition": "Personal nutritionist", "yoga": "Personal trainer", "support": "24/7 hotline"}', 9999.00, 26997.00, 99990.00, 999, 999, 10);

-- Generate UUIDs for sample data
DO $$
DECLARE
    -- Provider UUIDs
    doctor1_id UUID := gen_random_uuid();
    doctor2_id UUID := gen_random_uuid();
    radiologist_id UUID := gen_random_uuid();
    lab_tech_id UUID := gen_random_uuid();
    nutritionist_id UUID := gen_random_uuid();
    therapist_id UUID := gen_random_uuid();
    yoga_id UUID := gen_random_uuid();
    pharmacy_id UUID := gen_random_uuid();
    food_id UUID := gen_random_uuid();
    admin_id UUID := gen_random_uuid();
    
    -- Patient UUIDs
    patient1_id UUID := gen_random_uuid();
    patient2_id UUID := gen_random_uuid();
    patient3_id UUID := gen_random_uuid();
    
    -- Other record UUIDs
    appointment1_id UUID := gen_random_uuid();
    appointment2_id UUID := gen_random_uuid();
    appointment3_id UUID := gen_random_uuid();
    record1_id UUID := gen_random_uuid();
    record2_id UUID := gen_random_uuid();
    record3_id UUID := gen_random_uuid();
    conversation_id UUID := gen_random_uuid();
    message1_id UUID := gen_random_uuid();
    message2_id UUID := gen_random_uuid();
    task1_id UUID := gen_random_uuid();
    task2_id UUID := gen_random_uuid();
BEGIN
    -- Sample users (providers)
    INSERT INTO public.users (id, email, name, phone, role, is_active) VALUES
    (doctor1_id, 'dr.sharma@pregacare.com', 'Dr. Priya Sharma', '+91-9876543210', 'doctor', true),
    (doctor2_id, 'dr.patel@pregacare.com', 'Dr. Raj Patel', '+91-9876543211', 'doctor', true),
    (radiologist_id, 'radiologist@pregacare.com', 'Dr. Anita Kumar', '+91-9876543212', 'radiologist', true),
    (lab_tech_id, 'lab@pregacare.com', 'Ram Singh', '+91-9876543213', 'lab_technician', true),
    (nutritionist_id, 'nutritionist@pregacare.com', 'Meera Joshi', '+91-9876543214', 'nutritionist', true),
    (therapist_id, 'therapist@pregacare.com', 'Dr. Kavya Nair', '+91-9876543215', 'therapist', true),
    (yoga_id, 'yoga@pregacare.com', 'Sunita Gupta', '+91-9876543216', 'yoga_instructor', true),
    (pharmacy_id, 'pharmacy@pregacare.com', 'MedPlus Pharmacy', '+91-9876543217', 'pharmacy', true),
    (food_id, 'food@pregacare.com', 'Healthy Meals Co', '+91-9876543218', 'food_service', true),
    (admin_id, 'admin@pregacare.com', 'System Admin', '+91-9876543219', 'admin', true);

    -- Sample providers
    INSERT INTO public.providers (id, user_id, provider_id, specialization, license_number, experience_years, consultation_fee, rating, total_reviews, working_hours, is_accepting_patients) VALUES
    (doctor1_id, doctor1_id, 'D001', 'Obstetrician & Gynecologist', 'MH/2018/12345', 12, 1500.00, 4.8, 245, '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "09:00-13:00"}', true),
    (doctor2_id, doctor2_id, 'D002', 'Maternal Fetal Medicine', 'MH/2019/23456', 8, 2000.00, 4.9, 156, '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00"}', true),
    (radiologist_id, radiologist_id, 'R001', 'Radiology - Obstetric Ultrasound', 'MH/2020/34567', 6, 800.00, 4.7, 89, '{"monday": "08:00-16:00", "tuesday": "08:00-16:00", "wednesday": "08:00-16:00", "thursday": "08:00-16:00", "friday": "08:00-16:00", "saturday": "08:00-12:00"}', true),
    (lab_tech_id, lab_tech_id, 'L001', 'Laboratory Services', 'LAB/2021/45678', 5, 0.00, 4.5, 234, '{"monday": "07:00-20:00", "tuesday": "07:00-20:00", "wednesday": "07:00-20:00", "thursday": "07:00-20:00", "friday": "07:00-20:00", "saturday": "07:00-15:00", "sunday": "08:00-12:00"}', true),
    (nutritionist_id, nutritionist_id, 'N001', 'Pregnancy Nutrition Specialist', 'NUT/2022/56789', 7, 1200.00, 4.8, 178, '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00"}', true),
    (therapist_id, therapist_id, 'T001', 'Perinatal Psychologist', 'PSY/2021/67890', 4, 1800.00, 4.9, 92, '{"monday": "11:00-19:00", "tuesday": "11:00-19:00", "wednesday": "11:00-19:00", "thursday": "11:00-19:00", "friday": "11:00-19:00"}', true),
    (yoga_id, yoga_id, 'Y001', 'Prenatal Yoga Instructor', 'YOGA/2023/78901', 3, 800.00, 4.6, 145, '{"monday": "06:00-12:00", "tuesday": "06:00-12:00", "wednesday": "06:00-12:00", "thursday": "06:00-12:00", "friday": "06:00-12:00", "saturday": "06:00-10:00"}', true);

    -- Sample patient users
    INSERT INTO public.users (id, email, name, phone, role, is_active) VALUES
    (patient1_id, 'patient1@example.com', 'Ananya Reddy', '+91-9876543220', 'patient', true),
    (patient2_id, 'patient2@example.com', 'Priyanka Singh', '+91-9876543221', 'patient', true),
    (patient3_id, 'patient3@example.com', 'Sneha Gupta', '+91-9876543222', 'patient', true);

    -- Sample patients
    INSERT INTO public.patients (id, user_id, patient_id, date_of_birth, pregnancy_stage, pregnancy_week, due_date, risk_status, assigned_doctor_id, assigned_nutritionist_id, subscription_package, medical_history, allergies) VALUES
    (patient1_id, patient1_id, 'P001', '1992-03-15', 'second_trimester', 24, '2025-12-25', 'normal', doctor1_id, nutritionist_id, 'Complete Care', '{"previous_pregnancies": 0, "medical_conditions": [], "family_history": "No complications"}', ARRAY['None known']),
    (patient2_id, patient2_id, 'P002', '1988-07-22', 'third_trimester', 34, '2025-11-15', 'medium', doctor2_id, nutritionist_id, 'Premium Care', '{"previous_pregnancies": 1, "medical_conditions": ["gestational_diabetes"], "family_history": "Diabetes"}', ARRAY['Penicillin']),
    (patient3_id, patient3_id, 'P003', '1995-11-08', 'first_trimester', 8, '2026-06-10', 'normal', doctor1_id, nutritionist_id, 'Basic Care', '{"previous_pregnancies": 0, "medical_conditions": [], "family_history": "Normal"}', ARRAY['None known']);

    -- Sample appointments
    INSERT INTO public.appointments (id, appointment_id, patient_id, provider_id, appointment_date, appointment_time, appointment_type, status, consultation_fee) VALUES
    (appointment1_id, 'APT001', patient1_id, doctor1_id, '2025-10-05', '10:00:00', 'video', 'scheduled', 1500.00),
    (appointment2_id, 'APT002', patient2_id, doctor2_id, '2025-10-03', '14:30:00', 'in_person', 'confirmed', 2000.00),
    (appointment3_id, 'APT003', patient3_id, radiologist_id, '2025-10-08', '09:15:00', 'in_person', 'scheduled', 800.00);

    -- Sample medical records
    INSERT INTO public.medical_records (id, record_id, patient_id, provider_id, record_type, title, description, structured_data, test_date, is_critical) VALUES
    (record1_id, 'MR001', patient1_id, lab_tech_id, 'lab_report', 'Complete Blood Count', 'Routine blood work for 24-week checkup', '{"hemoglobin": 12.5, "platelets": 250000, "wbc": 8500, "normal_range": true}', '2025-09-25', false),
    (record2_id, 'MR002', patient2_id, lab_tech_id, 'lab_report', 'Glucose Tolerance Test', 'Gestational diabetes screening', '{"fasting_glucose": 95, "1hr_glucose": 185, "2hr_glucose": 165, "result": "elevated", "needs_followup": true}', '2025-09-20', true),
    (record3_id, 'MR003', patient1_id, radiologist_id, 'scan_report', 'Anomaly Scan', '20-week detailed ultrasound examination', '{"fetal_weight": "350g", "estimated_due_date": "2025-12-25", "fetal_growth": "normal", "anomalies": "none_detected"}', '2025-09-15', false);

    -- Sample notifications
    INSERT INTO public.notifications (notification_id, recipient_id, notification_type, title, message, delivery_methods) VALUES
    ('NOT001', patient1_id, 'appointment_reminder', 'Upcoming Appointment', 'You have an appointment with Dr. Priya Sharma tomorrow at 10:00 AM', ARRAY['in_app', 'email']),
    ('NOT002', patient2_id, 'test_result', 'Lab Results Available', 'Your glucose tolerance test results are now available. Please review with your doctor.', ARRAY['in_app', 'email']),
    ('NOT003', patient3_id, 'diet_plan_update', 'New Diet Plan', 'Your nutritionist has updated your meal plan for this week.', ARRAY['in_app']);

    -- Sample conversation
    INSERT INTO public.conversations (id, conversation_id, participants, participant_roles, title, conversation_type) VALUES
    (conversation_id, 'CONV001', ARRAY[patient1_id, doctor1_id], ARRAY['patient', 'doctor'], 'Ananya & Dr. Sharma', 'private');

    -- Sample messages
    INSERT INTO public.messages (id, message_id, conversation_id, sender_id, message_type, content) VALUES
    (message1_id, 'MSG001', conversation_id, patient1_id, 'text', 'Hello Dr. Sharma, I have been experiencing some mild back pain. Is this normal at 24 weeks?'),
    (message2_id, 'MSG002', conversation_id, doctor1_id, 'text', 'Hi Ananya! Mild back pain is quite common during the second trimester as your baby grows. I recommend gentle stretching and prenatal yoga. Let''s discuss this more in your upcoming appointment.');

    -- Sample tasks
    INSERT INTO public.tasks (id, task_id, assigned_to, assigned_by, patient_id, task_type, title, description, priority, due_date) VALUES
    (task1_id, 'TASK001', lab_tech_id, doctor1_id, patient2_id, 'lab_test_request', 'Follow-up GTT', 'Please conduct follow-up glucose tolerance test for patient P002', 'high', '2025-10-05'),
    (task2_id, 'TASK002', nutritionist_id, doctor1_id, patient3_id, 'diet_plan_creation', 'First Trimester Diet Plan', 'Create comprehensive nutrition plan for early pregnancy', 'medium', '2025-10-02');

END $$;

-- ============================================================================
-- UTILITY FUNCTIONS FOR APPLICATION
-- ============================================================================

-- Function to get patient dashboard data
CREATE OR REPLACE FUNCTION get_patient_dashboard_data(patient_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'patient_info', (
            SELECT jsonb_build_object(
                'name', u.name,
                'patient_id', p.patient_id,
                'pregnancy_week', p.pregnancy_week,
                'due_date', p.due_date,
                'risk_status', p.risk_status,
                'pregnancy_stage', p.pregnancy_stage
            )
            FROM public.patients p
            JOIN public.users u ON u.id = p.user_id
            WHERE p.id = patient_uuid
        ),
        'upcoming_appointments', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'appointment_id', a.appointment_id,
                    'date', a.appointment_date,
                    'time', a.appointment_time,
                    'provider_name', u.name,
                    'appointment_type', a.appointment_type,
                    'status', a.status
                )
            )
            FROM public.appointments a
            JOIN public.providers pr ON pr.id = a.provider_id
            JOIN public.users u ON u.id = pr.user_id
            WHERE a.patient_id = patient_uuid 
            AND a.appointment_date >= CURRENT_DATE
            ORDER BY a.appointment_date, a.appointment_time
            LIMIT 5
        ),
        'recent_records', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'record_id', mr.record_id,
                    'title', mr.title,
                    'record_type', mr.record_type,
                    'test_date', mr.test_date,
                    'is_critical', mr.is_critical,
                    'provider_name', u.name
                )
            )
            FROM public.medical_records mr
            JOIN public.providers pr ON pr.id = mr.provider_id
            JOIN public.users u ON u.id = pr.user_id
            WHERE mr.patient_id = patient_uuid
            ORDER BY mr.test_date DESC
            LIMIT 5
        ),
        'unread_notifications', (
            SELECT COUNT(*)
            FROM public.notifications n
            JOIN public.users u ON u.id = n.recipient_id
            WHERE u.id = (SELECT user_id FROM public.patients WHERE id = patient_uuid)
            AND n.is_read = false
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get provider dashboard data
CREATE OR REPLACE FUNCTION get_provider_dashboard_data(provider_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    provider_role TEXT;
BEGIN
    -- Get provider role
    SELECT u.role INTO provider_role
    FROM public.providers pr
    JOIN public.users u ON u.id = pr.user_id
    WHERE pr.id = provider_uuid;
    
    SELECT jsonb_build_object(
        'provider_info', (
            SELECT jsonb_build_object(
                'name', u.name,
                'provider_id', pr.provider_id,
                'specialization', pr.specialization,
                'role', u.role,
                'rating', pr.rating
            )
            FROM public.providers pr
            JOIN public.users u ON u.id = pr.user_id
            WHERE pr.id = provider_uuid
        ),
        'assigned_patients_count', (
            CASE 
                WHEN provider_role = 'doctor' THEN (
                    SELECT COUNT(*) 
                    FROM public.patients p
                    JOIN public.users u ON u.id = p.assigned_doctor_id
                    JOIN public.providers pr ON pr.user_id = u.id
                    WHERE pr.id = provider_uuid
                )
                WHEN provider_role = 'nutritionist' THEN (
                    SELECT COUNT(*) 
                    FROM public.patients p
                    JOIN public.users u ON u.id = p.assigned_nutritionist_id
                    JOIN public.providers pr ON pr.user_id = u.id
                    WHERE pr.id = provider_uuid
                )
                ELSE 0
            END
        ),
        'upcoming_appointments', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'appointment_id', a.appointment_id,
                    'date', a.appointment_date,
                    'time', a.appointment_time,
                    'patient_name', pu.name,
                    'patient_id', p.patient_id,
                    'appointment_type', a.appointment_type,
                    'status', a.status
                )
            )
            FROM public.appointments a
            JOIN public.patients p ON p.id = a.patient_id
            JOIN public.users pu ON pu.id = p.user_id
            WHERE a.provider_id = provider_uuid 
            AND a.appointment_date >= CURRENT_DATE
            ORDER BY a.appointment_date, a.appointment_time
            LIMIT 5
        ),
        'pending_tasks', (
            SELECT COUNT(*)
            FROM public.tasks t
            JOIN public.users u ON u.id = t.assigned_to
            JOIN public.providers pr ON pr.user_id = u.id
            WHERE pr.id = provider_uuid
            AND t.status IN ('pending', 'in_progress')
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;