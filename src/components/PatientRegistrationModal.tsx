import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  onPatientAdded: () => void;
}

export function PatientRegistrationModal({ 
  isOpen, 
  onClose, 
  doctorId, 
  onPatientAdded 
}: PatientRegistrationModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [pregacareId, setPregacareId] = useState("");
  const [validatingId, setValidatingId] = useState(false);
  const [idValidated, setIdValidated] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pregnancy_stage: "",
    risk_status: "normal",
    emergency_contact: "",
    medical_conditions: "",
    allergies: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePregacareId = async (id: string) => {
    if (!id) {
      setIdValidated(false);
      return;
    }
    
    setValidatingId(true);
    try {
      const { data, error } = await supabase
        .from('pregacare_patients')
        .select('pregacare_id, status')
        .eq('pregacare_id', id)
        .single();

      if (error || !data || data.status !== 'active') {
        toast({
          title: "Invalid Pregacare ID",
          description: "This Pregacare ID is not found or inactive. Only registered Pregacare patients can be added.",
          variant: "destructive",
        });
        setIdValidated(false);
      } else {
        setIdValidated(true);
        toast({
          title: "Pregacare ID Verified",
          description: "Valid Pregacare patient found.",
        });
      }
    } catch (error) {
      console.error('Error validating Pregacare ID:', error);
      toast({
        title: "Validation Error",
        description: "Could not validate Pregacare ID. Please try again.",
        variant: "destructive",
      });
      setIdValidated(false);
    } finally {
      setValidatingId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregacareId || !idValidated) {
      toast({
        title: "Pregacare ID Required",
        description: "Please enter and validate a Pregacare ID first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.email || !dateOfBirth || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create patient record with Pregacare ID
      const patientData = {
        doctor_id: doctorId,
        pregacare_id: pregacareId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: dateOfBirth.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        pregnancy_stage: formData.pregnancy_stage,
        risk_status: formData.risk_status,
        emergency_contact: formData.emergency_contact,
        medical_history: {
          conditions: formData.medical_conditions.split(',').map(c => c.trim()).filter(c => c),
          allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a)
        }
      };

      const { error } = await supabase
        .from('patients')
        .insert([patientData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pregacare patient registered successfully to your care.",
      });

      // Reset form
      setPregacareId("");
      setIdValidated(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        pregnancy_stage: "",
        risk_status: "normal",
        emergency_contact: "",
        medical_conditions: "",
        allergies: ""
      });
      setDueDate(undefined);
      setDateOfBirth(undefined);
      
      onPatientAdded();
      onClose();
    } catch (error) {
      console.error('Error registering patient:', error);
      toast({
        title: "Error",
        description: "Failed to register patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Pregacare Patient to Your Care</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Only patients registered with Pregacare ecosystem can be added to your care.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pregacare ID Validation */}
          <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
            <div className="space-y-3">
              <Label htmlFor="pregacare_id" className="text-base font-medium">
                Pregacare Patient ID *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="pregacare_id"
                  value={pregacareId}
                  onChange={(e) => setPregacareId(e.target.value.toUpperCase())}
                  placeholder="PGC-2024-XXX"
                  className={idValidated ? "border-green-500" : ""}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => validatePregacareId(pregacareId)}
                  disabled={!pregacareId || validatingId}
                  className="min-w-[100px]"
                >
                  {validatingId ? "Checking..." : "Validate"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the Pregacare ID to verify patient registration in the ecosystem.
              </p>
              {idValidated && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Pregacare patient verified
                </div>
              )}
            </div>
          </div>

          {/* Personal Information - Only show if ID is validated */}
          {idValidated && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter patient's full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="patient@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                      placeholder="Emergency contact details"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateOfBirth ? format(dateOfBirth, "PPP") : "Select date of birth"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={setDateOfBirth}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Expected Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Select due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Pregnancy Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pregnancy_stage">Pregnancy Stage</Label>
                    <Select
                      value={formData.pregnancy_stage}
                      onValueChange={(value) => handleInputChange('pregnancy_stage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pregnancy stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_trimester">First Trimester</SelectItem>
                        <SelectItem value="second_trimester">Second Trimester</SelectItem>
                        <SelectItem value="third_trimester">Third Trimester</SelectItem>
                        <SelectItem value="postpartum">Postpartum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="risk_status">Risk Status</Label>
                    <Select
                      value={formData.risk_status}
                      onValueChange={(value) => handleInputChange('risk_status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Medical History */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="medical_conditions">Medical Conditions</Label>
                    <Textarea
                      id="medical_conditions"
                      value={formData.medical_conditions}
                      onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                      placeholder="Enter medical conditions separated by commas"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="Enter allergies separated by commas"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !idValidated}
              variant={idValidated ? "default" : "outline"}
            >
              {loading ? "Adding to Care..." : "Add to My Care"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}