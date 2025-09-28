import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Activity, 
  TestTube, 
  Utensils, 
  Brain, 
  Heart, 
  Pill, 
  Truck,
  Users,
  Settings
} from 'lucide-react';

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  userCount: number;
  onClick: () => void;
  gradient: string;
  features?: string[];
  showProviderIdPreview?: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({ icon, title, description, userCount, onClick, gradient, features, showProviderIdPreview }) => {
  // Generate preview provider ID
  const generatePreviewId = (roleTitle: string) => {
    const roleKey = roleTitle.toLowerCase().replace(/\s+/g, '_').replace('/', '_');
    // Simulate next available number (in real app, this would check existing providers)
    const nextNumber = Math.floor(Math.random() * 5) + 1;
    return `${roleKey}_${nextNumber.toString().padStart(3, '0')}`;
  };

  const previewId = showProviderIdPreview && title !== 'Patient Dashboard' ? generatePreviewId(title) : null;

  return (
  <Card className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-0 ${gradient} group`}>
    <CardContent className="p-6" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
          {icon}
        </div>
        <span className="text-white/80 text-sm font-medium">{userCount} users</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm mb-3">{description}</p>
      {features && features.length > 0 && (
        <div className="space-y-1">
          <p className="text-white/60 text-xs font-medium">Key Features:</p>
          {features.slice(0, 3).map((feature, index) => (
            <div key={index} className="text-white/70 text-xs flex items-center">
              <span className="w-1 h-1 bg-white/50 rounded-full mr-2"></span>
              {feature}
            </div>
          ))}
          {features.length > 3 && (
            <div className="text-white/60 text-xs">
              +{features.length - 3} more features
            </div>
          )}
        </div>
      )}

      {/* Provider ID Preview */}
      {previewId && (
        <div className="mt-4 p-2 bg-white/10 rounded border border-white/20">
          <p className="text-white/60 text-xs mb-1">Your Provider ID will be:</p>
          <p className="text-white font-mono text-sm font-bold">{previewId}</p>
        </div>
      )}
    </CardContent>
  </Card>
);
};

interface RoleSelectorProps {
  onRoleSelect: (role: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'doctor',
      icon: <Stethoscope className="h-8 w-8 text-white" />,
      title: 'Doctor Dashboard',
      description: 'Patient list, medical history, prescriptions, referrals, appointments, chat',
      userCount: 2,
      gradient: 'bg-gradient-to-br from-blue-600 to-blue-800',
      features: ['Patient Management', 'Medical Records', 'Prescriptions', 'Referrals', 'Video Consultations']
    },
    {
      id: 'radiologist',
      icon: <Activity className="h-8 w-8 text-white" />,
      title: 'Radiologist Dashboard',
      description: 'Scan requests, upload reports, structured values, patient notifications',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-purple-600 to-purple-800',
      features: ['Scan Requests', 'Image Upload', 'Report Generation', 'Doctor Notifications']
    },
    {
      id: 'lab_technician',
      icon: <TestTube className="h-8 w-8 text-white" />,
      title: 'Lab Dashboard',
      description: 'Test requests, report upload, critical alerts, structured lab values',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-green-600 to-green-800',
      features: ['Test Processing', 'Report Upload', 'Critical Alerts', 'Doctor Notifications']
    },
    {
      id: 'nutritionist',
      icon: <Utensils className="h-8 w-8 text-white" />,
      title: 'Nutritionist Dashboard',
      description: 'Diet plan creation, lab results review, meal planning, food partner coordination',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-orange-600 to-orange-800',
      features: ['Diet Planning', 'Lab Analysis', 'Food Service Coordination', 'Progress Tracking']
    },
    {
      id: 'therapist',
      icon: <Brain className="h-8 w-8 text-white" />,
      title: 'Therapist / Psychologist Dashboard',
      description: 'Session management, mood tracking, confidential notes, risk assessment',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
      features: ['Session Planning', 'Mood Monitoring', 'Risk Assessment', 'Confidential Notes']
    },
    {
      id: 'yoga_instructor',
      icon: <Heart className="h-8 w-8 text-white" />,
      title: 'Yoga / Physiotherapist Dashboard',
      description: 'Exercise plans, session scheduling, doctor clearance, virtual classes',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-pink-600 to-pink-800',
      features: ['Exercise Planning', 'Session Scheduling', 'Doctor Clearance', 'Virtual Classes']
    },
    {
      id: 'pharmacy',
      icon: <Pill className="h-8 w-8 text-white" />,
      title: 'Pharmacy Dashboard',
      description: 'Prescription inbox, delivery tracking, refill management, patient notifications',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-red-600 to-red-800',
      features: ['Prescription Processing', 'Delivery Tracking', 'Refill Management', 'Patient Notifications']
    },
    {
      id: 'food_service',
      icon: <Truck className="h-8 w-8 text-white" />,
      title: 'Food / Meal Service Dashboard',
      description: 'Diet plan execution, meal delivery scheduling, patient feedback',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-yellow-600 to-yellow-800',
      features: ['Diet Plan Execution', 'Delivery Scheduling', 'Meal Tracking', 'Feedback Management']
    },
    {
      id: 'community_manager',
      icon: <Users className="h-8 w-8 text-white" />,
      title: 'Community / Support Dashboard',
      description: 'Forum management, expert sessions, support groups, webinars',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-cyan-600 to-cyan-800',
      features: ['Forum Management', 'Expert Sessions', 'Support Groups', 'Community Events']
    },
    {
      id: 'patient',
      icon: <Users className="h-8 w-8 text-white" />,
      title: 'Patient Dashboard',
      description: 'Pregnancy tracking, appointments, reports, provider communication, wellness programs',
      userCount: 3,
      gradient: 'bg-gradient-to-br from-teal-600 to-teal-800',
      features: ['Pregnancy Tracking', 'Appointments', 'Medical Records', 'Provider Chat', 'Wellness Programs']
    },
    {
      id: 'admin',
      icon: <Settings className="h-8 w-8 text-white" />,
      title: 'Admin Dashboard',
      description: 'User management, system monitoring, analytics, billing, access control',
      userCount: 1,
      gradient: 'bg-gradient-to-br from-gray-600 to-gray-800',
      features: ['User Management', 'System Analytics', 'Billing Management', 'Access Control', 'System Monitoring']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pregacare Healthcare Ecosystem</h1>
            <p className="text-xl text-gray-600">Complete Pregnancy Care Management System</p>
            <p className="text-sm text-gray-500 mt-2">Select your role to sign in or create an account</p>
          </div>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              icon={role.icon}
              title={role.title}
              description={role.description}
              userCount={role.userCount}
              onClick={() => onRoleSelect(role.id)}
              gradient={role.gradient}
              features={role.features}
              showProviderIdPreview={true}
            />
          ))}
        </div>

        {/* System Overview */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">
                Complete Healthcare Ecosystem
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
                <div>
                  <div className="text-3xl font-bold">24</div>
                  <div className="text-sm opacity-90">Total Patients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10</div>
                  <div className="text-sm opacity-90">Healthcare Providers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">156</div>
                  <div className="text-sm opacity-90">Appointments This Month</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm opacity-90">Patient Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Comprehensive Care</h3>
              <p className="text-gray-600 text-sm">Complete pregnancy journey management from conception to postpartum care</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Provider Network</h3>
              <p className="text-gray-600 text-sm">Integrated ecosystem connecting doctors, specialists, and support services</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600 text-sm">Live health tracking, instant alerts, and continuous care coordination</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;