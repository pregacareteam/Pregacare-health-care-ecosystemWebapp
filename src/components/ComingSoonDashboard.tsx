import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2, Users, Calendar, FileText, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonDashboardProps {
  role: string;
}

const getRoleIcon = (role: string) => {
  const roleIcons: { [key: string]: React.ReactNode } = {
    'Radiologist': <Building2 className="h-12 w-12 text-purple-600" />,
    'Lab Technician': <FileText className="h-12 w-12 text-green-600" />,
    'Nutritionist': <Users className="h-12 w-12 text-orange-600" />,
    'Therapist': <MessageSquare className="h-12 w-12 text-indigo-600" />,
    'Yoga Instructor': <Calendar className="h-12 w-12 text-pink-600" />,
    'Pharmacy': <Building2 className="h-12 w-12 text-red-600" />,
    'Food Service': <Building2 className="h-12 w-12 text-yellow-600" />,
    'Community Manager': <Users className="h-12 w-12 text-cyan-600" />,
    'Patient': <Users className="h-12 w-12 text-teal-600" />,
    'Admin': <Settings className="h-12 w-12 text-gray-600" />
  };
  
  return roleIcons[role] || <Building2 className="h-12 w-12 text-gray-600" />;
};

const getRoleDescription = (role: string) => {
  const descriptions: { [key: string]: string } = {
    'Radiologist': 'Scan upload and management system with structured reporting and doctor notifications',
    'Lab Technician': 'Lab test processing, report upload, critical alerts, and result management',
    'Nutritionist': 'Diet plan creation, meal planning, lab result analysis, and food service coordination',
    'Therapist': 'Session management, mood tracking, confidential notes, and risk assessment tools',
    'Yoga Instructor': 'Exercise planning, session scheduling, doctor clearance tracking, and virtual classes',
    'Pharmacy': 'Prescription processing, delivery tracking, refill management, and patient notifications',
    'Food Service': 'Diet plan execution, meal delivery scheduling, and patient feedback management',
    'Community Manager': 'Forum management, expert sessions, support groups, and community events',
    'Patient': 'Pregnancy tracking, appointment management, medical records, and provider communication',
    'Admin': 'User management, system monitoring, analytics, billing, and access control'
  };
  
  return descriptions[role] || 'Complete dashboard for healthcare management';
};

const getPlannedFeatures = (role: string) => {
  const features: { [key: string]: string[] } = {
    'Radiologist': [
      'Pending scan requests list',
      'Image/PDF upload interface',
      'Structured value entry forms',
      'Doctor notification system',
      'Patient scan history'
    ],
    'Lab Technician': [
      'Test request management',
      'Report upload system',
      'Critical result flagging',
      'Automated notifications',
      'Quality control tracking'
    ],
    'Nutritionist': [
      'Diet plan builder',
      'Lab result integration',
      'Meal scheduling tools',
      'Food service coordination',
      'Progress tracking charts'
    ],
    'Therapist': [
      'Session scheduling',
      'Mood tracking tools',
      'Confidential note system',
      'Risk assessment forms',
      'Progress monitoring'
    ],
    'Yoga Instructor': [
      'Exercise plan creator',
      'Virtual class platform',
      'Doctor clearance tracking',
      'Session scheduling',
      'Progress monitoring'
    ],
    'Pharmacy': [
      'Prescription inbox',
      'Inventory management',
      'Delivery tracking',
      'Refill automation',
      'Patient notifications'
    ],
    'Food Service': [
      'Diet plan viewer',
      'Delivery scheduling',
      'Meal tracking system',
      'Feedback collection',
      'Nutritionist coordination'
    ],
    'Community Manager': [
      'Forum management',
      'Expert session scheduling',
      'Support group creation',
      'Event management',
      'Community analytics'
    ],
    'Patient': [
      'Pregnancy milestone tracking',
      'Appointment booking',
      'Medical record viewer',
      'Provider messaging',
      'Wellness program access'
    ],
    'Admin': [
      'User management console',
      'System analytics dashboard',
      'Billing management',
      'Access control settings',
      'Performance monitoring'
    ]
  };
  
  return features[role] || [];
};

const ComingSoonDashboard: React.FC<ComingSoonDashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const features = getPlannedFeatures(role);

  const handleBackToRoles = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToRoles} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Roles</span>
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Pregacare Healthcare Ecosystem
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            {getRoleIcon(role)}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{role} Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getRoleDescription(role)}
          </p>
        </div>

        {/* Development Status */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
            <p className="text-lg opacity-90 mb-4">
              This dashboard is currently under development as part of the comprehensive Pregacare healthcare ecosystem.
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-medium">🚀 In Development</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-medium">🎯 Database Ready</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="text-sm font-medium">📋 Features Planned</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planned Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Planned Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-600" />
                <span>Development Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Schema</span>
                  <span className="text-sm font-medium text-green-600">✅ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Integration</span>
                  <span className="text-sm font-medium text-green-600">✅ Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">UI Components</span>
                  <span className="text-sm font-medium text-yellow-600">🔄 In Progress</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role-based Access</span>
                  <span className="text-sm font-medium text-green-600">✅ Configured</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Testing & QA</span>
                  <span className="text-sm font-medium text-gray-400">⏳ Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current System Status */}
        <Card>
          <CardHeader>
            <CardTitle>What's Available Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">✅</div>
                <h3 className="font-semibold text-gray-900 mb-2">Doctor Dashboard</h3>
                <p className="text-sm text-gray-600">Fully functional with patient management, appointments, and medical records</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">🗄️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Database System</h3>
                <p className="text-sm text-gray-600">Complete healthcare database with all role relationships configured</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">🔐</div>
                <h3 className="font-semibold text-gray-900 mb-2">Security & Access</h3>
                <p className="text-sm text-gray-600">Row-level security and role-based access control implemented</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-x-4">
          <Button onClick={handleBackToRoles} variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Role Selection
          </Button>
          <Button onClick={() => navigate('/dashboard/doctor')} size="lg">
            Try Doctor Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonDashboard;