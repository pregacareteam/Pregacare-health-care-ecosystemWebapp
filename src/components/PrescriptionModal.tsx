import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  pregnancy_stage: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prescription: any) => void;
}

const commonMedications = [
  { name: "Prenatal Vitamins", defaultDosage: "1 tablet", defaultFrequency: "Once daily" },
  { name: "Folic Acid", defaultDosage: "400mcg", defaultFrequency: "Once daily" },
  { name: "Iron Supplement", defaultDosage: "65mg", defaultFrequency: "Once daily" },
  { name: "Calcium Carbonate", defaultDosage: "500mg", defaultFrequency: "Twice daily" },
  { name: "Vitamin D3", defaultDosage: "1000 IU", defaultFrequency: "Once daily" },
];

export function PrescriptionModal({ patient, isOpen, onClose, onSave }: PrescriptionModalProps) {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
  ]);
  const [generalInstructions, setGeneralInstructions] = useState("");

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const selectCommonMedication = (index: number, medicationName: string) => {
    const commonMed = commonMedications.find(med => med.name === medicationName);
    if (commonMed) {
      updateMedication(index, 'name', commonMed.name);
      updateMedication(index, 'dosage', commonMed.defaultDosage);
      updateMedication(index, 'frequency', commonMed.defaultFrequency);
    }
  };

  const handleSave = () => {
    const validMedications = medications.filter(med => med.name && med.dosage && med.frequency);
    
    if (validMedications.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one complete medication.",
        variant: "destructive",
      });
      return;
    }

    const prescription = {
      patient_id: patient?.id,
      medications: validMedications,
      general_instructions: generalInstructions,
      prescribed_date: new Date().toISOString(),
    };

    onSave(prescription);
    toast({
      title: "Success",
      description: "Prescription created successfully.",
    });
    onClose();
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Prescription for {patient.name}
          </DialogTitle>
          <Badge variant="outline" className="w-fit">
            {patient.pregnancy_stage.replace('_', ' ')}
          </Badge>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {commonMedications.map((med, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => selectCommonMedication(0, med.name)}
                  >
                    {med.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Medications
                <Button onClick={addMedication} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button
                        onClick={() => removeMedication(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`medication-name-${index}`}>Medication Name</Label>
                      <Input
                        id={`medication-name-${index}`}
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="e.g., Prenatal Vitamins"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                      <Input
                        id={`dosage-${index}`}
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 1 tablet, 400mcg"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                      <Select
                        value={medication.frequency}
                        onValueChange={(value) => updateMedication(index, 'frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                          <SelectItem value="With meals">With meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`duration-${index}`}>Duration</Label>
                      <Select
                        value={medication.duration}
                        onValueChange={(value) => updateMedication(index, 'duration', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 week">1 week</SelectItem>
                          <SelectItem value="2 weeks">2 weeks</SelectItem>
                          <SelectItem value="1 month">1 month</SelectItem>
                          <SelectItem value="3 months">3 months</SelectItem>
                          <SelectItem value="Throughout pregnancy">Throughout pregnancy</SelectItem>
                          <SelectItem value="Until delivery">Until delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`instructions-${index}`}>Special Instructions</Label>
                    <Textarea
                      id={`instructions-${index}`}
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food, avoid dairy"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* General Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>General Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                placeholder="General instructions for the patient..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Prescription
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}