import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MultiRoleManager } from '@/hooks/useEnhancedAuth';
import ProviderServiceManager from '@/lib/providerServiceManager';
import type { UserRole } from '@/types/roles';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: 'Authentication Error',
            description: error.message || 'Failed to complete Google sign-in',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        if (data.session) {
          const user = data.session.user;
          const userMetadata = user.user_metadata;
          
          // Extract role from URL params if available
          const urlParams = new URLSearchParams(window.location.search);
          const role = urlParams.get('role') || 'patient';
          
          // Create user data for your system
          const userData = {
            name: userMetadata.full_name || userMetadata.name || user.email!.split('@')[0],
            role: role,
            phone: userMetadata.phone_number
          };

          try {
            // Use your existing MultiRoleManager to create/update user
            const result = MultiRoleManager.createOrUpdateUser(user.email!, userData);
            
            // Create provider service profile if it's a provider role
            let generatedProviderId = null;
            if (role !== 'patient') {
              const providerService = ProviderServiceManager.createProviderService(result.user.id, role, {
                displayName: result.user.name,
                specialization: `${role.charAt(0).toUpperCase() + role.slice(1)} Specialist`
              });
              generatedProviderId = providerService.id;
            }
            
            // Create session
            localStorage.setItem('pregacare_session', JSON.stringify({
              email: user.email,
              currentRole: role,
              loginTime: new Date().toISOString()
            }));
            
            toast({
              title: 'Welcome to Pregacare!',
              description: `Successfully signed in with Google as ${userData.name}${generatedProviderId ? ` (ID: ${generatedProviderId})` : ''}`,
            });

            // Redirect to the correct dashboard route based on your current routing structure
            const dashboardRoutes: Record<string, string> = {
              doctor: '/dashboard/doctor',
              radiologist: '/dashboard/radiologist', 
              lab_technician: '/dashboard/lab_technician',
              nutritionist: '/dashboard/nutritionist',
              therapist: '/dashboard/therapist',
              yoga_instructor: '/dashboard/yoga_instructor',
              pharmacy: '/dashboard/pharmacy',
              food_service: '/dashboard/food_service',
              community_manager: '/dashboard/community_manager',
              patient: '/dashboard/patient',
              admin: '/dashboard/admin'
            };

            // Short delay to show success message then redirect
            setTimeout(() => {
              navigate(dashboardRoutes[role] || '/dashboard/patient');
            }, 1500);
            
          } catch (userError) {
            console.error('User creation error:', userError);
            toast({
              title: 'Account Setup Error',
              description: userError instanceof Error ? userError.message : 'Failed to set up your account',
              variant: 'destructive'
            });
            navigate('/');
          }
        } else {
          // No session found, redirect back to home
          navigate('/');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred during sign-in',
          variant: 'destructive'
        });
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Completing Sign-In</h2>
          <p className="text-muted-foreground text-center">
            Please wait while we complete your Google sign-in...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}