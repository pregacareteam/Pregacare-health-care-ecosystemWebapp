import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleCard } from "@/components/RoleCard";
import { User, UserRole } from "@/types/roles";
import { Stethoscope, Apple, Dumbbell, Brain, Truck, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

interface LoginProps {
  onLogin: (user: User) => void;
}

const roleConfigs = {
  doctor: {
    title: "Doctor",
    description: "Manage patient consultations and medical records",
    icon: Stethoscope,
    features: [
      "Patient management dashboard",
      "Video consultations",
      "Medical documentation",
      "Appointment scheduling",
      "Prescription management"
    ]
  },
  nutritionist: {
    title: "Nutritionist",
    description: "Create diet plans and monitor nutrition progress",
    icon: Apple,
    features: [
      "Diet plan builder",
      "Client progress tracking",
      "Meal template library",
      "Nutrition consultations",
      "Recipe management"
    ]
  },
  yoga: {
    title: "Yoga/Fitness Expert",
    description: "Conduct wellness sessions and fitness programs",
    icon: Dumbbell,
    features: [
      "Session scheduling",
      "Live video classes",
      "Resource sharing",
      "Attendance tracking",
      "Wellness programs"
    ]
  },
  therapist: {
    title: "Therapist",
    description: "Provide mental health and emotional wellness support",
    icon: Brain,
    features: [
      "Secure therapy sessions",
      "Progress tracking",
      "Confidential notes",
      "Journal review",
      "Emotional wellness"
    ]
  },
  food_partner: {
    title: "Food Delivery Partner",
    description: "Manage food delivery orders and logistics",
    icon: Truck,
    features: [
      "Order management",
      "Delivery tracking",
      "GPS navigation",
      "Customer feedback",
      "Earnings dashboard"
    ]
  },
  patient: {
    title: "Patient",
    description: "Track your pregnancy journey and manage healthcare",
    icon: Brain,
    features: [
      "Appointment booking",
      "Medical records access",
      "Prescription tracking",
      "Provider communication",
      "Pregnancy monitoring"
    ]
  }
};

export function Login({ onLogin }: LoginProps) {
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleRoleSelection = (role: UserRole, name: string, id: string) => {
    const user: User = {
      id,
      name,
      email: role === 'patient' ? 'sarah.johnson@email.com' : `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      role,
      isAuthenticated: true
    };
    onLogin(user);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep('credentials');
    }
  };

  const handleLogin = () => {
    if (credentials.email && credentials.password && selectedRole) {
      // Generate proper UUID based on role for testing
      const roleToUuid = {
        'patient': '550e8400-e29b-41d4-a716-446655440000',
        'doctor': '550e8400-e29b-41d4-a716-446655440001',
        'nutritionist': '550e8400-e29b-41d4-a716-446655440002',
        'yoga': '550e8400-e29b-41d4-a716-446655440003',
        'therapist': '550e8400-e29b-41d4-a716-446655440004',
        'food_partner': '550e8400-e29b-41d4-a716-446655440005',
      };
      
      const user: User = {
        id: roleToUuid[selectedRole] || '550e8400-e29b-41d4-a716-446655440000',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: selectedRole,
        isAuthenticated: true
      };
      onLogin(user);
    }
  };

  if (step === 'credentials') {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              {selectedRole && (() => {
                const IconComponent = roleConfigs[selectedRole].icon;
                return <IconComponent className="w-8 h-8 text-primary-foreground" />;
              })()}
            </div>
            <CardTitle className="text-2xl">Welcome {roleConfigs[selectedRole!].title}</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleLogin} 
                className="w-full" 
                size="lg"
                variant="hero"
                disabled={!credentials.email || !credentials.password}
              >
                Sign In
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep('role')} 
                className="w-full"
              >
                Change Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Healthcare professionals" 
            className="w-full h-full object-cover mix-blend-overlay opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Pregacare Provider
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
            Empowering healthcare professionals with comprehensive care solutions
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-primary-foreground">
            <span className="w-2 h-2 bg-wellness rounded-full animate-pulse"></span>
            Choose your role to get started
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Select Your Professional Role
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Choose the role that best describes your healthcare expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(roleConfigs).map(([role, config]) => (
            <RoleCard
              key={role}
              title={config.title}
              description={config.description}
              icon={config.icon}
              features={config.features}
              selected={selectedRole === role}
              onSelect={() => handleRoleSelect(role as UserRole)}
            />
          ))}
        </div>

        {/* Quick Demo Access */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-primary-foreground">🚀 Quick Demo Access</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Click any role below to instantly access the platform with sample data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="text-left justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => handleRoleSelection('patient', 'Sarah Johnson', '550e8400-e29b-41d4-a716-446655440000')}
                >
                  <div>
                    <div className="font-medium text-primary-foreground">👶 Patient Dashboard</div>
                    <div className="text-sm text-primary-foreground/70">Sarah Johnson - Second Trimester</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => handleRoleSelection('doctor', 'Dr. Emily Rodriguez', '550e8400-e29b-41d4-a716-446655440001')}
                >
                  <div>
                    <div className="font-medium text-primary-foreground">🩺 Doctor Dashboard</div>
                    <div className="text-sm text-primary-foreground/70">Dr. Emily Rodriguez - OB/GYN</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => handleRoleSelection('nutritionist', 'Lisa Chen', '550e8400-e29b-41d4-a716-446655440002')}
                >
                  <div>
                    <div className="font-medium text-primary-foreground">🥗 Nutritionist Dashboard</div>
                    <div className="text-sm text-primary-foreground/70">Lisa Chen - Prenatal Nutrition</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => handleRoleSelection('therapist', 'Dr. Michael Thompson', '550e8400-e29b-41d4-a716-446655440004')}
                >
                  <div>
                    <div className="font-medium text-primary-foreground">🧠 Therapist Dashboard</div>
                    <div className="text-sm text-primary-foreground/70">Dr. Michael Thompson</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => handleRoleSelection('yoga', 'Maya Patel', '550e8400-e29b-41d4-a716-446655440003')}
                >
                  <div>
                    <div className="font-medium text-primary-foreground">🧘‍♀️ Yoga Dashboard</div>
                    <div className="text-sm text-primary-foreground/70">Maya Patel - Prenatal Yoga</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-left justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => handleRoleSelection('food_partner', 'David Wilson', '550e8400-e29b-41d4-a716-446655440005')}
                >
                  <div>
                    <div className="font-medium text-primary-foreground">🚚 Delivery Dashboard</div>
                    <div className="text-sm text-primary-foreground/70">David Wilson - Food Delivery</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedRole && (
          <div className="text-center">
            <Button 
              onClick={handleContinue} 
              size="lg" 
              variant="hero"
              className="px-8"
            >
              Continue as {roleConfigs[selectedRole].title}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}