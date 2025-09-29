import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, TestTube, Utensils, Brain, Heart, Pill, Truck, Users, Activity, Settings, ArrowLeft } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const roleConfigs = {
  doctor: {
    title: "Doctor",
    description: "Manage patient consultations and medical records",
    icon: Stethoscope,
    color: "from-blue-600 to-blue-800"
  },
  radiologist: {
    title: "Radiologist",
    description: "Scan analysis and imaging reports",
    icon: Activity,
    color: "from-purple-600 to-purple-800"
  },
  lab_technician: {
    title: "Lab Technician",
    description: "Laboratory tests and results management",
    icon: TestTube,
    color: "from-green-600 to-green-800"
  },
  nutritionist: {
    title: "Nutritionist",
    description: "Diet planning and nutrition guidance",
    icon: Utensils,
    color: "from-orange-600 to-orange-800"
  },
  therapist: {
    title: "Therapist",
    description: "Mental health and emotional support",
    icon: Brain,
    color: "from-indigo-600 to-indigo-800"
  },
  yoga_instructor: {
    title: "Yoga Instructor",
    description: "Wellness sessions and physical therapy",
    icon: Heart,
    color: "from-pink-600 to-pink-800"
  },
  pharmacy: {
    title: "Pharmacy",
    description: "Prescription management and delivery",
    icon: Pill,
    color: "from-red-600 to-red-800"
  },
  food_service: {
    title: "Food Service",
    description: "Meal planning and delivery coordination",
    icon: Truck,
    color: "from-yellow-600 to-yellow-800"
  },
  community_manager: {
    title: "Community Manager",
    description: "Patient support and community building",
    icon: Users,
    color: "from-cyan-600 to-cyan-800"
  },
  patient: {
    title: "Patient",
    description: "Pregnancy care and health monitoring",
    icon: Heart,
    color: "from-teal-600 to-teal-800"
  },
  admin: {
    title: "Admin",
    description: "System management and oversight",
    icon: Settings,
    color: "from-gray-600 to-gray-800"
  }
};

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole && mode === 'signup') {
      setStep('credentials');
    } else if (mode === 'signin') {
      setStep('credentials');
    }
  };

  const handleBack = () => {
    setStep('role');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'signup') {
      if (!selectedRole) {
        toast({
          title: "Error",
          description: "Please select a role first",
          variant: "destructive"
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error", 
          description: "Passwords don't match",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      if (mode === 'signin') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, selectedRole!, {
          name: formData.name
        });
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Authentication failed",
          variant: "destructive"
        });
      } else if (mode === 'signup') {
        toast({
          title: "Success",
          description: "Account created! Please check your email for verification.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Determine the correct redirect URL based on environment
      const isProduction = window.location.hostname !== 'localhost';
      const redirectUrl = isProduction 
        ? 'https://pregacare-health-care-ecosystem-web.vercel.app/auth/callback'
        : `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}?role=${selectedRole || 'patient'}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setStep('role');
    setSelectedRole(null);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
            <CardTitle className="text-2xl">
              {mode === 'signin' ? 'Sign In' : `Join as ${selectedRole ? roleConfigs[selectedRole].title : ''}`}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' ? 'Access your dashboard' : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button 
                  type="submit"
                  className="w-full" 
                  size="lg"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading || (mode === 'signup' && !selectedRole)}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </Button>
                
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={handleBack} 
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-primary hover:underline"
              >
                {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
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
            Pregacare Ecosystem
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
            Exclusive healthcare platform for verified providers and registered patients
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-primary-foreground">
            <span className="w-2 h-2 bg-wellness rounded-full animate-pulse"></span>
            {mode === 'signin' ? 'Verified healthcare providers only' : 'Join the Pregacare ecosystem'}
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            {mode === 'signin' ? 'Access Your Pregacare Dashboard' : 'Join as a Verified Provider'}
          </h2>
          <p className="text-lg text-primary-foreground/80">
            {mode === 'signin' 
              ? 'Select your role to access your Pregacare ecosystem dashboard' 
              : 'Apply to become a verified healthcare provider in the Pregacare ecosystem'
            }
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

        <div className="text-center mb-8">
          <Button
            onClick={toggleMode}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-primary-foreground"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>

        {((selectedRole && mode === 'signup') || mode === 'signin') && (
          <div className="text-center">
            <Button 
              onClick={handleContinue} 
              size="lg" 
              variant="hero"
              className="px-8"
            >
              Continue {selectedRole && mode === 'signup' ? `as ${roleConfigs[selectedRole].title}` : ''}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}