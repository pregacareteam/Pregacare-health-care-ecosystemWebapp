// Test script for local storage system
import { pregacareDB } from './storage';
import { dataSeeder } from './dataSeeder';

// Test function to validate the system
export async function testPregacareSystem() {
  console.log('🧪 Starting Pregacare System Tests...');
  
  try {
    // Clear any existing data
    pregacareDB.clearAllData();
    console.log('✅ Cleared existing data');
    
    // Test basic CRUD operations
    console.log('🔧 Testing basic CRUD operations...');
    
    // Create a user
    const testUser = pregacareDB.users.create({
      email: 'test@example.com',
      name: 'Test User',
      role: 'patient',
      isActive: true
    });
    console.log('✅ Created user:', testUser.name);
    
    // Read the user
    const foundUser = pregacareDB.users.getById(testUser.id);
    console.log('✅ Found user:', foundUser?.name);
    
    // Update the user
    const updatedUser = pregacareDB.users.update(testUser.id, { name: 'Updated Test User' });
    console.log('✅ Updated user:', updatedUser?.name);
    
    // Create a patient profile for the user
    const testPatient = pregacareDB.patients.create({
      userId: testUser.id,
      name: testUser.name,
      email: testUser.email,
      pregnancyStage: 'second_trimester',
      riskStatus: 'normal',
      medicalHistory: {
        conditions: [],
        allergies: [],
        medications: [],
        surgeries: []
      },
      assignedProviders: {}
    });
    console.log('✅ Created patient profile:', testPatient.name);
    
    // Test search functionality
    const searchResults = pregacareDB.users.search('test', ['name', 'email']);
    console.log('✅ Search results:', searchResults.length);
    
    // Test pagination
    const paginatedUsers = pregacareDB.users.getPaginated(1, 5);
    console.log('✅ Paginated users:', paginatedUsers.data.length);
    
    // Delete the test data
    const deletedUser = pregacareDB.users.delete(testUser.id);
    const deletedPatient = pregacareDB.patients.delete(testPatient.id);
    console.log('✅ Deleted user:', deletedUser);
    console.log('✅ Deleted patient:', deletedPatient);
    
    console.log('🎉 Basic tests completed successfully!');
    
    // Test data seeding
    console.log('🌱 Testing data seeding...');
    await dataSeeder.seedAllData();
    
    // Verify seeded data
    const users = pregacareDB.users.getAll();
    const patients = pregacareDB.patients.getAll();
    const providers = pregacareDB.providers.getAll();
    const appointments = pregacareDB.appointments.getAll();
    
    console.log('📊 Seeded Data Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Providers: ${providers.length}`);
    console.log(`   - Appointments: ${appointments.length}`);
    
    // Test relationships
    const patientUsers = users.filter(u => u.role === 'patient');
    const firstPatientUser = patientUsers[0];
    if (firstPatientUser) {
      const patientProfile = pregacareDB.patients.findByUserId(firstPatientUser.id);
      const patientAppointments = patientProfile ? pregacareDB.appointments.findByPatient(patientProfile.id) : [];
      console.log(`✅ Patient ${firstPatientUser.name} has ${patientAppointments.length} appointments`);
    }
    
    // Test provider data
    const doctors = pregacareDB.providers.findByType('doctor');
    const nutritionists = pregacareDB.providers.findByType('nutritionist');
    console.log(`✅ Found ${doctors.length} doctors and ${nutritionists.length} nutritionists`);
    
    // Test appointments by date
    const todayAppointments = pregacareDB.appointments.findTodayAppointments();
    const upcomingAppointments = pregacareDB.appointments.findUpcoming(5);
    console.log(`✅ Today's appointments: ${todayAppointments.length}`);
    console.log(`✅ Upcoming appointments: ${upcomingAppointments.length}`);
    
    console.log('🎉 All tests completed successfully!');
    console.log('💾 Data is now ready for use in the application');
    
    return {
      success: true,
      stats: {
        users: users.length,
        patients: patients.length,
        providers: providers.length,
        appointments: appointments.length
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in components
export { pregacareDB, dataSeeder };