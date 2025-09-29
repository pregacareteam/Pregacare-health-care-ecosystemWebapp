import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, TestTube, Utensils, Brain, Heart, Pill, Truck, Users, Activity, Settings, ArrowLeft, CheckCircle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function RoleAuth() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedProviderId, setGeneratedProviderId] = useState<string | null>(null);
  const [showProviderIdCard, setShowProviderIdCard] = useState(false);

  const { signIn, signUp } = useEnhancedAuth();
  const { toast } = useToast();

  // Get role config or redirect if invalid
  const roleConfig = role ? roleConfigs[role as keyof typeof roleConfigs] : null;

  useEffect(() => {
    if (!roleConfig) {
      navigate('/');
      return;
    }
  }, [role, roleConfig, navigate]);

  if (!roleConfig) {
    return null;
  }

  const IconComponent = roleConfig.icon;

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
        result = await signIn(formData.email, formData.password, role);
        // On successful sign in, redirect to dashboard
        if (result && !result.error) {
          navigate(`/dashboard/${role}`);
        }
      } else {
        result = await signUp(formData.email, formData.password, {
          name: formData.name,
          role: role as any
        });
        if (result && !result.error) {
          // Show provider ID if generated
          if (result.providerId) {
            setGeneratedProviderId(result.providerId);
            setShowProviderIdCard(true);
          }
          
          toast({
            title: "Success",
            description: result.message || "Account created successfully!",
            duration: 5000,
          });
          
          // If it's a patient role or approved provider, redirect to dashboard after showing ID
          if (role === 'patient' || !result.message?.includes('pending')) {
            setTimeout(() => navigate(`/dashboard/${role}`), result.providerId ? 4000 : 2000);
          }
        }
      }

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error || "Authentication failed",
          variant: "destructive"
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

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleBack = () => {
    navigate('/');
  };

  const copyProviderId = () => {
    if (generatedProviderId) {
      navigator.clipboard.writeText(generatedProviderId);
      toast({
        title: "Provider ID Copied",
        description: `${generatedProviderId} copied to clipboard`,
      });
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
          redirectTo: `${redirectUrl}?role=${role}`,
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

  // Provider ID Success Card
  if (showProviderIdCard && generatedProviderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-green-200">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              {roleConfig.title} Account Created!
            </CardTitle>
            <CardDescription>
              Your unique provider service ID has been generated
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Generated Provider ID Display */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-white text-center">
              <p className="text-sm opacity-90 mb-1">Your Provider Service ID</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold font-mono tracking-wider">
                  {generatedProviderId}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={copyProviderId}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs opacity-80 mt-2">
                Use this ID for all service bookings and communications
              </p>
            </div>

            {/* Provider Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Service Type</span>
                <span className="font-semibold">{roleConfig.title}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Professional Name</span>
                <span className="font-semibold">{formData.name}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {role === 'patient' ? 'Active' : 'Pending Approval'}
                </Badge>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Important Information:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Save your Provider ID: <strong>{generatedProviderId}</strong></li>
                <li>• Patients will use this ID to book your services</li>
                <li>• Your account requires admin approval before activation</li>
                <li>• You'll receive an email when approved</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/dashboard/${role}`)}
                className="w-full"
                size="lg"
              >
                Continue to Dashboard
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${roleConfig.color} rounded-full flex items-center justify-center mb-4`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'signin' ? `Sign In as ${roleConfig.title}` : `Join as ${roleConfig.title}`}
          </CardTitle>
          <CardDescription>
            {roleConfig.description}
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
                disabled={loading}
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
                Back to Role Selection
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:underline"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}