// Production Data Seeder for Pregacare System - PRODUCTION READY (NO FAKE DATA)
import { Package } from '../types/pregacare';
import { pregacareDB } from './storage';

/**
 * PRODUCTION DATA SEEDER
 * ======================
 * 
 * This file has been cleaned for production use.
 * All fake/sample data generation has been removed.
 * 
 * Only essential system configuration data is seeded:
 * - Subscription packages (business offerings)
 * - System configurations
 * 
 * NO FAKE USERS, PATIENTS, PROVIDERS, OR OTHER DATA IS GENERATED.
 * Users must register through the normal authentication flow.
 */

export class PregacareDataSeeder {
  /**
   * Generate essential subscription packages for the platform
   * These are legitimate business offerings, not fake data
   */
  generatePackages(): Package[] {
    const packages: Package[] = [
      {
        id: 'package_essential',
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
          monthly: 1999,
          total: 17991,
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
        id: 'package_comprehensive',
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
          monthly: 4999,
          total: 44991,
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
        id: 'package_premium',
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
          monthly: 9999,
          total: 119991,
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

  /**
   * Clear all user-generated data (keeping only system configuration)
   */
  clearAllUserData(): void {
    console.log('🧹 Clearing all user-generated data...');
    pregacareDB.clearAllData();
    console.log('✅ All user data cleared - database ready for fresh accounts');
  }

  /**
   * Seed only essential system data (no fake users or sample data)
   */
  async seedEssentialData(): Promise<void> {
    console.log('🌱 Seeding essential system data (PRODUCTION MODE)...');

    try {
      // Clear any existing data first
      this.clearAllUserData();

      // Generate and save only legitimate business packages
      console.log('📦 Setting up subscription packages...');
      const packages = this.generatePackages();
      packages.forEach(pkg => pregacareDB.packages.create(pkg as any));

      console.log('✅ Essential data seeding completed successfully!');
      console.log(`📊 System ready with:`);
      console.log(`   - ${packages.length} subscription packages`);
      console.log(`   - Clean database ready for real user accounts`);
      console.log('');
      console.log('🚀 System is now ready for production use!');
      console.log('   Users can now register and create their own accounts.');

    } catch (error) {
      console.error('❌ Error during essential data seeding:', error);
      throw error;
    }
  }

  /**
   * DEPRECATED: This method has been disabled for production use
   * Use seedEssentialData() instead
   */
  async seedAllData(): Promise<void> {
    console.warn('⚠️  seedAllData() is deprecated for production use');
    console.warn('   Using seedEssentialData() instead...');
    await this.seedEssentialData();
  }
}

// Export singleton instance
export const dataSeeder = new PregacareDataSeeder();