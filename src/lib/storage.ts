// Local Storage Data Layer for Pregacare System
import { 
  User, Patient, Provider, Appointment, Prescription, MedicalRecord,
  DietPlan, YogaSession, TherapySession, FoodOrder, Communication,
  Package, Payment, Analytics, PaginatedResult, SearchFilters
} from '../types/pregacare';

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'pregacare_users',
  PATIENTS: 'pregacare_patients',
  PROVIDERS: 'pregacare_providers',
  APPOINTMENTS: 'pregacare_appointments',
  PRESCRIPTIONS: 'pregacare_prescriptions',
  MEDICAL_RECORDS: 'pregacare_medical_records',
  DIET_PLANS: 'pregacare_diet_plans',
  YOGA_SESSIONS: 'pregacare_yoga_sessions',
  THERAPY_SESSIONS: 'pregacare_therapy_sessions',
  FOOD_ORDERS: 'pregacare_food_orders',
  COMMUNICATIONS: 'pregacare_communications',
  PACKAGES: 'pregacare_packages',
  PAYMENTS: 'pregacare_payments',
  ANALYTICS: 'pregacare_analytics',
  CURRENT_USER: 'pregacare_current_user',
  SETTINGS: 'pregacare_settings'
} as const;

// Utility Functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// Generic Local Storage Operations
class LocalStorageManager<T extends { id: string; createdAt?: string; updatedAt?: string }> {
  constructor(private storageKey: string) {}

  // Get all items
  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from ${this.storageKey}:`, error);
      return [];
    }
  }

  // Get item by ID
  getById(id: string): T | null {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  // Get items with filtering
  getFiltered(filterFn: (item: T) => boolean): T[] {
    return this.getAll().filter(filterFn);
  }

  // Get paginated results
  getPaginated(page: number = 1, pageSize: number = 10, filterFn?: (item: T) => boolean): PaginatedResult<T> {
    let items = this.getAll();
    
    if (filterFn) {
      items = items.filter(filterFn);
    }

    const total = items.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = items.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      pageSize,
      hasMore: endIndex < total
    };
  }

  // Create new item
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const newItem = {
      ...item,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    } as T;

    const items = this.getAll();
    items.push(newItem);
    this.saveAll(items);
    
    return newItem;
  }

  // Update existing item
  update(id: string, updates: Partial<T>): T | null {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: getCurrentTimestamp()
    };

    items[index] = updatedItem;
    this.saveAll(items);
    
    return updatedItem;
  }

  // Delete item
  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // Item not found
    }

    this.saveAll(filteredItems);
    return true;
  }

  // Save all items
  private saveAll(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving to ${this.storageKey}:`, error);
      throw new Error(`Failed to save data to ${this.storageKey}`);
    }
  }

  // Clear all items
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Search items
  search(searchTerm: string, searchFields: (keyof T)[]): T[] {
    const items = this.getAll();
    const lowerSearchTerm = searchTerm.toLowerCase();

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return value && 
               typeof value === 'string' && 
               value.toLowerCase().includes(lowerSearchTerm);
      });
    });
  }
}

// Data Access Layer - Individual Managers
export class UserManager extends LocalStorageManager<User> {
  constructor() {
    super(STORAGE_KEYS.USERS);
  }

  findByEmail(email: string): User | null {
    const users = this.getAll();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findByRole(role: User['role']): User[] {
    return this.getFiltered(user => user.role === role);
  }

  getCurrentUser(): User | null {
    try {
      const currentUserData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return currentUserData ? JSON.parse(currentUserData) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
}

export class PatientManager extends LocalStorageManager<Patient> {
  constructor() {
    super(STORAGE_KEYS.PATIENTS);
  }

  findByUserId(userId: string): Patient | null {
    const patients = this.getAll();
    return patients.find(patient => patient.userId === userId) || null;
  }

  findByProvider(providerId: string): Patient[] {
    return this.getFiltered(patient => 
      Object.values(patient.assignedProviders).includes(providerId)
    );
  }

  findByRiskStatus(riskStatus: Patient['riskStatus']): Patient[] {
    return this.getFiltered(patient => patient.riskStatus === riskStatus);
  }

  findByPregnancyStage(stage: Patient['pregnancyStage']): Patient[] {
    return this.getFiltered(patient => patient.pregnancyStage === stage);
  }
}

export class ProviderManager extends LocalStorageManager<Provider> {
  constructor() {
    super(STORAGE_KEYS.PROVIDERS);
  }

  findByType(providerType: Provider['providerType']): Provider[] {
    return this.getFiltered(provider => provider.providerType === providerType);
  }

  findByUserId(userId: string): Provider | null {
    const providers = this.getAll();
    return providers.find(provider => provider.userId === userId) || null;
  }

  findActive(): Provider[] {
    return this.getFiltered(provider => provider.isActive);
  }

  findBySpecialization(specialization: string): Provider[] {
    return this.getFiltered(provider => 
      provider.specialization?.toLowerCase().includes(specialization.toLowerCase()) || false
    );
  }
}

export class AppointmentManager extends LocalStorageManager<Appointment> {
  constructor() {
    super(STORAGE_KEYS.APPOINTMENTS);
  }

  findByPatient(patientId: string): Appointment[] {
    return this.getFiltered(appointment => appointment.patientId === patientId);
  }

  findByProvider(providerId: string): Appointment[] {
    return this.getFiltered(appointment => appointment.providerId === providerId);
  }

  findByStatus(status: Appointment['status']): Appointment[] {
    return this.getFiltered(appointment => appointment.status === status);
  }

  findByDateRange(startDate: string, endDate: string): Appointment[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.getFiltered(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= start && appointmentDate <= end;
    });
  }

  findTodayAppointments(): Appointment[] {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.findByDateRange(todayStart.toISOString(), todayEnd.toISOString());
  }

  findUpcoming(limit?: number): Appointment[] {
    const now = new Date().toISOString();
    const upcoming = this.getFiltered(appointment => 
      appointment.appointmentDate > now && 
      ['scheduled', 'confirmed'].includes(appointment.status)
    ).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

    return limit ? upcoming.slice(0, limit) : upcoming;
  }
}

export class PrescriptionManager extends LocalStorageManager<Prescription> {
  constructor() {
    super(STORAGE_KEYS.PRESCRIPTIONS);
  }

  findByPatient(patientId: string): Prescription[] {
    return this.getFiltered(prescription => prescription.patientId === patientId);
  }

  findByDoctor(doctorId: string): Prescription[] {
    return this.getFiltered(prescription => prescription.doctorId === doctorId);
  }

  findActive(): Prescription[] {
    return this.getFiltered(prescription => prescription.isActive);
  }

  findByAppointment(appointmentId: string): Prescription[] {
    return this.getFiltered(prescription => prescription.appointmentId === appointmentId);
  }
}

export class MedicalRecordManager extends LocalStorageManager<MedicalRecord> {
  constructor() {
    super(STORAGE_KEYS.MEDICAL_RECORDS);
  }

  findByPatient(patientId: string): MedicalRecord[] {
    return this.getFiltered(record => record.patientId === patientId);
  }

  findByProvider(providerId: string): MedicalRecord[] {
    return this.getFiltered(record => record.providerId === providerId);
  }

  findByType(recordType: MedicalRecord['recordType']): MedicalRecord[] {
    return this.getFiltered(record => record.recordType === recordType);
  }

  findByTags(tags: string[]): MedicalRecord[] {
    return this.getFiltered(record => 
      tags.some(tag => record.tags.includes(tag))
    );
  }
}

export class DietPlanManager extends LocalStorageManager<DietPlan> {
  constructor() {
    super(STORAGE_KEYS.DIET_PLANS);
  }

  findByPatient(patientId: string): DietPlan[] {
    return this.getFiltered(plan => plan.patientId === patientId);
  }

  findByNutritionist(nutritionistId: string): DietPlan[] {
    return this.getFiltered(plan => plan.nutritionistId === nutritionistId);
  }

  findActive(): DietPlan[] {
    return this.getFiltered(plan => plan.isActive);
  }
}

export class YogaSessionManager extends LocalStorageManager<YogaSession> {
  constructor() {
    super(STORAGE_KEYS.YOGA_SESSIONS);
  }

  findByPatient(patientId: string): YogaSession[] {
    return this.getFiltered(session => session.patientId === patientId);
  }

  findByTrainer(trainerId: string): YogaSession[] {
    return this.getFiltered(session => session.trainerId === trainerId);
  }

  findByStatus(status: YogaSession['status']): YogaSession[] {
    return this.getFiltered(session => session.status === status);
  }
}

export class TherapySessionManager extends LocalStorageManager<TherapySession> {
  constructor() {
    super(STORAGE_KEYS.THERAPY_SESSIONS);
  }

  findByPatient(patientId: string): TherapySession[] {
    return this.getFiltered(session => session.patientId === patientId);
  }

  findByTherapist(therapistId: string): TherapySession[] {
    return this.getFiltered(session => session.therapistId === therapistId);
  }

  findByStatus(status: TherapySession['status']): TherapySession[] {
    return this.getFiltered(session => session.status === status);
  }
}

export class FoodOrderManager extends LocalStorageManager<FoodOrder> {
  constructor() {
    super(STORAGE_KEYS.FOOD_ORDERS);
  }

  findByPatient(patientId: string): FoodOrder[] {
    return this.getFiltered(order => order.patientId === patientId);
  }

  findByDeliveryPartner(deliveryPartnerId: string): FoodOrder[] {
    return this.getFiltered(order => order.deliveryPartnerId === deliveryPartnerId);
  }

  findByStatus(status: FoodOrder['status']): FoodOrder[] {
    return this.getFiltered(order => order.status === status);
  }

  findActiveOrders(): FoodOrder[] {
    return this.getFiltered(order => 
      !['delivered', 'cancelled'].includes(order.status)
    );
  }
}

export class CommunicationManager extends LocalStorageManager<Communication> {
  constructor() {
    super(STORAGE_KEYS.COMMUNICATIONS);
  }

  findBySender(senderId: string): Communication[] {
    return this.getFiltered(comm => comm.senderId === senderId);
  }

  findByReceiver(receiverId: string): Communication[] {
    return this.getFiltered(comm => comm.receiverId === receiverId);
  }

  findConversation(userId1: string, userId2: string): Communication[] {
    return this.getFiltered(comm => 
      (comm.senderId === userId1 && comm.receiverId === userId2) ||
      (comm.senderId === userId2 && comm.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  findUnread(receiverId: string): Communication[] {
    return this.getFiltered(comm => 
      comm.receiverId === receiverId && !comm.isRead
    );
  }

  markAsRead(communicationIds: string[]): void {
    communicationIds.forEach(id => {
      this.update(id, { isRead: true });
    });
  }
}

export class PackageManager extends LocalStorageManager<Package> {
  constructor() {
    super(STORAGE_KEYS.PACKAGES);
  }

  findActive(): Package[] {
    return this.getFiltered(pkg => pkg.isActive);
  }

  findPopular(): Package[] {
    return this.getFiltered(pkg => pkg.isPopular && pkg.isActive);
  }
}

export class PaymentManager extends LocalStorageManager<Payment> {
  constructor() {
    super(STORAGE_KEYS.PAYMENTS);
  }

  findByPatient(patientId: string): Payment[] {
    return this.getFiltered(payment => payment.patientId === patientId);
  }

  findByStatus(status: Payment['status']): Payment[] {
    return this.getFiltered(payment => payment.status === status);
  }

  findByType(type: Payment['type']): Payment[] {
    return this.getFiltered(payment => payment.type === type);
  }

  findPending(): Payment[] {
    return this.getFiltered(payment => payment.status === 'pending');
  }
}

export class AnalyticsManager extends LocalStorageManager<Analytics> {
  constructor() {
    super(STORAGE_KEYS.ANALYTICS);
  }

  findByUser(userId: string): Analytics[] {
    return this.getFiltered(analytics => analytics.userId === userId);
  }

  findByPeriod(period: Analytics['period']): Analytics[] {
    return this.getFiltered(analytics => analytics.period === period);
  }

  findByDateRange(startDate: string, endDate: string): Analytics[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.getFiltered(analytics => {
      const analyticsDate = new Date(analytics.date);
      return analyticsDate >= start && analyticsDate <= end;
    });
  }
}

// Main Data Service - Unified interface for all data operations
export class PregacareDataService {
  public users = new UserManager();
  public patients = new PatientManager();
  public providers = new ProviderManager();
  public appointments = new AppointmentManager();
  public prescriptions = new PrescriptionManager();
  public medicalRecords = new MedicalRecordManager();
  public dietPlans = new DietPlanManager();
  public yogaSessions = new YogaSessionManager();
  public therapySessions = new TherapySessionManager();
  public foodOrders = new FoodOrderManager();
  public communications = new CommunicationManager();
  public packages = new PackageManager();
  public payments = new PaymentManager();
  public analytics = new AnalyticsManager();

  // Authentication Methods
  async login(email: string, password: string): Promise<User | null> {
    // In a real app, you'd validate the password
    const user = this.users.findByEmail(email);
    if (user && user.isActive) {
      this.users.setCurrentUser(user);
      return user;
    }
    return null;
  }

  async logout(): Promise<void> {
    this.users.setCurrentUser(null);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.users.getCurrentUser();
  }

  // Data Initialization
  initializeData(): void {
    // This method can be used to set up initial data structure
    console.log('Pregacare Data Service Initialized');
  }

  // Backup and Restore
  exportData(): string {
    const allData = Object.values(STORAGE_KEYS).reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>);

    return JSON.stringify(allData, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData) as Record<string, string | null>;
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid data format');
    }
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const pregacareDB = new PregacareDataService();