// Patient Communication Pipeline System

export interface PatientCareTeam {
  patientId: string;
  patientName: string;
  careTeam: {
    [serviceType: string]: {
      providerId: string;
      providerName: string;
      providerUserId: string;
      isActive: boolean;
    };
  };
  communicationChannels: {
    patientToTeam: string; // Group chat ID for patient with all providers
    teamOnly: string; // Private provider-only discussion
    emergencyAlert: string; // Critical communication channel
  };
  sharedData: {
    medicalRecords: string[];
    labReports: string[];
    prescriptions: string[];
    treatmentPlans: string[];
    progressNotes: string[];
  };
}

export interface AutomaticCommunication {
  id: string;
  patientId: string;
  fromProviderId: string;
  fromProviderType: string;
  toProviderId?: string; // If specific provider, otherwise all team
  toProviderType?: string;
  messageType: 'consultation_request' | 'lab_review' | 'prescription_update' | 'progress_note' | 'emergency_alert';
  subject: string;
  content: string;
  relatedData?: {
    labReportId?: string;
    prescriptionId?: string;
    appointmentId?: string;
    mediaFiles?: string[];
  };
  isUrgent: boolean;
  requiresResponse: boolean;
  createdAt: string;
  responses: {
    providerId: string;
    providerType: string;
    response: string;
    timestamp: string;
  }[];
}

// Patient Communication Pipeline Manager
export class PatientCommunicationPipeline {
  private static CARE_TEAMS_KEY = 'pregacare_care_teams';
  private static COMMUNICATIONS_KEY = 'pregacare_communications';
  
  // Get patient's complete care team
  static getPatientCareTeam(patientId: string): PatientCareTeam | null {
    const careTeams = this.getCareTeams();
    return careTeams.find(team => team.patientId === patientId) || null;
  }
  
  private static getCareTeams(): PatientCareTeam[] {
    const stored = localStorage.getItem(this.CARE_TEAMS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  private static saveCareTeams(teams: PatientCareTeam[]): void {
    localStorage.setItem(this.CARE_TEAMS_KEY, JSON.stringify(teams));
  }
  
  // Create care team from admin assignments
  static createCareTeamFromAssignments(patientId: string, patientName: string): PatientCareTeam {
    const PatientProviderAssignmentManager = require('./patientProviderAssignmentManager').default;
    const assignment = PatientProviderAssignmentManager.getPatientAssignment(patientId);
    
    if (!assignment) {
      throw new Error('No assignments found for patient');
    }
    
    const careTeam: PatientCareTeam['careTeam'] = {};
    
    // Build care team from assignments
    Object.entries(assignment.assignments).forEach(([serviceType, assignmentData]) => {
      if (assignmentData.status === 'active') {
        careTeam[serviceType] = {
          providerId: assignmentData.providerId,
          providerName: assignmentData.providerName,
          providerUserId: `user_${assignmentData.providerId}`, // Would be actual user ID
          isActive: true
        };
      }
    });
    
    const newCareTeam: PatientCareTeam = {
      patientId,
      patientName,
      careTeam,
      communicationChannels: {
        patientToTeam: `patient_team_${patientId}`,
        teamOnly: `team_only_${patientId}`,
        emergencyAlert: `emergency_${patientId}`
      },
      sharedData: {
        medicalRecords: [],
        labReports: [],
        prescriptions: [],
        treatmentPlans: [],
        progressNotes: []
      }
    };
    
    const teams = this.getCareTeams();
    const existingIndex = teams.findIndex(t => t.patientId === patientId);
    
    if (existingIndex >= 0) {
      teams[existingIndex] = newCareTeam;
    } else {
      teams.push(newCareTeam);
    }
    
    this.saveCareTeams(teams);
    return newCareTeam;
  }
  
  // AUTOMATIC COMMUNICATION: When nutritionist wants to talk to doctor about patient
  static sendCommunicationToTeamMember(
    patientId: string,
    fromProviderId: string,
    toProviderType: string, // 'doctor', 'therapist', etc.
    messageType: string,
    subject: string,
    content: string,
    relatedData?: any,
    isUrgent: boolean = false
  ): { success: boolean; targetProvider?: string; error?: string } {
    
    const careTeam = this.getPatientCareTeam(patientId);
    if (!careTeam) {
      return { success: false, error: 'No care team found for patient' };
    }
    
    // AUTOMATICALLY FIND THE TARGET PROVIDER
    const targetProvider = careTeam.careTeam[toProviderType];
    if (!targetProvider) {
      return { success: false, error: `No ${toProviderType} assigned to this patient` };
    }
    
    // Create automatic communication
    const communication: AutomaticCommunication = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      fromProviderId,
      fromProviderType: this.getProviderTypeFromId(fromProviderId),
      toProviderId: targetProvider.providerId,
      toProviderType,
      messageType: messageType as any,
      subject,
      content,
      relatedData,
      isUrgent,
      requiresResponse: ['consultation_request', 'emergency_alert'].includes(messageType),
      createdAt: new Date().toISOString(),
      responses: []
    };
    
    this.saveCommunication(communication);
    
    // If urgent, trigger notification to target provider
    if (isUrgent) {
      this.triggerUrgentNotification(targetProvider.providerId, communication);
    }
    
    return { 
      success: true, 
      targetProvider: `${targetProvider.providerName} (${targetProvider.providerId})` 
    };
  }
  
  // Get provider type from provider ID
  private static getProviderTypeFromId(providerId: string): string {
    return providerId.split('_')[0]; // 'doctor_001' -> 'doctor'
  }
  
  // Save communication
  private static saveCommunication(communication: AutomaticCommunication): void {
    const communications = this.getCommunications();
    communications.push(communication);
    localStorage.setItem(this.COMMUNICATIONS_KEY, JSON.stringify(communications));
  }
  
  // Get all communications
  private static getCommunications(): AutomaticCommunication[] {
    const stored = localStorage.getItem(this.COMMUNICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  // Get communications for a specific provider
  static getProviderCommunications(providerId: string): AutomaticCommunication[] {
    const communications = this.getCommunications();
    return communications.filter(comm => 
      comm.toProviderId === providerId || comm.fromProviderId === providerId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Get all communications about a specific patient (for provider viewing)
  static getPatientCommunications(patientId: string, forProviderId: string): AutomaticCommunication[] {
    const communications = this.getCommunications();
    const careTeam = this.getPatientCareTeam(patientId);
    
    if (!careTeam) return [];
    
    // Check if the provider is part of the care team
    const isTeamMember = Object.values(careTeam.careTeam).some(
      member => member.providerId === forProviderId
    );
    
    if (!isTeamMember) return []; // Only team members can see patient communications
    
    return communications
      .filter(comm => comm.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Automatic data sharing when provider updates patient info
  static sharePatientData(
    patientId: string,
    fromProviderId: string,
    dataType: 'lab_report' | 'prescription' | 'treatment_plan' | 'progress_note',
    dataId: string,
    notifyTeam: boolean = true
  ): { success: boolean; notifiedProviders: string[] } {
    
    const careTeam = this.getPatientCareTeam(patientId);
    if (!careTeam) {
      return { success: false, notifiedProviders: [] };
    }
    
    // Add to shared data
    switch (dataType) {
      case 'lab_report':
        careTeam.sharedData.labReports.push(dataId);
        break;
      case 'prescription':
        careTeam.sharedData.prescriptions.push(dataId);
        break;
      case 'treatment_plan':
        careTeam.sharedData.treatmentPlans.push(dataId);
        break;
      case 'progress_note':
        careTeam.sharedData.progressNotes.push(dataId);
        break;
    }
    
    // Update care team
    const teams = this.getCareTeams();
    const teamIndex = teams.findIndex(t => t.patientId === patientId);
    if (teamIndex >= 0) {
      teams[teamIndex] = careTeam;
      this.saveCareTeams(teams);
    }
    
    const notifiedProviders: string[] = [];
    
    if (notifyTeam) {
      // Notify all other team members about new data
      Object.entries(careTeam.careTeam).forEach(([serviceType, provider]) => {
        if (provider.providerId !== fromProviderId && provider.isActive) {
          const notification = this.sendCommunicationToTeamMember(
            patientId,
            fromProviderId,
            serviceType,
            'data_update',
            `New ${dataType.replace('_', ' ')} available`,
            `A new ${dataType.replace('_', ' ')} has been added for ${careTeam.patientName}. Please review when convenient.`,
            { dataType, dataId },
            dataType === 'lab_report' && fromProviderId.includes('lab') // Urgent if lab report
          );
          
          if (notification.success && notification.targetProvider) {
            notifiedProviders.push(notification.targetProvider);
          }
        }
      });
    }
    
    return { success: true, notifiedProviders };
  }
  
  // Get team members for a patient (excluding the requesting provider)
  static getPatientTeamMembers(patientId: string, excludeProviderId?: string): {
    serviceType: string;
    providerId: string;
    providerName: string;
    canContact: boolean;
  }[] {
    
    const careTeam = this.getPatientCareTeam(patientId);
    if (!careTeam) return [];
    
    return Object.entries(careTeam.careTeam)
      .filter(([_, provider]) => 
        provider.isActive && 
        (!excludeProviderId || provider.providerId !== excludeProviderId)
      )
      .map(([serviceType, provider]) => ({
        serviceType,
        providerId: provider.providerId,
        providerName: provider.providerName,
        canContact: true
      }));
  }
  
  // Trigger urgent notification (would integrate with real notification system)
  private static triggerUrgentNotification(providerId: string, communication: AutomaticCommunication): void {
    console.log(`🚨 URGENT: ${providerId} has a critical message about patient ${communication.patientId}`);
    // In real app: push notification, SMS, email, etc.
  }
  
  // Quick communication templates
  static getQuickMessages() {
    return {
      nutritionist_to_doctor: [
        'Patient labs review needed for diet adjustment',
        'Requesting medication interaction check',
        'Patient reports concerning symptoms',
        'Diet plan approval needed'
      ],
      doctor_to_nutritionist: [
        'New lab results available',
        'Medication changes affecting diet',
        'Patient dietary restrictions updated',
        'Weight management priority'
      ],
      therapist_to_doctor: [
        'Mental health concerns affecting treatment',
        'Medication side effects reported',
        'Patient compliance issues',
        'Risk assessment update needed'
      ],
      yoga_to_doctor: [
        'Exercise clearance needed',
        'Patient reports pain during exercise',
        'Mobility limitations noted',
        'Physical therapy recommendation'
      ]
    };
  }
  
  // Respond to communication
  static respondToCommunication(
    communicationId: string,
    providerId: string,
    response: string
  ): { success: boolean; error?: string } {
    
    const communications = this.getCommunications();
    const commIndex = communications.findIndex(c => c.id === communicationId);
    
    if (commIndex === -1) {
      return { success: false, error: 'Communication not found' };
    }
    
    const communication = communications[commIndex];
    
    // Add response
    communication.responses.push({
      providerId,
      providerType: this.getProviderTypeFromId(providerId),
      response,
      timestamp: new Date().toISOString()
    });
    
    communications[commIndex] = communication;
    localStorage.setItem(this.COMMUNICATIONS_KEY, JSON.stringify(communications));
    
    return { success: true };
  }
}

export default PatientCommunicationPipeline;