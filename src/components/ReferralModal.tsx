import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Heart, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  pregnancy_stage: string;
}

interface ReferralModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (referral: any) => void;
}

const referralTypes = [
  {
    type: 'nutritionist',
    label: 'Nutritionist',
    icon: Activity,
    description: 'Diet planning and nutritional guidance during pregnancy',
    reasons: [
      'Gestational diabetes management',
      'Weight management during pregnancy',
      'Nutritional deficiencies',
      'Special dietary requirements',
      'Morning sickness and appetite issues'
    ]
  },
  {
    type: 'therapist',
    label: 'Mental Health Therapist',
    icon: Heart,
    description: 'Emotional and psychological support during pregnancy',
    reasons: [
      'Prenatal anxiety or depression',
      'Postpartum depression risk',
      'Relationship counseling',
      'Stress management',
      'Birth trauma counseling'
    ]
  },
  {
    type: 'yoga_trainer',
    label: 'Prenatal Yoga Instructor',
    icon: Users,
    description: 'Safe exercise and relaxation techniques for expectant mothers',
    reasons: [
      'Back pain and posture issues',
      'Preparation for labor',
      'Stress and anxiety relief',
      'Improved sleep quality',
      'Gentle exercise during pregnancy'
    ]
  }
];

export function ReferralModal({ patient, isOpen, onClose, onSave }: ReferralModalProps) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!selectedType || !reason) {
      toast({
        title: "Error",
        description: "Please select a referral type and provide a reason.",
        variant: "destructive",
      });
      return;
    }

    const referral = {
      patient_id: patient?.id,
      referred_to_type: selectedType,
      reason,
      notes,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    onSave(referral);
    toast({
      title: "Success",
      description: `Referral to ${referralTypes.find(t => t.type === selectedType)?.label} created successfully.`,
    });
    
    // Reset form
    setSelectedType("");
    setReason("");
    setNotes("");
    onClose();
  };

  const selectedReferralType = referralTypes.find(type => type.type === selectedType);

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Refer {patient.name} to Specialist
          </DialogTitle>
          <Badge variant="outline" className="w-fit">
            {patient.pregnancy_stage.replace('_', ' ')}
          </Badge>
        </DialogHeader>

        <div className="space-y-6">
          {/* Referral Type Selection */}
          <div>
            <Label className="text-base font-medium">Select Specialist Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {referralTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.type}
                    className={`cursor-pointer transition-all border-2 ${
                      selectedType === type.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedType(type.type)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium mb-1">{type.label}</h3>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Reason Selection */}
          {selectedReferralType && (
            <div>
              <Label htmlFor="reason" className="text-base font-medium">
                Reason for Referral
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={`Select reason for ${selectedReferralType.label} referral`} />
                </SelectTrigger>
                <SelectContent>
                  {selectedReferralType.reasons.map((reasonOption, index) => (
                    <SelectItem key={index} value={reasonOption}>
                      {reasonOption}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (specify in notes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information for the specialist..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Preview */}
          {selectedType && reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referral Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referred to:</span>
                  <span className="font-medium">{selectedReferralType?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="font-medium">{reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pregnancy Stage:</span>
                  <span className="font-medium">{patient.pregnancy_stage.replace('_', ' ')}</span>
                </div>
                {notes && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Notes:</span>
                    <p className="text-sm bg-muted/50 p-2 rounded">{notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedType || !reason}>
              Send Referral
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}