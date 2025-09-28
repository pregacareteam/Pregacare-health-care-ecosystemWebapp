import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
          navigate('/auth');
          return;
        }

        if (data.session) {
          const user = data.session.user;
          const userMetadata = user.user_metadata;
          
          // Extract role from URL params if available
          const urlParams = new URLSearchParams(window.location.search);
          const role = urlParams.get('role') || 'patient';
          
          // Create or update user profile in your system
          const userData = {
            id: user.id,
            email: user.email!,
            name: userMetadata.full_name || userMetadata.name || user.email!.split('@')[0],
            profilePicture: userMetadata.avatar_url,
            role: role as UserRole,
            phone: userMetadata.phone_number,
            isActive: true
          };

          // Here you would typically save to your database
          // For now, we'll simulate success and redirect to dashboard
          
          toast({
            title: 'Welcome to Pregacare!',
            description: `Successfully signed in with Google as ${role}`,
          });

          // Redirect based on role
          const dashboardRoutes: Record<string, string> = {
            doctor: '/doctor',
            radiologist: '/radiologist', 
            lab_technician: '/lab',
            nutritionist: '/nutritionist',
            therapist: '/therapist',
            yoga_instructor: '/yoga',
            pharmacy: '/pharmacy',
            food_service: '/delivery',
            community_manager: '/community',
            patient: '/patient',
            admin: '/admin'
          };

          navigate(dashboardRoutes[role] || '/patient');
        } else {
          // No session found, redirect back to auth
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred during sign-in',
          variant: 'destructive'
        });
        navigate('/auth');
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