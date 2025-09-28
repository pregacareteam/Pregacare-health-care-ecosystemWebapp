// Sample Data Generator for Pregacare System
import {
  User, Patient, Provider, Doctor, Nutritionist, YogaTrainer, Therapist, DeliveryPartner,
  Appointment, Prescription, MedicalRecord, DietPlan, YogaSession, TherapySession,
  FoodOrder, Communication, Package, Payment, Analytics
} from '../types/pregacare';
import { pregacareDB } from './storage';

// Utility functions for generating realistic data
const getRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generatePhoneNumber = (): string => {
  return `+1-555-${Math.floor(Math.random() * 9000) + 1000}`;
};

const generateEmail = (firstName: string, lastName: string, domain: string = 'email.com'): string => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

// Sample Data Arrays
const FIRST_NAMES_FEMALE = [
  'Sarah', 'Emily', 'Jessica', 'Ashley', 'Amanda', 'Jennifer', 'Michelle', 'Lisa', 'Karen', 'Nancy',
  'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Susan', 'Angela', 'Maria'
];

const FIRST_NAMES_MALE = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Charles', 'Joseph', 'Thomas',
  'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'Steven', 'Kenneth', 'Andrew', 'Brian', 'Joshua'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte'
];

const SPECIALIZATIONS = {
  doctor: ['Obstetrics & Gynecology', 'Internal Medicine', 'Family Medicine', 'Pediatrics'],
  nutritionist: ['Prenatal Nutrition', 'Clinical Nutrition', 'Sports Nutrition', 'Pediatric Nutrition'],
  yoga: ['Prenatal Yoga', 'Postnatal Yoga', 'Therapeutic Yoga', 'Meditation'],
  therapist: ['Perinatal Mental Health', 'Clinical Psychology', 'Marriage & Family Therapy', 'Cognitive Behavioral Therapy']
};

const MEDICATIONS = [
  { name: 'Prenatal Vitamins', dosage: '1 tablet', frequency: 'Once daily' },
  { name: 'Iron Supplement', dosage: '65mg', frequency: 'Once daily' },
  { name: 'Folic Acid', dosage: '800mcg', frequency: 'Once daily' },
  { name: 'Calcium Supplement', dosage: '500mg', frequency: 'Twice daily' },
  { name: 'DHA Supplement', dosage: '200mg', frequency: 'Once daily' },
  { name: 'Vitamin D', dosage: '1000 IU', frequency: 'Once daily' }
];

const YOGA_POSES = [
  { name: 'Cat-Cow Pose', duration: 5, instructions: 'Gentle spinal movements' },
  { name: 'Child\'s Pose', duration: 3, instructions: 'Resting pose for relaxation' },
  { name: 'Prenatal Sun Salutation', duration: 10, instructions: 'Modified sun salutation' },
  { name: 'Warrior II', duration: 5, instructions: 'Standing pose for strength' },
  { name: 'Tree Pose', duration: 3, instructions: 'Balance pose with support' }
];

const THERAPY_TOPICS = [
  'Pregnancy Anxiety', 'Body Image Changes', 'Relationship Dynamics', 'Work-Life Balance',
  'Postpartum Depression', 'Sleep Challenges', 'Hormonal Changes', 'Birth Preparation'
];

export class PregacareDataSeeder {
  private users: User[] = [];
  private patients: Patient[] = [];
  private providers: Provider[] = [];

  // Generate Users
  generateUsers(count: number = 50): User[] {
    const users: User[] = [];
    const roles: User['role'][] = ['patient', 'doctor', 'nutritionist', 'yoga_trainer', 'therapist', 'delivery_partner'];

    for (let i = 0; i < count; i++) {
      const role = i < 20 ? 'patient' : getRandomElement(roles.slice(1)); // More patients than providers
      const isPatient = role === 'patient';
      const firstName = isPatient ? getRandomElement(FIRST_NAMES_FEMALE) : getRandomElement([...FIRST_NAMES_FEMALE, ...FIRST_NAMES_MALE]);
      const lastName = getRandomElement(LAST_NAMES);
      
      const user: User = {
        id: `user_${i + 1}`,
        email: generateEmail(firstName, lastName),
        name: `${firstName} ${lastName}`,
        phone: generatePhoneNumber(),
        role,
        profilePicture: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop&crop=face`,
        isActive: Math.random() > 0.1, // 90% active users
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: new Date().toISOString()
      };

      users.push(user);
    }

    this.users = users;
    return users;
  }

  // Generate Patients
  generatePatients(): Patient[] {
    const patientUsers = this.users.filter(u => u.role === 'patient');
    const patients: Patient[] = [];
    const pregnancyStages: Patient['pregnancyStage'][] = ['first_trimester', 'second_trimester', 'third_trimester', 'postpartum'];
    const riskStatuses: Patient['riskStatus'][] = ['normal', 'normal', 'normal', 'medium', 'high']; // More normal risks

    patientUsers.forEach((user, index) => {
      const pregnancyStage = getRandomElement(pregnancyStages);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.random() * 280); // Up to 40 weeks from now

      const patient: Patient = {
        id: `patient_${index + 1}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: getRandomDate(new Date(1990, 0, 1), new Date(2000, 0, 1)),
        profilePicture: user.profilePicture,
        pregnancyStage,
        dueDate: pregnancyStage !== 'postpartum' ? dueDate.toISOString() : undefined,
        riskStatus: getRandomElement(riskStatuses),
        medicalHistory: {
          conditions: Math.random() > 0.7 ? getRandomElements(['Diabetes', 'Hypertension', 'Asthma', 'Thyroid'], 2) : ['none'],
          allergies: Math.random() > 0.8 ? getRandomElements(['Peanuts', 'Shellfish', 'Penicillin', 'Latex'], 2) : ['none'],
          medications: [],
          surgeries: []
        },
        emergencyContact: {
          name: `${getRandomElement(FIRST_NAMES_MALE)} ${getRandomElement(LAST_NAMES)}`,
          phone: generatePhoneNumber(),
          relationship: getRandomElement(['Spouse', 'Partner', 'Mother', 'Sister'])
        },
        address: {
          street: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(['Main', 'Oak', 'Elm', 'Pine'])} St`,
          city: getRandomElement(CITIES),
          state: 'CA',
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
        },
        assignedProviders: {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      patients.push(patient);
    });

    this.patients = patients;
    return patients;
  }

  // Generate Providers
  generateProviders(): Provider[] {
    const providerUsers = this.users.filter(u => u.role !== 'patient');
    const providers: Provider[] = [];

    providerUsers.forEach((user, index) => {
      const specializations = SPECIALIZATIONS[user.role as keyof typeof SPECIALIZATIONS] || ['General'];
      
      const provider: Provider = {
        id: `provider_${index + 1}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        providerType: user.role as Provider['providerType'],
        specialization: getRandomElement(specializations),
        experienceYears: Math.floor(Math.random() * 20) + 2,
        certification: [`Certified ${user.role}`, 'Licensed Professional'],
        bio: `Experienced ${user.role} specializing in ${getRandomElement(specializations)}. Dedicated to providing excellent care for expectant mothers.`,
        profilePicture: user.profilePicture,
        availability: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '15:00' }]
        },
        consultationFee: user.role === 'doctor' ? Math.floor(Math.random() * 300) + 150 : Math.floor(Math.random() * 150) + 75,
        rating: Math.random() * 2 + 3, // 3-5 star rating
        totalReviews: Math.floor(Math.random() * 200) + 10,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      providers.push(provider);
    });

    this.providers = providers;
    return providers;
  }

  // Generate Appointments
  generateAppointments(count: number = 100): Appointment[] {
    const appointments: Appointment[] = [];
    const appointmentTypes: Appointment['type'][] = ['video_call', 'in_person', 'phone_call'];
    const statuses: Appointment['status'][] = ['scheduled', 'confirmed', 'completed', 'cancelled'];

    for (let i = 0; i < count; i++) {
      const patient = getRandomElement(this.patients);
      const provider = getRandomElement(this.providers.filter(p => p.providerType !== 'delivery_partner'));
      const appointmentDate = getRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Next 30 days
      
      const appointment: Appointment = {
        id: `appointment_${i + 1}`,
        patientId: patient.id,
        providerId: provider.id,
        providerType: provider.providerType as 'doctor' | 'nutritionist' | 'yoga_trainer' | 'therapist',
        appointmentDate,
        duration: getRandomElement([30, 45, 60]),
        type: getRandomElement(appointmentTypes),
        status: getRandomElement(statuses),
        title: `${provider.providerType} Consultation`,
        description: `Regular checkup with ${provider.name}`,
        consultationFee: provider.consultationFee,
        meetingLink: 'https://meet.pregacare.com/room/' + Math.random().toString(36).substr(2, 9),
        reminders: {
          email: true,
          sms: true,
          push: true
        },
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: new Date().toISOString()
      };

      appointments.push(appointment);
    }

    return appointments;
  }

  // Generate Prescriptions
  generatePrescriptions(count: number = 60): Prescription[] {
    const prescriptions: Prescription[] = [];
    const doctors = this.providers.filter(p => p.providerType === 'doctor');

    for (let i = 0; i < count; i++) {
      const patient = getRandomElement(this.patients);
      const doctor = getRandomElement(doctors);
      const medicationCount = Math.floor(Math.random() * 3) + 1;
      const selectedMedications = getRandomElements(MEDICATIONS, medicationCount);

      const prescription: Prescription = {
        id: `prescription_${i + 1}`,
        doctorId: doctor.id,
        patientId: patient.id,
        medications: selectedMedications.map(med => ({
          ...med,
          duration: getRandomElement(['30 days', '60 days', '90 days', 'Throughout pregnancy']),
          instructions: getRandomElement([
            'Take with food',
            'Take on empty stomach',
            'Take at bedtime',
            'Take with water',
            'Take as directed'
          ]),
          sideEffects: getRandomElement([
            ['Nausea', 'Dizziness'],
            ['Stomach upset', 'Headache'],
            ['Drowsiness'],
            ['None reported']
          ])
        })),
        prescribedDate: getRandomDate(new Date(2024, 6, 1), new Date()),
        isActive: Math.random() > 0.3,
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
      };

      prescriptions.push(prescription);
    }

    return prescriptions;
  }

  // Generate Diet Plans
  generateDietPlans(count: number = 30): DietPlan[] {
    const dietPlans: DietPlan[] = [];
    const nutritionists = this.providers.filter(p => p.providerType === 'nutritionist');

    for (let i = 0; i < count; i++) {
      const patient = getRandomElement(this.patients);
      const nutritionist = getRandomElement(nutritionists);

      const dietPlan: DietPlan = {
        id: `diet_plan_${i + 1}`,
        patientId: patient.id,
        nutritionistId: nutritionist.id,
        planName: getRandomElement([
          'Prenatal Nutrition Plan',
          'High-Protein Pregnancy Diet',
          'Iron-Rich Meal Plan',
          'Gestational Diabetes Diet',
          'First Trimester Comfort Foods'
        ]),
        description: 'Customized nutrition plan for healthy pregnancy',
        duration: getRandomElement([30, 60, 90]),
        dailyCalories: Math.floor(Math.random() * 500) + 2000,
        macros: {
          protein: Math.floor(Math.random() * 50) + 80,
          carbs: Math.floor(Math.random() * 100) + 200,
          fat: Math.floor(Math.random() * 30) + 50,
          fiber: Math.floor(Math.random() * 10) + 25
        },
        meals: {
          breakfast: [
            {
              name: 'Greek Yogurt with Berries',
              ingredients: ['Greek yogurt', 'Mixed berries', 'Granola'],
              calories: 350,
              instructions: 'Mix yogurt with berries and top with granola',
              prepTime: 5
            }
          ],
          lunch: [
            {
              name: 'Quinoa Salad Bowl',
              ingredients: ['Quinoa', 'Grilled chicken', 'Avocado', 'Mixed vegetables'],
              calories: 520,
              instructions: 'Combine all ingredients and dress with olive oil',
              prepTime: 15
            }
          ],
          dinner: [
            {
              name: 'Baked Salmon with Sweet Potato',
              ingredients: ['Salmon fillet', 'Sweet potato', 'Steamed broccoli'],
              calories: 480,
              instructions: 'Bake salmon and sweet potato, serve with broccoli',
              prepTime: 25
            }
          ]
        },
        restrictions: getRandomElements(['No raw fish', 'No soft cheese', 'No alcohol', 'No high mercury fish'], 2),
        supplements: ['Prenatal vitamins', 'Iron supplement', 'DHA'],
        startDate: getRandomDate(new Date(2024, 6, 1), new Date()),
        endDate: getRandomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
        isActive: Math.random() > 0.3,
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: new Date().toISOString()
      };

      dietPlans.push(dietPlan);
    }

    return dietPlans;
  }

  // Generate Yoga Sessions
  generateYogaSessions(count: number = 80): YogaSession[] {
    const yogaSessions: YogaSession[] = [];
    const yogaTrainers = this.providers.filter(p => p.providerType === 'yoga_trainer');

    for (let i = 0; i < count; i++) {
      const patient = getRandomElement(this.patients);
      const trainer = getRandomElement(yogaTrainers);

      const yogaSession: YogaSession = {
        id: `yoga_session_${i + 1}`,
        patientId: patient.id,
        trainerId: trainer.id,
        sessionType: getRandomElement(['prenatal', 'postpartum', 'gentle', 'breathing']),
        title: getRandomElement([
          'Prenatal Flow',
          'Gentle Stretching',
          'Breathing & Meditation',
          'Core Strengthening',
          'Hip Opening Sequence'
        ]),
        description: 'Yoga session tailored for pregnancy wellness',
        duration: getRandomElement([30, 45, 60]),
        sessionDate: getRandomDate(new Date(2024, 6, 1), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        mode: getRandomElement(['video', 'in_person', 'group']),
        poses: getRandomElements(YOGA_POSES, 3),
        status: getRandomElement(['scheduled', 'completed', 'cancelled']),
        notes: 'Focus on breathing and gentle movements',
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
      };

      yogaSessions.push(yogaSession);
    }

    return yogaSessions;
  }

  // Generate Therapy Sessions
  generateTherapySessions(count: number = 40): TherapySession[] {
    const therapySessions: TherapySession[] = [];
    const therapists = this.providers.filter(p => p.providerType === 'therapist');

    for (let i = 0; i < count; i++) {
      const patient = getRandomElement(this.patients);
      const therapist = getRandomElement(therapists);

      const therapySession: TherapySession = {
        id: `therapy_session_${i + 1}`,
        patientId: patient.id,
        therapistId: therapist.id,
        sessionType: getRandomElement(['individual', 'group', 'family']),
        title: `Therapy Session - ${getRandomElement(THERAPY_TOPICS)}`,
        sessionDate: getRandomDate(new Date(2024, 6, 1), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        duration: getRandomElement([45, 60, 90]),
        mode: getRandomElement(['video', 'in_person', 'phone']),
        topics: getRandomElements(THERAPY_TOPICS, 2),
        goals: ['Reduce anxiety', 'Improve coping strategies', 'Build confidence'],
        notes: 'Patient showed good progress in managing stress',
        homework: 'Practice daily mindfulness exercises',
        status: getRandomElement(['scheduled', 'completed', 'cancelled']),
        progress: {
          mood: Math.floor(Math.random() * 5) + 5, // 5-10
          anxiety: Math.floor(Math.random() * 5) + 3, // 3-8
          stress: Math.floor(Math.random() * 5) + 4, // 4-9
          notes: 'Overall improvement in emotional well-being'
        },
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
      };

      therapySessions.push(therapySession);
    }

    return therapySessions;
  }

  // Generate Food Orders
  generateFoodOrders(count: number = 120): FoodOrder[] {
    const foodOrders: FoodOrder[] = [];
    const deliveryPartners = this.providers.filter(p => p.providerType === 'delivery_partner');
    const mealTypes: FoodOrder['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

    for (let i = 0; i < count; i++) {
      const patient = getRandomElement(this.patients);
      const deliveryPartner = getRandomElement(deliveryPartners);
      const mealType = getRandomElement(mealTypes);

      const foodOrder: FoodOrder = {
        id: `food_order_${i + 1}`,
        patientId: patient.id,
        deliveryPartnerId: deliveryPartner.id,
        orderDate: getRandomDate(new Date(2024, 8, 1), new Date()),
        deliveryDate: getRandomDate(new Date(), new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
        mealType,
        items: [
          {
            name: getRandomElement(['Grilled Chicken Salad', 'Quinoa Bowl', 'Salmon with Vegetables', 'Fruit Smoothie']),
            quantity: 1,
            calories: Math.floor(Math.random() * 300) + 200,
            price: Math.floor(Math.random() * 20) + 15,
            specialInstructions: 'Extra vegetables, light dressing'
          }
        ],
        totalAmount: Math.floor(Math.random() * 40) + 20,
        deliveryAddress: patient.address!,
        status: getRandomElement(['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
        trackingInfo: {
          estimatedTime: '45 minutes',
          currentLocation: 'On the way',
          updates: [
            {
              status: 'Order confirmed',
              timestamp: new Date().toISOString(),
              notes: 'Your order is being prepared'
            }
          ]
        },
        payment: {
          method: getRandomElement(['card', 'cash']),
          amount: Math.floor(Math.random() * 40) + 20,
          status: getRandomElement(['pending', 'paid'])
        },
        createdAt: getRandomDate(new Date(2024, 8, 1), new Date()),
        updatedAt: new Date().toISOString()
      };

      foodOrders.push(foodOrder);
    }

    return foodOrders;
  }

  // Generate Communications
  generateCommunications(count: number = 200): Communication[] {
    const communications: Communication[] = [];
    const allUsers = [...this.patients.map(p => ({ id: p.id, name: p.name })), ...this.providers.map(p => ({ id: p.id, name: p.name }))];

    for (let i = 0; i < count; i++) {
      const sender = getRandomElement(allUsers);
      const receiver = getRandomElement(allUsers.filter(u => u.id !== sender.id));

      const communication: Communication = {
        id: `communication_${i + 1}`,
        senderId: sender.id,
        receiverId: receiver.id,
        type: getRandomElement(['message', 'appointment_request', 'prescription', 'reminder']),
        title: getRandomElement([
          'Appointment Confirmation',
          'Prescription Update',
          'Lab Results Available',
          'Follow-up Question',
          'Appointment Reminder'
        ]),
        content: getRandomElement([
          'Your appointment is confirmed for tomorrow at 2 PM.',
          'Please review your updated prescription.',
          'Your lab results are now available in your portal.',
          'I have a question about my medication dosage.',
          'Don\'t forget about your appointment tomorrow.'
        ]),
        isRead: Math.random() > 0.3,
        isUrgent: Math.random() > 0.8,
        createdAt: getRandomDate(new Date(2024, 8, 1), new Date())
      };

      communications.push(communication);
    }

    return communications;
  }

  // Generate Packages
  generatePackages(): Package[] {
    const packages: Package[] = [
      {
        id: 'package_1',
        name: 'Essential Care',
        description: 'Basic prenatal care package for expectant mothers',
        features: [
          'Monthly doctor consultations',
          'Basic nutrition guidance',
          'Pregnancy milestone tracking',
          'Email support'
        ],
        duration: 9,
        price: {
          monthly: 199,
          total: 1791,
          discountPercentage: 10
        },
        includes: {
          doctorVisits: 12,
          nutritionistSessions: 6,
          yogaSessions: 0,
          therapySessions: 0,
          foodDelivery: false,
          emergencySupport: false
        },
        isPopular: false,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'package_2',
        name: 'Comprehensive Care',
        description: 'Complete prenatal and wellness package with all services',
        features: [
          'Unlimited doctor consultations',
          'Personalized nutrition plans',
          'Weekly yoga sessions',
          'Mental health support',
          'Healthy meal delivery',
          '24/7 emergency support',
          'Postpartum care (3 months)'
        ],
        duration: 12,
        price: {
          monthly: 499,
          total: 4491,
          discountPercentage: 25
        },
        includes: {
          doctorVisits: -1, // Unlimited
          nutritionistSessions: 24,
          yogaSessions: 48,
          therapySessions: 12,
          foodDelivery: true,
          emergencySupport: true
        },
        isPopular: true,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'package_3',
        name: 'Premium Care Plus',
        description: 'Luxury prenatal care with concierge services',
        features: [
          'Dedicated care team',
          'Private consultations',
          'Custom meal planning',
          'Personal yoga instructor',
          'Home delivery services',
          'Premium app access',
          'Extended postpartum care (6 months)'
        ],
        duration: 15,
        price: {
          monthly: 799,
          total: 9591,
          discountPercentage: 20
        },
        includes: {
          doctorVisits: -1,
          nutritionistSessions: -1,
          yogaSessions: -1,
          therapySessions: 24,
          foodDelivery: true,
          emergencySupport: true
        },
        isPopular: false,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    return packages;
  }

  // Main seeding function
  async seedAllData(): Promise<void> {
    console.log('🌱 Starting Pregacare data seeding...');

    try {
      // Clear existing data
      pregacareDB.clearAllData();

      // Generate and save users
      console.log('👥 Generating users...');
      const users = this.generateUsers(50);
      users.forEach(user => pregacareDB.users.create(user as any));

      // Generate and save patients
      console.log('🤰 Generating patients...');
      const patients = this.generatePatients();
      patients.forEach(patient => pregacareDB.patients.create(patient as any));

      // Generate and save providers
      console.log('👩‍⚕️ Generating providers...');
      const providers = this.generateProviders();
      providers.forEach(provider => pregacareDB.providers.create(provider as any));

      // Assign providers to patients
      console.log('🔗 Assigning providers to patients...');
      const doctors = providers.filter(p => p.providerType === 'doctor');
      const nutritionists = providers.filter(p => p.providerType === 'nutritionist');
      const yogaTrainers = providers.filter(p => p.providerType === 'yoga_trainer');
      const therapists = providers.filter(p => p.providerType === 'therapist');

      patients.forEach(patient => {
        const assignedProviders = {
          doctorId: getRandomElement(doctors).id,
          nutritionistId: Math.random() > 0.3 ? getRandomElement(nutritionists).id : undefined,
          yogaTrainerId: Math.random() > 0.5 ? getRandomElement(yogaTrainers).id : undefined,
          therapistId: Math.random() > 0.7 ? getRandomElement(therapists).id : undefined
        };
        
        pregacareDB.patients.update(patient.id, { assignedProviders });
      });

      // Generate other data
      console.log('📅 Generating appointments...');
      const appointments = this.generateAppointments(100);
      appointments.forEach(appointment => pregacareDB.appointments.create(appointment as any));

      console.log('💊 Generating prescriptions...');
      const prescriptions = this.generatePrescriptions(60);
      prescriptions.forEach(prescription => pregacareDB.prescriptions.create(prescription as any));

      console.log('🥗 Generating diet plans...');
      const dietPlans = this.generateDietPlans(30);
      dietPlans.forEach(plan => pregacareDB.dietPlans.create(plan as any));

      console.log('🧘 Generating yoga sessions...');
      const yogaSessions = this.generateYogaSessions(80);
      yogaSessions.forEach(session => pregacareDB.yogaSessions.create(session as any));

      console.log('🗣️ Generating therapy sessions...');
      const therapySessions = this.generateTherapySessions(40);
      therapySessions.forEach(session => pregacareDB.therapySessions.create(session as any));

      console.log('🍽️ Generating food orders...');
      const foodOrders = this.generateFoodOrders(120);
      foodOrders.forEach(order => pregacareDB.foodOrders.create(order as any));

      console.log('💬 Generating communications...');
      const communications = this.generateCommunications(200);
      communications.forEach(comm => pregacareDB.communications.create(comm as any));

      console.log('📦 Generating packages...');
      const packages = this.generatePackages();
      packages.forEach(pkg => pregacareDB.packages.create(pkg as any));

      // Set a default current user (patient)
      const firstPatientUser = users.find(u => u.role === 'patient');
      if (firstPatientUser) {
        pregacareDB.users.setCurrentUser(firstPatientUser);
      }

      console.log('✅ Data seeding completed successfully!');
      console.log(`📊 Generated:`);
      console.log(`   - ${users.length} users`);
      console.log(`   - ${patients.length} patients`);
      console.log(`   - ${providers.length} providers`);
      console.log(`   - ${appointments.length} appointments`);
      console.log(`   - ${prescriptions.length} prescriptions`);
      console.log(`   - ${dietPlans.length} diet plans`);
      console.log(`   - ${yogaSessions.length} yoga sessions`);
      console.log(`   - ${therapySessions.length} therapy sessions`);
      console.log(`   - ${foodOrders.length} food orders`);
      console.log(`   - ${communications.length} communications`);
      console.log(`   - ${packages.length} packages`);

    } catch (error) {
      console.error('❌ Error during data seeding:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataSeeder = new PregacareDataSeeder();