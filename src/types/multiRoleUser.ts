// Enhanced User System with Multi-Role Support

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePicture?: string;
  roles: UserRole[]; // Multiple roles per user
  primaryRole: UserRole; // Default role for login
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  role: 'patient' | 'doctor' | 'radiologist' | 'lab_technician' | 'nutritionist' | 'therapist' | 'yoga_instructor' | 'pharmacy' | 'food_service' | 'community_manager' | 'admin';
  isActive: boolean;
  addedAt: string;
  approvedBy?: string; // For provider roles requiring approval
  approvalStatus: 'pending' | 'approved' | 'rejected';
  specialization?: string;
  licenseNumber?: string;
  certifications?: string[];
}

export interface UserSession {
  userId: string;
  currentRole: UserRole['role'];
  sessionId: string;
  loginTime: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
}

// Enhanced Patient Profile (linked to User)
export interface Patient {
  id: string;
  userId: string; // Links to User.id
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
    yogaInstructorId?: string;
    therapistId?: string;
  };
  packageId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Provider Profile (linked to User)
export interface Provider {
  id: string;
  userId: string; // Links to User.id
  providerType: 'doctor' | 'radiologist' | 'lab_technician' | 'nutritionist' | 'therapist' | 'yoga_instructor' | 'pharmacy' | 'food_service' | 'community_manager';
  specialization?: string;
  experienceYears?: number;
  certification?: string[];
  licenseNumber?: string;
  bio?: string;
  availability: {
    [key: string]: { start: string; end: string }[];
  };
  consultationFee?: number;
  rating?: number;
  totalReviews?: number;
  clinicInfo?: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments?: {
    license?: string;
    certification?: string[];
    insurance?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Role switching and management interfaces
export interface RoleSwitchRequest {
  userId: string;
  fromRole: UserRole['role'];
  toRole: UserRole['role'];
  reason?: string;
  requestedAt: string;
}

export interface UserRoleHistory {
  userId: string;
  role: UserRole['role'];
  action: 'added' | 'removed' | 'activated' | 'deactivated';
  performedBy: string;
  reason?: string;
  timestamp: string;
}