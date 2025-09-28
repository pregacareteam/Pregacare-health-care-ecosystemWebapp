// Patient-Provider Assignment Management System

export interface PatientAssignment {
  id: string;
  patientId: string;
  patientName: string;
  assignments: {
    [serviceType: string]: {
      providerId: string;
      providerName: string;
      assignedAt: string;
      assignedBy: string; // Admin who made the assignment
      status: 'active' | 'inactive' | 'pending';
      notes?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

export interface ProviderAvailability {
  providerId: string;
  providerName: string;
  serviceType: string;
  currentPatients: number;
  maxPatients: number;
  specializations: string[];
  rating: number;
  isAcceptingPatients: boolean;
  location?: string;
}

export interface AssignmentRule {
  id: string;
  name: string;
  serviceType: string;
  criteria: {
    maxPatientsPerProvider?: number;
    preferredSpecialization?: string[];
    locationBased?: boolean;
    ratingThreshold?: number;
    experienceRequired?: number;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

// Patient-Provider Assignment Manager
export class PatientProviderAssignmentManager {
  private static ASSIGNMENTS_KEY = 'pregacare_patient_assignments';
  private static RULES_KEY = 'pregacare_assignment_rules';
  
  // Get all patient assignments
  static getPatientAssignments(): PatientAssignment[] {
    const stored = localStorage.getItem(this.ASSIGNMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  // Save patient assignments
  static savePatientAssignments(assignments: PatientAssignment[]): void {
    localStorage.setItem(this.ASSIGNMENTS_KEY, JSON.stringify(assignments));
  }
  
  // Get assignment for specific patient
  static getPatientAssignment(patientId: string): PatientAssignment | null {
    const assignments = this.getPatientAssignments();
    return assignments.find(a => a.patientId === patientId) || null;
  }
  
  // Create or update patient assignment
  static assignProviderToPatient(
    patientId: string,
    patientName: string,
    serviceType: string,
    providerId: string,
    providerName: string,
    adminId: string,
    notes?: string
  ): { success: boolean; error?: string } {
    try {
      const assignments = this.getPatientAssignments();
      let existingAssignment = assignments.find(a => a.patientId === patientId);
      
      if (!existingAssignment) {
        // Create new patient assignment record
        existingAssignment = {
          id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          patientId,
          patientName,
          assignments: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastModifiedBy: adminId
        };
        assignments.push(existingAssignment);
      }
      
      // Add or update service assignment
      existingAssignment.assignments[serviceType] = {
        providerId,
        providerName,
        assignedAt: new Date().toISOString(),
        assignedBy: adminId,
        status: 'active',
        notes
      };
      
      existingAssignment.updatedAt = new Date().toISOString();
      existingAssignment.lastModifiedBy = adminId;
      
      this.savePatientAssignments(assignments);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to assign provider' };
    }
  }
  
  // Remove provider assignment
  static removeProviderAssignment(
    patientId: string,
    serviceType: string,
    adminId: string,
    reason?: string
  ): { success: boolean; error?: string } {
    try {
      const assignments = this.getPatientAssignments();
      const assignment = assignments.find(a => a.patientId === patientId);
      
      if (!assignment || !assignment.assignments[serviceType]) {
        return { success: false, error: 'Assignment not found' };
      }
      
      // Mark as inactive instead of deleting (for audit trail)
      assignment.assignments[serviceType].status = 'inactive';
      assignment.assignments[serviceType].notes = reason || 'Removed by admin';
      assignment.updatedAt = new Date().toISOString();
      assignment.lastModifiedBy = adminId;
      
      this.savePatientAssignments(assignments);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to remove assignment' };
    }
  }
  
  // Get all patients assigned to a provider
  static getProviderPatients(providerId: string): {
    patientId: string;
    patientName: string;
    serviceType: string;
    assignedAt: string;
    status: string;
  }[] {
    const assignments = this.getPatientAssignments();
    const providerPatients: any[] = [];
    
    assignments.forEach(assignment => {
      Object.entries(assignment.assignments).forEach(([serviceType, assignmentData]) => {
        if (assignmentData.providerId === providerId && assignmentData.status === 'active') {
          providerPatients.push({
            patientId: assignment.patientId,
            patientName: assignment.patientName,
            serviceType,
            assignedAt: assignmentData.assignedAt,
            status: assignmentData.status
          });
        }
      });
    });
    
    return providerPatients;
  }
  
  // Get provider workload statistics
  static getProviderWorkload(providerId: string): {
    totalPatients: number;
    serviceTypes: string[];
    averageRating?: number;
    monthlyConsultations?: number;
  } {
    const patients = this.getProviderPatients(providerId);
    const serviceTypes = [...new Set(patients.map(p => p.serviceType))];
    
    return {
      totalPatients: patients.length,
      serviceTypes,
      averageRating: 4.5, // Would come from actual ratings
      monthlyConsultations: patients.length * 4 // Estimated
    };
  }
  
  // Suggest optimal provider for patient based on rules
  static suggestProviderForPatient(
    patientId: string,
    serviceType: string,
    patientPreferences?: {
      preferredGender?: 'male' | 'female';
      preferredSpecialization?: string;
      maxDistance?: number;
      languagePreference?: string;
    }
  ): {
    recommendedProvider?: string;
    alternativeProviders: string[];
    reasoning: string;
  } {
    // Import provider service manager to get available providers
    const availableProviders = this.getAvailableProviders(serviceType);
    
    // Apply assignment rules and patient preferences
    const scored = availableProviders.map(provider => ({
      ...provider,
      score: this.calculateProviderScore(provider, patientPreferences)
    })).sort((a, b) => b.score - a.score);
    
    return {
      recommendedProvider: scored[0]?.providerId,
      alternativeProviders: scored.slice(1, 4).map(p => p.providerId),
      reasoning: this.generateRecommendationReason(scored[0], serviceType)
    };
  }
  
  private static getAvailableProviders(serviceType: string): ProviderAvailability[] {
    // This would integrate with ProviderServiceManager
    // For now, return mock data
    return [
      {
        providerId: `${serviceType}_001`,
        providerName: `Dr. Smith - ${serviceType}`,
        serviceType,
        currentPatients: 15,
        maxPatients: 25,
        specializations: ['General', 'Pregnancy Care'],
        rating: 4.8,
        isAcceptingPatients: true
      },
      {
        providerId: `${serviceType}_002`,
        providerName: `Dr. Johnson - ${serviceType}`,
        serviceType,
        currentPatients: 20,
        maxPatients: 30,
        specializations: ['High Risk', 'Prenatal'],
        rating: 4.9,
        isAcceptingPatients: true
      }
    ];
  }
  
  private static calculateProviderScore(
    provider: ProviderAvailability,
    preferences?: any
  ): number {
    let score = 0;
    
    // Availability score (higher is better)
    const availabilityRatio = (provider.maxPatients - provider.currentPatients) / provider.maxPatients;
    score += availabilityRatio * 30;
    
    // Rating score
    score += (provider.rating / 5) * 40;
    
    // Specialization match
    if (preferences?.preferredSpecialization) {
      const hasSpecialization = provider.specializations.some(s => 
        s.toLowerCase().includes(preferences.preferredSpecialization.toLowerCase())
      );
      if (hasSpecialization) score += 20;
    }
    
    // Accepting patients
    if (provider.isAcceptingPatients) score += 10;
    
    return score;
  }
  
  private static generateRecommendationReason(
    provider: ProviderAvailability,
    serviceType: string
  ): string {
    if (!provider) return 'No suitable providers available';
    
    const reasons = [];
    
    if (provider.rating >= 4.8) reasons.push('Excellent rating');
    if (provider.currentPatients < provider.maxPatients * 0.8) reasons.push('Good availability');
    if (provider.specializations.length > 1) reasons.push('Multiple specializations');
    
    return `Recommended based on: ${reasons.join(', ')}`;
  }
  
  // Bulk assignment operations for admin efficiency
  static bulkAssignPatients(assignments: {
    patientId: string;
    serviceType: string;
    providerId: string;
  }[], adminId: string): { success: number; failed: number; errors: string[] } {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    
    assignments.forEach(assignment => {
      const result = this.assignProviderToPatient(
        assignment.patientId,
        `Patient ${assignment.patientId}`, // Would get actual name
        assignment.serviceType,
        assignment.providerId,
        `Provider ${assignment.providerId}`, // Would get actual name
        adminId
      );
      
      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(result.error || 'Unknown error');
      }
    });
    
    return { success, failed, errors };
  }
  
  // Generate assignment report for admin dashboard
  static generateAssignmentReport(): {
    totalPatients: number;
    totalProviders: number;
    assignmentsByService: { [serviceType: string]: number };
    unassignedPatients: number;
    overloadedProviders: string[];
    recentAssignments: any[];
  } {
    const assignments = this.getPatientAssignments();
    const serviceTypes = ['doctor', 'nutritionist', 'therapist', 'yoga_instructor'];
    const assignmentsByService: { [key: string]: number } = {};
    
    serviceTypes.forEach(service => {
      assignmentsByService[service] = 0;
    });
    
    assignments.forEach(assignment => {
      Object.entries(assignment.assignments).forEach(([serviceType, data]) => {
        if (data.status === 'active') {
          assignmentsByService[serviceType] = (assignmentsByService[serviceType] || 0) + 1;
        }
      });
    });
    
    return {
      totalPatients: assignments.length,
      totalProviders: 15, // Would calculate from actual providers
      assignmentsByService,
      unassignedPatients: assignments.filter(a => Object.keys(a.assignments).length === 0).length,
      overloadedProviders: ['doctor_001', 'nutritionist_002'], // Would calculate based on workload
      recentAssignments: assignments
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
    };
  }
}

export default PatientProviderAssignmentManager;