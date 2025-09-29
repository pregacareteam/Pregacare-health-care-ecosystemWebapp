import { supabase } from '../integrations/supabase/client';

// Fixed Package Pricing System
export interface HealthcarePackage {
  id: string;
  name: 'basic' | 'medium' | 'comprehensive';
  displayName: string;
  price: number;
  duration: number; // months
  description: string;
  features: string[];
  popular?: boolean;
}

// Fixed Healthcare Packages
export const HEALTHCARE_PACKAGES: HealthcarePackage[] = [
  {
    id: 'pkg_basic',
    name: 'basic',
    displayName: 'Basic Care',
    price: 9999,
    duration: 6,
    description: 'Essential prenatal care for healthy pregnancies',
    features: [
      'Monthly doctor consultations (6 sessions)',
      'Basic nutrition guidance',
      'Pregnancy tracking app access',
      'Educational materials',
      '24/7 helpline support',
      'Basic health monitoring'
    ]
  },
  {
    id: 'pkg_medium',
    name: 'medium',
    displayName: 'Standard Care',
    price: 19999,
    duration: 9,
    description: 'Comprehensive care with additional wellness services',
    features: [
      'Bi-weekly doctor consultations (18 sessions)',
      'Personalized nutrition plans',
      'Weekly yoga sessions (36 sessions)',
      'Mental health counseling (6 sessions)',
      'Lab tests and monitoring',
      'Meal delivery service',
      'Lactation support',
      'Emergency consultations'
    ],
    popular: true
  },
  {
    id: 'pkg_comprehensive',
    name: 'comprehensive',
    displayName: 'Premium Care',
    price: 34999,
    duration: 12,
    description: 'Complete end-to-end pregnancy and postnatal care',
    features: [
      'Weekly doctor consultations (48 sessions)',
      'Dedicated nutritionist (unlimited consultations)',
      'Daily yoga & fitness sessions',
      'Therapy sessions (unlimited)',
      'Complete lab test package',
      'Premium meal delivery',
      'Home nursing support',
      'Postnatal care (3 months)',
      'Baby care guidance',
      'Family planning consultation',
      'VIP hospital coordination'
    ]
  }
];

// Package-based Payment Calculator
export class PackagePaymentCalculator {
  
  // Calculate total cost for selected packages
  static calculatePackageTotal(selectedPackageIds: string[]): {
    packages: HealthcarePackage[];
    subtotal: number;
    discount: number;
    gst: number;
    total: number;
    breakdown: {
      packageId: string;
      name: string;
      price: number;
    }[];
  } {
    const selectedPackages = HEALTHCARE_PACKAGES.filter(pkg => 
      selectedPackageIds.includes(pkg.id)
    );

    const subtotal = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
    
    // Apply discounts based on number of packages
    let discountPercent = 0;
    if (selectedPackages.length >= 2) {
      discountPercent = 10; // 10% discount for 2+ packages
    }
    if (selectedPackages.length >= 3) {
      discountPercent = 15; // 15% discount for all 3 packages
    }

    const discount = Math.round(subtotal * (discountPercent / 100));
    const afterDiscount = subtotal - discount;
    const gst = Math.round(afterDiscount * 0.18); // 18% GST
    const total = afterDiscount + gst;

    const breakdown = selectedPackages.map(pkg => ({
      packageId: pkg.id,
      name: pkg.displayName,
      price: pkg.price
    }));

    return {
      packages: selectedPackages,
      subtotal,
      discount,
      gst,
      total,
      breakdown
    };
  }

  // Get package by ID
  static getPackageById(packageId: string): HealthcarePackage | null {
    return HEALTHCARE_PACKAGES.find(pkg => pkg.id === packageId) || null;
  }

  // Get package recommendations based on patient profile
  static getRecommendedPackages(patientProfile: {
    isFirstPregnancy: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    budget: 'budget' | 'standard' | 'premium';
  }): HealthcarePackage[] {
    if (patientProfile.riskLevel === 'high' || patientProfile.budget === 'premium') {
      return [HEALTHCARE_PACKAGES[2]]; // Comprehensive
    }
    
    if (patientProfile.isFirstPregnancy || patientProfile.budget === 'standard') {
      return [HEALTHCARE_PACKAGES[1]]; // Medium
    }
    
    return [HEALTHCARE_PACKAGES[0]]; // Basic
  }

  // Create package subscription in database
  static async createPackageSubscription(patientId: string, packageIds: string[]): Promise<{
    subscriptionId: string;
    totalAmount: number;
    packages: HealthcarePackage[];
  }> {
    try {
      const calculation = this.calculatePackageTotal(packageIds);
      
      // Create payment record for the package subscription
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          patient_id: patientId,
          package_id: packageIds[0], // Primary package
          amount: calculation.total,
          payment_method: 'pending_selection',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update patient with selected package
      const { error: updateError } = await supabase
        .from('patients_new')
        .update({
          package_id: packageIds[0] // Assign primary package
        })
        .eq('patient_id', patientId);

      if (updateError) throw updateError;

      return {
        subscriptionId: payment.payment_id,
        totalAmount: calculation.total,
        packages: calculation.packages
      };
    } catch (error) {
      console.error('Error creating package subscription:', error);
      throw error;
    }
  }

  // Get patient's active package subscriptions
  static async getPatientSubscriptions(patientId: string) {
    try {
      const { data: patient, error } = await supabase
        .from('patients_new')
        .select(`
          *,
          package:packages!patients_new_package_id_fkey(*)
        `)
        .eq('patient_id', patientId)
        .single();

      if (error) throw error;

      return {
        currentPackage: patient.package,
        subscriptionActive: !!patient.package_id,
        packageStartDate: patient.created_at
      };
    } catch (error) {
      console.error('Error fetching patient subscriptions:', error);
      throw error;
    }
  }
}

// Package Selection Component State Management
export class PackageSelectionManager {
  private selectedPackages: Set<string> = new Set();
  private patientId: string;

  constructor(patientId: string) {
    this.patientId = patientId;
  }

  // Add package to selection
  addPackage(packageId: string): void {
    this.selectedPackages.add(packageId);
  }

  // Remove package from selection
  removePackage(packageId: string): void {
    this.selectedPackages.delete(packageId);
  }

  // Toggle package selection
  togglePackage(packageId: string): void {
    if (this.selectedPackages.has(packageId)) {
      this.removePackage(packageId);
    } else {
      this.addPackage(packageId);
    }
  }

  // Get current selection
  getSelectedPackages(): string[] {
    return Array.from(this.selectedPackages);
  }

  // Calculate current total
  getCurrentTotal() {
    return PackagePaymentCalculator.calculatePackageTotal(this.getSelectedPackages());
  }

  // Clear selection
  clearSelection(): void {
    this.selectedPackages.clear();
  }

  // Proceed to payment
  async proceedToPayment(): Promise<{
    subscriptionId: string;
    totalAmount: number;
    packages: HealthcarePackage[];
  }> {
    if (this.selectedPackages.size === 0) {
      throw new Error('No packages selected');
    }

    return await PackagePaymentCalculator.createPackageSubscription(
      this.patientId,
      this.getSelectedPackages()
    );
  }
}

// Package-based Revenue Analytics
export class PackageRevenueAnalytics {
  
  // Get revenue by package type
  static async getRevenueByPackage(): Promise<{
    packageName: string;
    revenue: number;
    subscriptions: number;
    averageValue: number;
  }[]> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          amount,
          package:packages!payments_package_id_fkey(name)
        `)
        .eq('payment_status', 'completed');

      if (error) throw error;

      const revenueByPackage = HEALTHCARE_PACKAGES.map(pkg => {
        const packagePayments = payments?.filter(p => p.package?.name === pkg.name) || [];
        const revenue = packagePayments.reduce((sum, p) => sum + p.amount, 0);
        const subscriptions = packagePayments.length;
        
        return {
          packageName: pkg.displayName,
          revenue,
          subscriptions,
          averageValue: subscriptions > 0 ? Math.round(revenue / subscriptions) : 0
        };
      });

      return revenueByPackage;
    } catch (error) {
      console.error('Error fetching package revenue:', error);
      throw error;
    }
  }

  // Get total package revenue
  static async getTotalPackageRevenue(): Promise<{
    totalRevenue: number;
    totalSubscriptions: number;
    averagePackageValue: number;
    mostPopularPackage: string;
  }> {
    try {
      const revenueData = await this.getRevenueByPackage();
      
      const totalRevenue = revenueData.reduce((sum, pkg) => sum + pkg.revenue, 0);
      const totalSubscriptions = revenueData.reduce((sum, pkg) => sum + pkg.subscriptions, 0);
      const averagePackageValue = totalSubscriptions > 0 ? Math.round(totalRevenue / totalSubscriptions) : 0;
      
      const mostPopular = revenueData.reduce((prev, current) => 
        current.subscriptions > prev.subscriptions ? current : prev
      );

      return {
        totalRevenue,
        totalSubscriptions,
        averagePackageValue,
        mostPopularPackage: mostPopular.packageName
      };
    } catch (error) {
      console.error('Error calculating total package revenue:', error);
      throw error;
    }
  }

  // Get monthly package revenue trends
  static async getMonthlyPackageRevenue(): Promise<{
    month: string;
    basicRevenue: number;
    mediumRevenue: number;
    comprehensiveRevenue: number;
    totalRevenue: number;
  }[]> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          amount,
          created_at,
          package:packages!payments_package_id_fkey(name)
        `)
        .eq('payment_status', 'completed')
        .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const monthlyData: { [key: string]: any } = {};

      payments?.forEach(payment => {
        const month = new Date(payment.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            basicRevenue: 0,
            mediumRevenue: 0,
            comprehensiveRevenue: 0,
            totalRevenue: 0
          };
        }
        
        const packageType = payment.package?.name;
        if (packageType === 'basic') {
          monthlyData[month].basicRevenue += payment.amount;
        } else if (packageType === 'medium') {
          monthlyData[month].mediumRevenue += payment.amount;
        } else if (packageType === 'comprehensive') {
          monthlyData[month].comprehensiveRevenue += payment.amount;
        }
        
        monthlyData[month].totalRevenue += payment.amount;
      });

      return Object.values(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly package revenue:', error);
      throw error;
    }
  }
}