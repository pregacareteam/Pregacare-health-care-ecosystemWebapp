# Patient-Provider Assignment System

## Overview

The **Admin Team** is responsible for managing patient-provider assignments in the Pregacare healthcare ecosystem. This ensures proper care coordination and prevents conflicts or gaps in patient care.

## Example Assignment Scenario

**Patient 1 (Sarah Johnson)** needs comprehensive pregnancy care:
- **Gynecologist**: Assigned to `doctor_002` (Dr. Smith - Prenatal Specialist)
- **Nutritionist**: Assigned to `nutritionist_003` (Maria Rodriguez - Pregnancy Diet Expert)
- **Therapist**: Assigned to `therapist_001` (Dr. Johnson - Prenatal Mental Health)
- **Yoga Instructor**: Assigned to `yoga_instructor_002` (Lisa Chen - Prenatal Yoga)

## Admin Dashboard Features

### 1. Patient Assignment Management
- **View All Assignments**: See complete patient-provider mappings
- **Search & Filter**: Find patients by name, ID, or provider
- **Assignment Status**: Track active, inactive, and pending assignments
- **Assignment History**: Full audit trail of all changes

### 2. New Assignment Creation
- **Patient Selection**: Choose from registered patients
- **Service Type Selection**: Doctor, Nutritionist, Therapist, Yoga Instructor
- **Provider Selection**: View available providers for each service
- **Assignment Notes**: Add context and reasoning for assignments

### 3. Provider Workload Management
- **Provider Availability**: See current patient loads per provider
- **Capacity Monitoring**: Prevent provider overload
- **Specialization Matching**: Match patients to appropriate specialists
- **Rating & Performance**: Consider provider ratings in assignments

### 4. Smart Assignment Suggestions
- **Automatic Recommendations**: System suggests optimal provider matches
- **Load Balancing**: Distribute patients evenly across providers
- **Specialization Matching**: Consider patient needs and provider expertise
- **Geographic Considerations**: Factor in location for in-person services

## Assignment Rules & Criteria

### Provider Selection Criteria
1. **Availability**: Provider has capacity for new patients
2. **Specialization**: Provider expertise matches patient needs
3. **Rating**: Minimum rating threshold (4.0+ stars)
4. **Experience**: Years of practice in specialty area
5. **Location**: Geographic proximity for in-person consultations
6. **Language**: Language preferences match patient requirements

### Assignment Workflow
1. **Patient Registration**: Patient creates account and completes profile
2. **Admin Review**: Admin team reviews patient information
3. **Provider Assignment**: Admin selects appropriate providers for each service
4. **Provider Notification**: Providers receive new patient assignment
5. **Patient Notification**: Patient informed of their care team
6. **First Appointment**: Scheduled within 48-72 hours

## Admin Controls & Features

### Assignment Operations
```typescript
// Create new assignment
PatientProviderAssignmentManager.assignProviderToPatient(
  'patient_001',           // Patient ID
  'Sarah Johnson',         // Patient Name
  'doctor',               // Service Type
  'doctor_002',           // Provider ID
  'Dr. Smith',            // Provider Name
  'admin_001',            // Admin ID making assignment
  'Assigned based on high-risk pregnancy specialization'
);

// Remove/Change assignment
PatientProviderAssignmentManager.removeProviderAssignment(
  'patient_001',          // Patient ID
  'doctor',              // Service Type
  'admin_001',           // Admin ID
  'Provider requested transfer due to schedule conflict'
);

// Get provider workload
const workload = PatientProviderAssignmentManager.getProviderWorkload('doctor_002');
// Returns: { totalPatients: 15, serviceTypes: ['doctor'], averageRating: 4.8 }
```

### Bulk Operations
```typescript
// Bulk assign multiple patients
const assignments = [
  { patientId: 'patient_001', serviceType: 'doctor', providerId: 'doctor_002' },
  { patientId: 'patient_001', serviceType: 'nutritionist', providerId: 'nutritionist_003' },
  { patientId: 'patient_002', serviceType: 'doctor', providerId: 'doctor_001' }
];

const result = PatientProviderAssignmentManager.bulkAssignPatients(assignments, 'admin_001');
// Returns: { success: 2, failed: 1, errors: ['Provider not available'] }
```

## Assignment Analytics & Reporting

### Dashboard Statistics
- **Total Patients**: Number of patients in system
- **Active Providers**: Number of active healthcare providers
- **Assignments by Service**: Breakdown of assignments per service type
- **Unassigned Patients**: Patients without complete care teams
- **Overloaded Providers**: Providers exceeding recommended patient loads

### Assignment Report
```typescript
const report = PatientProviderAssignmentManager.generateAssignmentReport();

// Returns:
{
  totalPatients: 25,
  totalProviders: 12,
  assignmentsByService: {
    doctor: 20,
    nutritionist: 18,
    therapist: 15,
    yoga_instructor: 12
  },
  unassignedPatients: 5,
  overloadedProviders: ['doctor_001', 'nutritionist_002'],
  recentAssignments: [...] // Last 10 assignments
}
```

## Provider Management Integration

### Provider Service IDs
Each provider has unique service IDs:
- `doctor_001`, `doctor_002`, `doctor_003` (Gynecologists)
- `nutritionist_001`, `nutritionist_002`, `nutritionist_003` (Nutritionists)
- `therapist_001`, `therapist_002` (Therapists)
- `yoga_instructor_001`, `yoga_instructor_002` (Yoga Instructors)

### Provider Profiles
```typescript
// Get provider details
const provider = ProviderServiceManager.getProviderProfile('doctor_002');

// Returns:
{
  id: 'doctor_002',
  displayName: 'Dr. Smith',
  specialization: 'High Risk Pregnancy',
  rating: 4.8,
  totalPatients: 15,
  maxPatients: 25,
  isAcceptingPatients: true,
  verificationStatus: 'verified'
}
```

## Quality Assurance & Monitoring

### Assignment Validation
- **Provider Capacity**: Prevent overassignment beyond provider limits
- **Specialization Match**: Ensure provider expertise aligns with patient needs
- **Duplicate Prevention**: Prevent multiple providers of same type per patient
- **Status Tracking**: Monitor assignment status and completion

### Audit Trail
- **Assignment History**: Complete log of all assignment changes
- **Admin Actions**: Track which admin made each assignment
- **Timestamp Records**: When assignments were created/modified
- **Reason Codes**: Documentation of assignment rationale

## Integration Points

### 1. Patient Dashboard Integration
```typescript
// Patient sees their assigned providers
const patientAssignment = PatientProviderAssignmentManager.getPatientAssignment('patient_001');

// Patient can:
// - View assigned providers
// - See contact information
// - Schedule appointments
// - Send messages
// - View provider ratings
```

### 2. Provider Dashboard Integration
```typescript
// Provider sees their assigned patients
const providerPatients = PatientProviderAssignmentManager.getProviderPatients('doctor_002');

// Provider can:
// - View patient list
// - Access patient records
// - Manage appointments
// - Communicate with patients
// - Update treatment plans
```

### 3. Appointment System Integration
```typescript
// Appointments use provider service IDs
const appointment = {
  patientId: 'patient_001',
  providerId: 'doctor_002',        // Uses unique provider service ID
  providerUserId: 'user_456',      // Links to actual user account
  serviceType: 'doctor',
  appointmentDate: '2025-01-15T10:00:00Z',
  consultationFee: 150
};
```

## Access Control & Security

### Admin Permissions
- **Full Assignment Control**: Create, modify, delete assignments
- **Provider Management**: Activate/deactivate providers
- **Patient Overview**: Access to all patient information
- **System Analytics**: View comprehensive reports and statistics
- **Audit Access**: Review all system activities and changes

### Role-Based Access
- **Super Admin**: Full system access and configuration
- **Assignment Manager**: Patient-provider assignment management
- **Provider Admin**: Provider verification and management
- **Support Admin**: Patient support and basic assignments

## Future Enhancements

### Automated Assignment
- **AI-Powered Matching**: Machine learning for optimal provider suggestions
- **Preference Learning**: System learns from successful assignments
- **Predictive Analytics**: Anticipate patient needs and provider availability

### Advanced Features
- **Geographic Optimization**: GPS-based provider matching
- **Language Processing**: Natural language patient preference analysis
- **Integration APIs**: Connect with external healthcare systems
- **Mobile Admin App**: On-the-go assignment management

## Getting Started

1. **Access Admin Dashboard**: Navigate to `/dashboard/admin`
2. **Generate Sample Data**: Click "Generate Sample Data" to populate test assignments
3. **Review Assignments**: Browse existing patient-provider mappings
4. **Create New Assignment**: Use the "New Assignment" tab
5. **Monitor Analytics**: Check the "Analytics" tab for system overview

The admin team has complete control over patient care coordination, ensuring each patient receives appropriate, well-matched healthcare services from qualified providers.