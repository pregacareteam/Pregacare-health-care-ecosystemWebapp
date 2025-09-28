// Core Pregacare Data Models for Local Storage System

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'nutritionist' | 'yoga_trainer' | 'therapist' | 'delivery_partner' | 'admin';
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  pregnancyStage: 'first_trimester' | 'second_trimester' | 'third_trimester' | 'postpartum';
  dueDate?: string;
  riskStatus: 'normal' | 'medium' | 'high';
  medicalHistory: {
    conditions?: string[];
    allergies?: string[];
    medications?: string[];
    surgeries?: string[];
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  assignedProviders: {
    doctorId?: string;
    nutritionistId?: string;
    yogaTrainerId?: string;
    therapistId?: string;
  };
  packageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  providerType: 'doctor' | 'nutritionist' | 'yoga_trainer' | 'therapist' | 'delivery_partner';
  specialization?: string;
  experienceYears?: number;
  certification?: string[];
  bio?: string;
  profilePicture?: string;
  availability: {
    [key: string]: { start: string; end: string }[];
  };
  consultationFee?: number;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor extends Provider {
  licenseNumber: string;
  clinicAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  hospitalAffiliations?: string[];
}

export interface Nutritionist extends Provider {
  dietSpecializations: string[];
  consultationTypes: ('meal_planning' | 'nutrition_counseling' | 'weight_management')[];
}

export interface YogaTrainer extends Provider {
  yogaStyles: string[];
  sessionTypes: ('prenatal' | 'postpartum' | 'gentle' | 'intermediate')[];
  certificationType: string;
}

export interface Therapist extends Provider {
  therapyType: 'clinical_psychologist' | 'counselor' | 'social_worker';
  sessionTypes: ('individual' | 'group' | 'family' | 'couples')[];
  licenseNumber: string;
}

export interface DeliveryPartner extends Provider {
  vehicleType: 'bike' | 'car' | 'electric_vehicle';
  deliveryZone: string[];
  maxDeliveries: number;
  currentLoad: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerType: 'doctor' | 'nutritionist' | 'yoga_trainer' | 'therapist';
  appointmentDate: string;
  duration: number; // minutes
  type: 'video_call' | 'in_person' | 'phone_call' | 'chat';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  title: string;
  description?: string;
  notes?: string;
  consultationFee?: number;
  meetingLink?: string;
  location?: string;
  reminders: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    sideEffects?: string[];
  }[];
  prescribedDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  recordType: 'scan' | 'lab_report' | 'prescription' | 'notes' | 'vitals' | 'ultrasound';
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  content: any;
  tags: string[];
  uploadDate: string;
  isConfidential: boolean;
  createdAt: string;
}

export interface DietPlan {
  id: string;
  patientId: string;
  nutritionistId: string;
  planName: string;
  description?: string;
  duration: number; // days
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: {
    [mealType: string]: {
      name: string;
      ingredients: string[];
      calories: number;
      instructions: string;
      prepTime: number;
    }[];
  };
  restrictions: string[];
  supplements?: string[];
  notes?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface YogaSession {
  id: string;
  patientId: string;
  trainerId: string;
  sessionType: 'prenatal' | 'postpartum' | 'gentle' | 'breathing';
  title: string;
  description?: string;
  duration: number; // minutes
  sessionDate: string;
  mode: 'video' | 'in_person' | 'group';
  poses: {
    name: string;
    duration: number;
    instructions: string;
    modifications?: string;
  }[];
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface TherapySession {
  id: string;
  patientId: string;
  therapistId: string;
  sessionType: 'individual' | 'group' | 'family';
  title: string;
  sessionDate: string;
  duration: number; // minutes
  mode: 'video' | 'in_person' | 'phone';
  topics: string[];
  goals: string[];
  notes?: string;
  homework?: string;
  nextSession?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  progress: {
    mood: number; // 1-10
    anxiety: number; // 1-10
    stress: number; // 1-10
    notes: string;
  };
  createdAt: string;
}

export interface FoodOrder {
  id: string;
  patientId: string;
  deliveryPartnerId?: string;
  dietPlanId?: string;
  orderDate: string;
  deliveryDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: {
    name: string;
    quantity: number;
    calories: number;
    price: number;
    specialInstructions?: string;
  }[];
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
  };
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingInfo?: {
    estimatedTime: string;
    currentLocation: string;
    updates: {
      status: string;
      timestamp: string;
      notes?: string;
    }[];
  };
  payment: {
    method: 'card' | 'cash' | 'insurance';
    amount: number;
    status: 'pending' | 'paid' | 'refunded';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'message' | 'appointment_request' | 'prescription' | 'reminder' | 'alert';
  title: string;
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  isRead: boolean;
  isUrgent: boolean;
  relatedId?: string; // appointment, prescription, etc.
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  features: string[];
  duration: number; // months
  price: {
    monthly: number;
    total: number;
    discountPercentage?: number;
  };
  includes: {
    doctorVisits: number;
    nutritionistSessions: number;
    yogaSessions: number;
    therapySessions: number;
    foodDelivery: boolean;
    emergencySupport: boolean;
  };
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  patientId: string;
  type: 'package' | 'consultation' | 'food_order' | 'medication';
  relatedId: string;
  amount: number;
  currency: string;
  method: 'card' | 'bank_transfer' | 'insurance' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  description: string;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}

export interface Analytics {
  id: string;
  userId: string;
  userRole: string;
  data: {
    // Patient Analytics
    pregnancyProgress?: {
      currentWeek: number;
      totalWeeks: number;
      milestones: string[];
      upcomingAppointments: number;
    };
    
    // Provider Analytics
    patientsCount?: number;
    appointmentsToday?: number;
    monthlyRevenue?: number;
    averageRating?: number;
    
    // System Analytics
    totalUsers?: number;
    activeUsers?: number;
    completedAppointments?: number;
    revenue?: number;
  };
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string;
  createdAt: string;
}

// Utility Types
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchFilters {
  searchTerm?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string;
  type?: string;
  providerId?: string;
  patientId?: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingTasks: number;
  monthlyRevenue: number;
  completionRate: number;
  averageRating: number;
  growthPercentage: number;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  dietReminders: boolean;
  exerciseReminders: boolean;
  emergencyAlerts: boolean;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: {
    shareDataWithProviders: boolean;
    allowMarketing: boolean;
    anonymousAnalytics: boolean;
  };
}