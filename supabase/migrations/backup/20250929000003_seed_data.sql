-- ============================================================================
-- PREGACARE SEED DATA - SAMPLE USERS AND HEALTHCARE ECOSYSTEM
-- ============================================================================

-- Insert sample subscription packages
INSERT INTO public.subscription_packages (package_id, package_name, description, features, monthly_price, quarterly_price, yearly_price, included_consultations, included_lab_tests, included_scans) VALUES
('PKG001', 'Basic Care', 'Essential prenatal monitoring', '{"video_consultations": true, "basic_reports": true, "nutrition_guidance": false}', 999.00, 2799.00, 9999.00, 2, 3, 1),
('PKG002', 'Complete Care', 'Comprehensive pregnancy support', '{"video_consultations": true, "basic_reports": true, "nutrition_guidance": true, "therapy_sessions": true}', 1999.00, 5699.00, 19999.00, 4, 6, 3),
('PKG003', 'Premium Care', 'Full-service pregnancy management', '{"video_consultations": true, "basic_reports": true, "nutrition_guidance": true, "therapy_sessions": true, "home_visits": true, "24x7_support": true}', 3999.00, 11399.00, 39999.00, 8, 12, 6);

-- Insert sample users (Note: In real implementation, auth_user_id would come from Supabase Auth)
INSERT INTO public.users (id, email, name, phone, role, profile_picture) VALUES
-- Patients
('550e8400-e29b-41d4-a716-446655440001', 'priya.sharma@email.com', 'Priya Sharma', '+91-9876543210', 'patient', 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=150'),
('550e8400-e29b-41d4-a716-446655440002', 'anita.gupta@email.com', 'Anita Gupta', '+91-9876543211', 'patient', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
('550e8400-e29b-41d4-a716-446655440003', 'meera.patel@email.com', 'Meera Patel', '+91-9876543212', 'patient', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),

-- Doctors
('550e8400-e29b-41d4-a716-446655440010', 'dr.rajesh.kumar@email.com', 'Dr. Rajesh Kumar', '+91-9876543220', 'doctor', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'),
('550e8400-e29b-41d4-a716-446655440011', 'dr.kavita.singh@email.com', 'Dr. Kavita Singh', '+91-9876543221', 'doctor', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'),

-- Specialists
('550e8400-e29b-41d4-a716-446655440020', 'dr.amit.radiologist@email.com', 'Dr. Amit Verma', '+91-9876543230', 'radiologist', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150'),
('550e8400-e29b-41d4-a716-446655440021', 'lab.tech.sunita@email.com', 'Sunita Lab Tech', '+91-9876543231', 'lab_technician', 'https://images.unsplash.com/photo-1594824919135-c7e045bff99e?w=150'),
('550e8400-e29b-41d4-a716-446655440022', 'nutritionist.ravi@email.com', 'Ravi Nutritionist', '+91-9876543232', 'nutritionist', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('550e8400-e29b-41d4-a716-446655440023', 'therapist.neha@email.com', 'Neha Therapist', '+91-9876543233', 'therapist', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('550e8400-e29b-41d4-a716-446655440024', 'yoga.instructor.arjun@email.com', 'Arjun Yoga Instructor', '+91-9876543234', 'yoga_instructor', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150'),

-- Service Providers
('550e8400-e29b-41d4-a716-446655440030', 'pharmacy.central@email.com', 'Central Pharmacy', '+91-9876543240', 'pharmacy', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150'),
('550e8400-e29b-41d4-a716-446655440031', 'food.service.healthy@email.com', 'Healthy Food Service', '+91-9876543241', 'food_service', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=150'),
('550e8400-e29b-41d4-a716-446655440032', 'community.manager@email.com', 'Community Manager', '+91-9876543242', 'community_manager', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),

-- Admin
('550e8400-e29b-41d4-a716-446655440040', 'admin@pregacare.com', 'System Admin', '+91-9876543250', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150');

-- Insert providers
INSERT INTO public.providers (id, user_id, provider_id, specialization, license_number, experience_years, education, certifications, bio, consultation_fee, rating, total_reviews, languages, working_hours, clinic_address) VALUES
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'D001', 'Obstetrics & Gynecology', 'MCI12345', 15, 
 ARRAY['MBBS - AIIMS Delhi', 'MD Obstetrics - PGIMER'], 
 ARRAY['Board Certified OB/GYN', 'Fetal Medicine Specialist'],
 'Experienced obstetrician specializing in high-risk pregnancies and prenatal care.',
 1500.00, 4.8, 124, ARRAY['English', 'Hindi'], 
 '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "09:00-13:00"}',
 '{"street": "123 Medical Center", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}'),

('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', 'D002', 'Obstetrics & Gynecology', 'MCI12346', 12, 
 ARRAY['MBBS - Grant Medical College', 'DGO - KEM Hospital'], 
 ARRAY['FOGSI Member', 'Laparoscopic Surgery Certified'],
 'Specialist in normal and complicated deliveries with focus on maternal wellness.',
 1200.00, 4.9, 89, ARRAY['English', 'Hindi', 'Marathi'], 
 '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00", "saturday": "10:00-14:00"}',
 '{"street": "456 Women\'s Clinic", "city": "Mumbai", "state": "Maharashtra", "pincode": "400002"}'),

('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440020', 'R001', 'Radiology - Fetal Medicine', 'RAD12345', 10, 
 ARRAY['MBBS - Seth GS Medical College', 'MD Radiology - Tata Memorial'], 
 ARRAY['Fetal Radiology Specialist', 'ISUOG Member'],
 'Expert in prenatal ultrasounds and fetal anomaly detection.',
 800.00, 4.7, 67, ARRAY['English', 'Hindi'], 
 '{"monday": "08:00-16:00", "tuesday": "08:00-16:00", "wednesday": "08:00-16:00", "thursday": "08:00-16:00", "friday": "08:00-16:00", "saturday": "08:00-12:00"}',
 '{"street": "789 Scan Center", "city": "Mumbai", "state": "Maharashtra", "pincode": "400003"}'),

('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440021', 'L001', 'Clinical Laboratory', 'LAB12345', 8, 
 ARRAY['BSc Medical Laboratory Technology', 'MSc Clinical Biochemistry'], 
 ARRAY['NABL Certified', 'ISO 15189 Trained'],
 'Senior lab technician specializing in prenatal screening tests.',
 0.00, 4.6, 45, ARRAY['English', 'Hindi'], 
 '{"monday": "07:00-19:00", "tuesday": "07:00-19:00", "wednesday": "07:00-19:00", "thursday": "07:00-19:00", "friday": "07:00-19:00", "saturday": "07:00-15:00"}',
 '{"street": "101 Diagnostic Center", "city": "Mumbai", "state": "Maharashtra", "pincode": "400004"}'),

('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440022', 'N001', 'Clinical Nutrition', 'NUT12345', 6, 
 ARRAY['MSc Nutrition & Dietetics', 'PhD Food Science'], 
 ARRAY['Registered Dietitian', 'Prenatal Nutrition Specialist'],
 'Certified nutritionist focusing on maternal and fetal nutrition.',
 600.00, 4.8, 78, ARRAY['English', 'Hindi'], 
 '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00"}',
 '{"street": "202 Nutrition Center", "city": "Mumbai", "state": "Maharashtra", "pincode": "400005"}'),

('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440023', 'T001', 'Clinical Psychology', 'PSY12345', 7, 
 ARRAY['MA Psychology', 'M.Phil Clinical Psychology'], 
 ARRAY['Licensed Clinical Psychologist', 'Prenatal Mental Health Specialist'],
 'Clinical psychologist specializing in perinatal mental health.',
 800.00, 4.9, 56, ARRAY['English', 'Hindi'], 
 '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00"}',
 '{"street": "303 Mind Wellness Center", "city": "Mumbai", "state": "Maharashtra", "pincode": "400006"}'),

('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440024', 'Y001', 'Prenatal Yoga', 'YOGA12345', 5, 
 ARRAY['Certified Yoga Instructor - 500 RYT', 'Prenatal Yoga Specialist'], 
 ARRAY['Prenatal Yoga Alliance Certified', 'Lamaze Educator'],
 'Certified prenatal yoga instructor and birth educator.',
 400.00, 4.9, 89, ARRAY['English', 'Hindi'], 
 '{"monday": "06:00-20:00", "tuesday": "06:00-20:00", "wednesday": "06:00-20:00", "thursday": "06:00-20:00", "friday": "06:00-20:00", "saturday": "06:00-18:00", "sunday": "07:00-12:00"}',
 '{"street": "404 Yoga Studio", "city": "Mumbai", "state": "Maharashtra", "pincode": "400007"}'),

('660e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440030', 'P001', 'Pharmacy Services', 'PHARM12345', 12, 
 ARRAY['B.Pharm', 'Registered Pharmacist'], 
 ARRAY['Licensed Pharmacist', 'Clinical Pharmacy Certified'],
 'Full-service pharmacy specializing in maternal medications.',
 0.00, 4.7, 123, ARRAY['English', 'Hindi'], 
 '{"monday": "08:00-22:00", "tuesday": "08:00-22:00", "wednesday": "08:00-22:00", "thursday": "08:00-22:00", "friday": "08:00-22:00", "saturday": "08:00-22:00", "sunday": "09:00-21:00"}',
 '{"street": "505 Central Pharmacy", "city": "Mumbai", "state": "Maharashtra", "pincode": "400008"}'),

('660e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440031', 'F001', 'Food Services', 'FOOD12345', 4, 
 ARRAY['Culinary Arts Diploma', 'Food Safety Certification'], 
 ARRAY['FSSAI Licensed', 'Nutrition-Focused Cooking'],
 'Specialized meal delivery service for pregnant women.',
 0.00, 4.8, 67, ARRAY['English', 'Hindi'], 
 '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "06:00-22:00", "sunday": "07:00-21:00"}',
 '{"street": "606 Healthy Kitchen", "city": "Mumbai", "state": "Maharashtra", "pincode": "400009"}');

-- Insert patients
INSERT INTO public.patients (id, user_id, patient_id, date_of_birth, pregnancy_stage, pregnancy_week, due_date, risk_status, medical_history, allergies, assigned_doctor_id, assigned_nutritionist_id, assigned_therapist_id, assigned_yoga_instructor_id, subscription_package, emergency_contact, address) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'P001', '1992-03-15', 'second_trimester', 18, '2025-02-14', 'normal', 
 '{"previous_pregnancies": 0, "chronic_conditions": [], "family_history": ["diabetes"], "blood_type": "O+"}', 
 ARRAY['shellfish'], '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440024', 'Complete Care',
 '{"name": "Raj Sharma", "relationship": "Husband", "phone": "+91-9876543213"}',
 '{"street": "A-101 Harmony Apartments", "city": "Mumbai", "state": "Maharashtra", "pincode": "400010"}'),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'P002', '1988-07-22', 'third_trimester', 28, '2025-01-10', 'medium', 
 '{"previous_pregnancies": 1, "chronic_conditions": ["gestational_diabetes"], "family_history": ["hypertension"], "blood_type": "A+"}', 
 ARRAY['peanuts', 'latex'], '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440024', 'Premium Care',
 '{"name": "Vikram Gupta", "relationship": "Husband", "phone": "+91-9876543214"}',
 '{"street": "B-205 Green Valley", "city": "Mumbai", "state": "Maharashtra", "pincode": "400011"}'),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'P003', '1995-11-08', 'first_trimester', 8, '2025-06-15', 'normal', 
 '{"previous_pregnancies": 0, "chronic_conditions": [], "family_history": [], "blood_type": "B+"}', 
 ARRAY[], '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440022', null, '550e8400-e29b-41d4-a716-446655440024', 'Basic Care',
 '{"name": "Arjun Patel", "relationship": "Husband", "phone": "+91-9876543215"}',
 '{"street": "C-302 Sunrise Heights", "city": "Mumbai", "state": "Maharashtra", "pincode": "400012"}');

-- Insert some sample appointments
INSERT INTO public.appointments (id, appointment_id, patient_id, provider_id, appointment_date, appointment_time, appointment_type, status, patient_notes, consultation_fee) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'APT001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440010', '2025-01-15', '10:00:00', 'video', 'scheduled', 'Routine checkup, feeling good', 1500.00),
('880e8400-e29b-41d4-a716-446655440002', 'APT002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440011', '2025-01-16', '14:30:00', 'in_person', 'confirmed', 'Blood sugar monitoring needed', 1200.00),
('880e8400-e29b-41d4-a716-446655440003', 'APT003', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440020', '2025-01-20', '11:00:00', 'in_person', 'scheduled', 'Ultrasound scan scheduled', 800.00);

-- Insert sample medical records
INSERT INTO public.medical_records (id, record_id, patient_id, provider_id, record_type, category, title, description, structured_data, test_date, is_critical) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'MR001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440021', 'lab_report', 'blood_test', 'Complete Blood Count', 'Routine CBC test for 18 week pregnancy', 
 '{"hemoglobin": 11.5, "platelets": 250000, "wbc": 8500, "hematocrit": 34.5, "reference_ranges": {"hemoglobin": "11.0-14.0", "platelets": "150000-400000"}}', '2024-12-15', false),
('990e8400-e29b-41d4-a716-446655440002', 'MR002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440020', 'scan_report', 'ultrasound', 'Growth Scan', 'Fetal growth assessment at 28 weeks', 
 '{"estimated_fetal_weight": "1.2kg", "percentile": "50th", "amniotic_fluid": "normal", "placenta": "anterior, grade 1", "fetal_heart_rate": "145 bpm"}', '2024-12-10', false),
('990e8400-e29b-41d4-a716-446655440003', 'MR003', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440021', 'lab_report', 'glucose_test', 'Glucose Tolerance Test', 'GTT for gestational diabetes screening', 
 '{"fasting": 95, "1_hour": 180, "2_hour": 155, "diagnosis": "gestational_diabetes", "reference_values": {"fasting": "<95", "1_hour": "<180", "2_hour": "<155"}}', '2024-12-12', true);

-- Insert sample prescriptions
INSERT INTO public.prescriptions (id, prescription_id, patient_id, doctor_id, pharmacy_id, medications, instructions, duration_days, status, prescribed_date, valid_until) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'RX001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440030',
 '[{"name": "Folic Acid", "dosage": "5mg", "frequency": "once daily", "instructions": "Take with breakfast"}, {"name": "Iron + Calcium", "dosage": "1 tablet", "frequency": "twice daily", "instructions": "Take after meals"}]',
 'Continue throughout pregnancy. Monitor for any side effects.', 90, 'prescribed', '2024-12-15', '2025-03-15'),
('aa0e8400-e29b-41d4-a716-446655440002', 'RX002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440030',
 '[{"name": "Metformin", "dosage": "500mg", "frequency": "twice daily", "instructions": "Take with meals for gestational diabetes"}, {"name": "Prenatal Vitamins", "dosage": "1 tablet", "frequency": "once daily", "instructions": "Take with breakfast"}]',
 'Monitor blood glucose levels daily. Follow dietary recommendations.', 60, 'sent_to_pharmacy', '2024-12-12', '2025-02-12');

-- Insert sample diet plans
INSERT INTO public.diet_plans (id, plan_id, patient_id, nutritionist_id, food_service_id, plan_name, plan_description, dietary_restrictions, calorie_target, weekly_meals, delivery_frequency, status, start_date) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'DP001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440031', 
 'Second Trimester Nutrition Plan', 'Balanced nutrition plan for healthy pregnancy in second trimester', ARRAY['shellfish'], 2200,
 '{"monday": {"breakfast": "Oats with fruits", "lunch": "Dal rice with vegetables", "dinner": "Chapati with paneer curry"}, "tuesday": {"breakfast": "Poha with nuts", "lunch": "Vegetable pulav", "dinner": "Quinoa salad"}}',
 'weekly', 'active', '2024-12-01'),
('bb0e8400-e29b-41d4-a716-446655440002', 'DP002', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440031',
 'Gestational Diabetes Diet Plan', 'Low glycemic index meals for managing gestational diabetes', ARRAY['peanuts', 'high_sugar_foods'], 1800,
 '{"monday": {"breakfast": "Vegetable upma", "lunch": "Brown rice with dal", "dinner": "Grilled chicken with salad"}, "tuesday": {"breakfast": "Whole wheat toast with avocado", "lunch": "Quinoa bowl", "dinner": "Fish curry with vegetables"}}',
 'daily', 'active', '2024-12-10');

-- Insert sample therapy sessions
INSERT INTO public.therapy_sessions (id, session_id, patient_id, provider_id, session_type, session_title, scheduled_date, scheduled_time, duration_minutes, session_plan, status, meeting_type) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'TS001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440023', 'individual_therapy', 'Prenatal Anxiety Management', '2025-01-18', '15:00:00', 60,
 '{"topics": ["breathing techniques", "stress management", "birth preparation"], "exercises": ["progressive muscle relaxation", "visualization"], "goals": ["reduce anxiety", "improve coping skills"]}',
 'scheduled', 'online'),
('cc0e8400-e29b-41d4-a716-446655440002', 'TS002', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440024', 'yoga_class', 'Prenatal Yoga - Beginner', '2025-01-20', '09:00:00', 90,
 '{"poses": ["cat_cow", "child_pose", "warrior_II_modified"], "breathing": ["ujjayi", "box_breathing"], "meditation": "body_scan", "precautions": ["avoid_deep_twists", "no_prone_positions"]}',
 'scheduled', 'in_person');

-- Insert sample tasks
INSERT INTO public.tasks (id, task_id, assigned_to, assigned_by, patient_id, task_type, title, description, priority, due_date, status) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'TSK001', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440003', 'lab_test_request', 'First Trimester Screening', 'Complete blood work and NT scan for first trimester screening', 'high', '2025-01-25', 'pending'),
('dd0e8400-e29b-41d4-a716-446655440002', 'TSK002', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440002', 'scan_request', 'Growth Scan Follow-up', 'Follow-up ultrasound to monitor fetal growth in GDM patient', 'medium', '2025-01-30', 'pending');

-- Insert sample conversations
INSERT INTO public.conversations (id, conversation_id, participants, participant_roles, title, conversation_type) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'CONV001', 
 ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'], 
 ARRAY['patient', 'doctor'], 'Priya Sharma - Dr. Rajesh Kumar', 'private'),
('ee0e8400-e29b-41d4-a716-446655440002', 'CONV002', 
 ARRAY['550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440022'], 
 ARRAY['doctor', 'nutritionist'], 'Dr. Rajesh Kumar - Ravi Nutritionist (Re: Priya Sharma)', 'private');

-- Insert sample messages
INSERT INTO public.messages (id, message_id, conversation_id, sender_id, message_type, content) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'MSG001', 'ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'text', 'Hi Doctor, I have been feeling some mild nausea in the mornings. Is this normal?'),
('ff0e8400-e29b-41d4-a716-446655440002', 'MSG002', 'ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'text', 'Hello Priya, morning nausea is very common in the second trimester. Try eating small, frequent meals and avoid spicy foods. If it persists, we can discuss medication options.'),
('ff0e8400-e29b-41d4-a716-446655440003', 'MSG003', 'ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 'text', 'Hi Ravi, can you please review Priya Sharma''s nutrition plan? She''s experiencing some morning nausea and may need dietary adjustments.');

-- Insert sample notifications
INSERT INTO public.notifications (id, notification_id, recipient_id, notification_type, title, message, delivery_methods, scheduled_for) VALUES
('110e8400-e29b-41d4-a716-446655440001', 'NOT001', '550e8400-e29b-41d4-a716-446655440001', 'appointment_reminder', 'Upcoming Appointment Reminder', 'Your appointment with Dr. Rajesh Kumar is scheduled for tomorrow at 10:00 AM', ARRAY['in_app', 'sms'], '2025-01-14 18:00:00+00'),
('110e8400-e29b-41d4-a716-446655440002', 'NOT002', '550e8400-e29b-41d4-a716-446655440002', 'test_result', 'Lab Results Available', 'Your glucose tolerance test results are now available. Please review with your doctor.', ARRAY['in_app', 'email'], NOW()),
('110e8400-e29b-41d4-a716-446655440003', 'NOT003', '550e8400-e29b-41d4-a716-446655440030', 'prescription_ready', 'New Prescription Received', 'A new prescription has been sent for patient Anita Gupta (P002)', ARRAY['in_app'], NOW());