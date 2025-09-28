// Enhanced Provider ID Management System

export interface ProviderServiceProfile {
  id: string; // Unique service provider ID (e.g., "doctor_001", "nutritionist_001")
  userId: string; // Links to the main user account
  roleType: string; // Role this provider ID represents
  displayName: string; // Professional display name for this role
  serviceTitle: string; // e.g., "Dr. Smith - Prenatal Specialist", "Smith Nutritionist - Pregnancy Diet Expert"
  
  // Role-specific professional details
  licenseNumber?: string;
  specialization?: string;
  certification?: string[];
  experienceYears?: number;
  consultationFee?: number;
  
  // Service availability and settings
  availability: {
    [day: string]: { start: string; end: string; isAvailable: boolean }[];
  };
  maxPatientsPerDay?: number;
  consultationDuration?: number; // minutes
  
  // Professional verification
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationDocuments?: {
    license?: string;
    certification?: string[];
    insurance?: string;
  };
  
  // Service-specific metrics
  rating?: number;
  totalConsultations?: number;
  totalPatients?: number;
  joinDate: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderIdGenerator {
  generateProviderId(roleType: string, existingProviders: ProviderServiceProfile[]): string;
  getUserProviderIds(userId: string): { [roleType: string]: string };
  getProviderProfile(providerId: string): ProviderServiceProfile | null;
}

// Provider ID Management System
export class ProviderServiceManager {
  private static STORAGE_KEY = 'pregacare_provider_services';
  
  static getProviderServices(): ProviderServiceProfile[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  static saveProviderServices(providers: ProviderServiceProfile[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(providers));
  }
  
  // Generate unique provider ID for each role
  static generateProviderId(roleType: string): string {
    const providers = this.getProviderServices();
    const roleProviders = providers.filter(p => p.roleType === roleType);
    
    // Find the next available number
    const existingNumbers = roleProviders
      .map(p => {
        const match = p.id.match(new RegExp(`${roleType}_(\\d+)`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${roleType}_${nextNumber.toString().padStart(3, '0')}`;
  }
  
  // Create provider service profile for a role
  static createProviderService(
    userId: string, 
    roleType: string, 
    userData: {
      displayName: string;
      specialization?: string;
      licenseNumber?: string;
      consultationFee?: number;
    }
  ): ProviderServiceProfile {
    const providers = this.getProviderServices();
    const providerId = this.generateProviderId(roleType);
    
    const roleDisplayNames = {
      doctor: 'Dr.',
      radiologist: 'Dr.',
      lab_technician: 'Lab Tech',
      nutritionist: 'Nutritionist',
      therapist: 'Therapist', 
      yoga_instructor: 'Yoga Instructor',
      pharmacy: 'Pharmacist',
      food_service: 'Food Service',
      community_manager: 'Community Manager',
      admin: 'Administrator'
    };
    
    const displayPrefix = roleDisplayNames[roleType as keyof typeof roleDisplayNames] || '';
    
    const newProvider: ProviderServiceProfile = {
      id: providerId,
      userId,
      roleType,
      displayName: `${displayPrefix} ${userData.displayName}`.trim(),
      serviceTitle: `${userData.displayName} - ${userData.specialization || roleType}`,
      licenseNumber: userData.licenseNumber,
      specialization: userData.specialization,
      consultationFee: userData.consultationFee || 0,
      availability: this.getDefaultAvailability(),
      verificationStatus: 'pending',
      rating: 0,
      totalConsultations: 0,
      totalPatients: 0,
      joinDate: new Date().toISOString(),
      isActive: false, // Inactive until approved
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    providers.push(newProvider);
    this.saveProviderServices(providers);
    
    return newProvider;
  }
  
  // Get all provider service profiles for a user
  static getUserProviderProfiles(userId: string): ProviderServiceProfile[] {
    const providers = this.getProviderServices();
    return providers.filter(p => p.userId === userId);
  }
  
  // Get specific provider profile by provider ID
  static getProviderProfile(providerId: string): ProviderServiceProfile | null {
    const providers = this.getProviderServices();
    return providers.find(p => p.id === providerId) || null;
  }
  
  // Get all providers (for admin dashboard)
  static getAllProviders(): (ProviderServiceProfile & { providerName: string })[] {
    const providers = this.getProviderServices();
    return providers.map(provider => ({
      ...provider,
      providerName: provider.displayName,
      providerId: provider.id,
      serviceType: provider.roleType
    }));
  }
  
  // Get provider ID for user's specific role
  static getUserProviderIdForRole(userId: string, roleType: string): string | null {
    const providers = this.getProviderServices();
    const provider = providers.find(p => p.userId === userId && p.roleType === roleType);
    return provider ? provider.id : null;
  }
  
  // Update provider service profile
  static updateProviderService(providerId: string, updates: Partial<ProviderServiceProfile>): boolean {
    const providers = this.getProviderServices();
    const index = providers.findIndex(p => p.id === providerId);
    
    if (index === -1) return false;
    
    providers[index] = {
      ...providers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveProviderServices(providers);
    return true;
  }
  
  // Approve provider service
  static approveProviderService(providerId: string, approvedBy: string): boolean {
    return this.updateProviderService(providerId, {
      verificationStatus: 'verified',
      isActive: true
    });
  }
  
  // Get default availability template
  private static getDefaultAvailability() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const availability: { [day: string]: { start: string; end: string; isAvailable: boolean }[] } = {};
    
    days.forEach(day => {
      if (['saturday', 'sunday'].includes(day)) {
        availability[day] = [{ start: '09:00', end: '13:00', isAvailable: false }];
      } else {
        availability[day] = [
          { start: '09:00', end: '12:00', isAvailable: true },
          { start: '14:00', end: '17:00', isAvailable: true }
        ];
      }
    });
    
    return availability;
  }
  
  // Search providers by specialty, location, etc.
  static searchProviders(criteria: {
    roleType?: string;
    specialization?: string;
    isActive?: boolean;
    minRating?: number;
  }): ProviderServiceProfile[] {
    const providers = this.getProviderServices();
    
    return providers.filter(provider => {
      if (criteria.roleType && provider.roleType !== criteria.roleType) return false;
      if (criteria.specialization && !provider.specialization?.toLowerCase().includes(criteria.specialization.toLowerCase())) return false;
      if (criteria.isActive !== undefined && provider.isActive !== criteria.isActive) return false;
      if (criteria.minRating && (provider.rating || 0) < criteria.minRating) return false;
      
      return true;
    });
  }
}

// Enhanced appointment booking with provider service IDs
export interface ServiceAppointment {
  id: string;
  patientId: string;
  providerId: string; // Uses unique provider service ID (e.g., "doctor_001")
  providerUserId: string; // Links to the actual user account
  serviceType: string; // Role type for this appointment
  appointmentDate: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  notes?: string;
  
  // Service-specific appointment data
  serviceDetails: {
    consultationType: 'initial' | 'follow_up' | 'emergency';
    symptoms?: string[];
    diagnosis?: string;
    prescription?: string;
    nextAppointment?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// Enhanced communication system with provider service routing
export interface ServiceCommunication {
  id: string;
  senderId: string;
  senderType: 'patient' | 'provider';
  senderProviderId?: string; // If sender is provider, their service ID
  receiverId: string;
  receiverType: 'patient' | 'provider';  
  receiverProviderId?: string; // If receiver is provider, their service ID
  
  messageType: 'consultation' | 'appointment' | 'prescription' | 'report' | 'general';
  subject: string;
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  
  // Service context
  serviceContext: {
    appointmentId?: string;
    prescriptionId?: string;
    reportId?: string;
  };
  
  isRead: boolean;
  isUrgent: boolean;
  createdAt: string;
}

export default ProviderServiceManager;