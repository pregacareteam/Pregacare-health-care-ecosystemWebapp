import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCompletionModalProps {
  userRole: string;
}

export function ProfileCompletionModal({ userRole }: ProfileCompletionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    bio: '',
    address: '',
    licenseNumber: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update the profile completion status
      const { error } = await updateProfile({ profile_completed: true });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to complete profile setup",
          variant: "destructive"
        });
        return;
      }

      // Create role-specific profile based on role
      if (userRole === 'doctor') {
        const { error: profileError } = await supabase
          .from('doctors')
          .insert({
            doctor_id: user.id,
            specialization: formData.specialization,
            license_number: formData.licenseNumber,
            clinic_address: formData.address,
            consultation_fee: 0,
            profile_completed: true
          });

        if (profileError) {
          console.error('Doctor profile creation error:', profileError);
        }
      } else if (userRole === 'nutritionist') {
        const { error: profileError } = await supabase
          .from('nutritionists')
          .insert({
            nutritionist_id: user.id,
            specialization: formData.specialization,
            profile_completed: true
          });

        if (profileError) {
          console.error('Nutritionist profile creation error:', profileError);
        }
      } else if (userRole === 'therapist') {
        const { error: profileError } = await supabase
          .from('therapists')
          .insert({
            therapist_id: user.id,
            license_number: formData.licenseNumber,
            type: 'prenatal',
            profile_completed: true
          });

        if (profileError) {
          console.error('Therapist profile creation error:', profileError);
        }
      } else if (userRole === 'yoga') {
        const { error: profileError } = await supabase
          .from('yoga_trainers')
          .insert({
            trainer_id: user.id,
            certification_details: formData.licenseNumber,
            session_types: 'prenatal',
            profile_completed: true
          });

        if (profileError) {
          console.error('Yoga trainer profile creation error:', profileError);
        }
      } else if (userRole === 'food_partner') {
        const { error: profileError } = await supabase
          .from('food_delivery_partners')
          .insert({
            partner_id: user.id,
            delivery_zone: formData.address,
            vehicle_type: 'car',
            profile_completed: true
          });

        if (profileError) {
          console.error('Food partner profile creation error:', profileError);
        }
      } else if (userRole === 'patient') {
        const { error: profileError } = await supabase
          .from('patients_new')
          .insert({
            patient_id: user.id,
            address: formData.address,
            emergency_contact: formData.phone,
            profile_completed: true
          });

        if (profileError) {
          console.error('Patient profile creation error:', profileError);
        }
      }

      toast({
        title: "Success",
        description: "Profile completed successfully!",
      });

    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = (role: string) => {
    const titles: Record<string, string> = {
      doctor: 'Doctor',
      nutritionist: 'Nutritionist', 
      therapist: 'Therapist',
      yoga: 'Yoga Trainer',
      food_partner: 'Food Partner',
      patient: 'Patient'
    };
    return titles[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome {getRoleTitle(userRole)}! Please complete your profile to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {(userRole === 'doctor' || userRole === 'nutritionist' || userRole === 'therapist') && (
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  type="text"
                  placeholder="Enter your specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
              </div>
            )}

            {(userRole === 'doctor' || userRole === 'therapist' || userRole === 'yoga') && (
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">
                  {userRole === 'yoga' ? 'Certification' : 'License Number'}
                </Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder={`Enter your ${userRole === 'yoga' ? 'certification details' : 'license number'}`}
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                />
              </div>
            )}

            {(userRole === 'patient' || userRole === 'food_partner' || userRole === 'doctor') && (
              <div className="space-y-2">
                <Label htmlFor="address">
                  {userRole === 'food_partner' ? 'Delivery Zone' : userRole === 'doctor' ? 'Clinic Address' : 'Address'}
                </Label>
                <Textarea
                  id="address"
                  placeholder={`Enter your ${userRole === 'food_partner' ? 'delivery zone' : 'address'}`}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">Brief Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <Button 
              type="submit"
              className="w-full" 
              size="lg"
              variant="hero"
              disabled={loading || !formData.name}
            >
              {loading ? 'Completing...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}