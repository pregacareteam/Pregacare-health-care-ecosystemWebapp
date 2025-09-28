# 🤰 Pregacare - Complete Healthcare Ecosystem

A comprehensive pregnancy care management system with **10 healthcare roles**, **automatic provider communication**, and **admin-managed patient assignments**.

## 🌟 Overview

Pregacare is a complete healthcare ecosystem designed for pregnancy care coordination. The system enables seamless communication between healthcare providers treating the same patients through an innovative **automatic communication pipeline**.

### 🎯 Key Innovation: Automatic Provider Communication

Once the admin team assigns providers to patients (e.g., Patient 2 → Doctor 4, Nutritionist 6, Yoga 7), providers can automatically communicate with each other about shared patients **without manual lookup**!

## 🏥 Complete Healthcare Roles (10 Total)

### Primary Medical Care
- **👩‍⚕️ Doctor/Gynecologist** - Medical care, diagnosis, prescriptions, delivery planning
- **🔬 Radiologist** - Ultrasounds, MRIs, scan interpretation, imaging reports  
- **🧪 Lab Technician** - Blood tests, urine analysis, genetic screening, critical alerts

### Specialized Care & Wellness
- **🥗 Nutritionist** - Diet plans, gestational diabetes management, supplement recommendations
- **🧠 Therapist/Psychologist** - Mental health support, postpartum depression, anxiety management
- **🧘‍♀️ Yoga/Physiotherapist** - Prenatal yoga, physical therapy, exercise modifications

### Support Services
- **💊 Pharmacy** - Prescription fulfillment, drug interactions, delivery coordination
- **🍽️ Food/Meal Service** - Meal delivery, diet plan execution, nutritionist-approved menus
- **👥 Community Manager** - Support groups, educational webinars, peer connections
- **⚙️ Admin Team** - Patient-provider assignments, system management, care coordination

## 🚀 Core Features

### 1. Multi-Role Authentication System
- **Unique Provider IDs**: Each role gets sequential IDs (doctor_001, nutritionist_002, etc.)
- **Automatic ID Generation**: System assigns provider IDs on signup
- **Role-First Authentication**: Users select role before signing up
- **Multi-Role Support**: Single user can have multiple healthcare roles

### 2. Admin-Managed Patient Assignments
- **Complete Assignment Control**: Admin assigns providers to patients by service type
- **Workload Monitoring**: Track provider capacity and prevent overload
- **Smart Suggestions**: System recommends optimal provider matches
- **Assignment Analytics**: Comprehensive reporting and statistics

### 3. Automatic Communication Pipeline
- **Context-Aware Messaging**: Providers automatically know who else treats each patient
- **Auto-Routing**: Messages go directly to correct team member without lookup
- **Shared Patient Data**: All relevant information accessible to care team
- **Emergency Alerts**: Critical communications with urgent routing

## 💬 Communication Pipeline Examples

### Scenario: Nutritionist → Doctor Communication
```
Nutritionist 6 treating Patient 2:
1. Clicks "Message Patient's Doctor"
2. System automatically routes to Doctor 4 (Patient 2's assigned doctor)
3. Message includes full patient context and shared data
4. No manual lookup needed!
```

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Context
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Multi-role system with automatic provider ID generation
- **Communication**: Real-time messaging with automatic routing

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/pregacare-healthcare-ecosystem.git
cd pregacare-healthcare-ecosystem

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Open browser to http://localhost:8080
```

### Demo the System
1. **Visit Role Selection**: See all 10 healthcare roles
2. **Access Admin Dashboard**: Click "Admin Dashboard" 
3. **Generate Sample Data**: Create patient-provider assignments
4. **Test Communication**: Go to "Communication Pipeline" tab
5. **Send Messages**: See automatic provider-to-provider routing

## 📋 Project Structure

```
src/
├── components/
│   ├── AdminDashboard.tsx              # Complete admin interface
│   ├── CommunicationPipelineDemo.tsx   # Provider communication demo
│   ├── RoleSelector.tsx                # 10 healthcare roles
│   └── ui/                             # shadcn/ui components
├── lib/
│   ├── patientProviderAssignmentManager.ts  # Assignment system
│   ├── patientCommunicationPipeline.ts     # Communication routing
│   └── providerServiceManager.ts           # Provider management
├── pages/
│   ├── AdminPage.tsx                   # Admin dashboard page
│   ├── RoleAuth.tsx                    # Multi-role authentication
│   └── [Various dashboard pages]
└── hooks/
    ├── useEnhancedAuth.tsx             # Multi-role authentication
    └── [Other custom hooks]
```

## 🔐 Security & Privacy

- **Role-Based Access**: Providers only see their assigned patients
- **Audit Trail**: Complete log of all communications and changes
- **Data Encryption**: All communications encrypted in transit
- **HIPAA Compliance**: Healthcare data protection standards
- **Emergency Access**: Critical situations allow broader access

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🚀 Future Enhancements

- **AI-Powered Matching**: Machine learning for optimal provider assignments
- **Mobile Applications**: Native iOS/Android apps for providers
- **Telemedicine Integration**: Video consultation capabilities
- **IoT Device Integration**: Wearable health monitoring
- **Predictive Analytics**: Risk assessment and early intervention

---

**Built with ❤️ for better pregnancy care coordination**

*Empowering healthcare providers to deliver seamless, coordinated care through intelligent communication and assignment systems.*
