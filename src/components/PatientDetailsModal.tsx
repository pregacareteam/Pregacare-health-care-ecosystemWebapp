import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, FileText, Heart, Activity, Upload, Send } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  pregnancy_stage: string;
  due_date: string;
  risk_status: 'normal' | 'medium' | 'high';
  profile_picture?: string;
  medical_history: any;
  emergency_contact: string;
}

interface PatientDetailsModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onCreatePrescription: (patient: Patient) => void;
  onReferPatient: (patient: Patient) => void;
}

export function PatientDetailsModal({ 
  patient, 
  isOpen, 
  onClose, 
  onCreatePrescription,
  onReferPatient 
}: PatientDetailsModalProps) {
  if (!patient) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  };

  const mockVitals = [
    { date: '2024-01-15', bp: '120/80', weight: '65kg', glucose: '95 mg/dL' },
    { date: '2024-01-08', bp: '118/78', weight: '64kg', glucose: '92 mg/dL' },
    { date: '2024-01-01', bp: '122/82', weight: '63kg', glucose: '98 mg/dL' },
  ];

  const mockPrescriptions = [
    { date: '2024-01-15', medication: 'Prenatal Vitamins', dosage: '1 tablet daily', duration: '3 months' },
    { date: '2024-01-08', medication: 'Folic Acid', dosage: '400mcg daily', duration: 'Throughout pregnancy' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={patient.profile_picture} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{patient.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRiskColor(patient.risk_status)}>
                  {patient.risk_status.toUpperCase()} RISK
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Age: {getAge(patient.date_of_birth)} • {patient.pregnancy_stage.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onCreatePrescription(patient)} variant="default">
                <FileText className="w-4 h-4 mr-2" />
                Prescribe
              </Button>
              <Button onClick={() => onReferPatient(patient)} variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Refer
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emergency Contact:</span>
                    <span>{patient.emergency_contact}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pregnancy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Stage:</span>
                    <span className="capitalize">{patient.pregnancy_stage.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{new Date(patient.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <Badge variant={getRiskColor(patient.risk_status)}>
                      {patient.risk_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Conditions:</h4>
                    <div className="space-y-1">
                      {patient.medical_history?.conditions?.map((condition: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Allergies:</h4>
                    <div className="space-y-1">
                      {patient.medical_history?.allergies?.map((allergy: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVitals.map((vital, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{new Date(vital.date).toLocaleDateString()}</span>
                      <div className="flex gap-4 text-sm">
                        <span>BP: {vital.bp}</span>
                        <span>Weight: {vital.weight}</span>
                        <span>Glucose: {vital.glucose}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Prescription History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPrescriptions.map((prescription, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{prescription.medication}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(prescription.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {prescription.dosage} • Duration: {prescription.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Medical Records & Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No records uploaded yet. Click to upload scans, lab reports, or other documents.
                  </p>
                  <Button variant="outline" className="mt-2">
                    Upload Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Regular Checkup</span>
                      <span className="text-sm text-muted-foreground">Jan 15, 2024</span>
                    </div>
                    <p className="text-sm">
                      Patient showing good progress. Baby's heartbeat is strong and regular. 
                      Recommended to continue current prenatal vitamins and maintain regular exercise routine.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Follow-up Visit</span>
                      <span className="text-sm text-muted-foreground">Jan 8, 2024</span>
                    </div>
                    <p className="text-sm">
                      Blood pressure slightly elevated. Advised on dietary modifications and stress management techniques.
                      Schedule follow-up in 1 week.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}