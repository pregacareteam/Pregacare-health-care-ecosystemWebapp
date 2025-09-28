import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Users, 
  AlertTriangle, 
  Send, 
  FileText, 
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import PatientProviderAssignmentManager from "@/lib/patientProviderAssignmentManager";

// Simplified communication pipeline for demo
interface CommunicationDemo {
  id: string;
  patientId: string;
  patientName: string;
  fromProvider: { id: string; name: string; type: string };
  toProvider: { id: string; name: string; type: string };
  subject: string;
  message: string;
  isUrgent: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'responded';
}

export const CommunicationPipelineDemo: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedFromProvider, setSelectedFromProvider] = useState<string>('');
  const [selectedToProviderType, setSelectedToProviderType] = useState<string>('');
  const [messageSubject, setMessageSubject] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [communications, setCommunications] = useState<CommunicationDemo[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    // Load existing assignments
    const allAssignments = PatientProviderAssignmentManager.getPatientAssignments();
    setAssignments(allAssignments);
    
    // Load demo communications
    const stored = localStorage.getItem('pregacare_demo_communications');
    if (stored) {
      setCommunications(JSON.parse(stored));
    } else {
      generateSampleCommunications();
    }
  };

  const generateSampleCommunications = () => {
    const sampleComms: CommunicationDemo[] = [
      {
        id: 'comm_001',
        patientId: 'patient_001',
        patientName: 'Sarah Johnson',
        fromProvider: { id: 'nutritionist_003', name: 'Maria Rodriguez', type: 'nutritionist' },
        toProvider: { id: 'doctor_002', name: 'Dr. Smith', type: 'doctor' },
        subject: 'Lab results review needed for diet adjustment',
        message: 'Hi Dr. Smith, I need to review Sarah\'s latest iron levels before adjusting her pregnancy diet plan. Could you please share the recent lab results?',
        isUrgent: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'read'
      },
      {
        id: 'comm_002',
        patientId: 'patient_001',
        patientName: 'Sarah Johnson',
        fromProvider: { id: 'doctor_002', name: 'Dr. Smith', type: 'doctor' },
        toProvider: { id: 'therapist_001', name: 'Dr. Johnson', type: 'therapist' },
        subject: 'Patient anxiety about delivery - consultation needed',
        message: 'Sarah is expressing increased anxiety about delivery. Her blood pressure has been slightly elevated during recent visits. Could we schedule a session to address her concerns?',
        isUrgent: true,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'responded'
      },
      {
        id: 'comm_003',
        patientId: 'patient_002',
        patientName: 'Maria Rodriguez',
        fromProvider: { id: 'yoga_instructor_002', name: 'Lisa Chen', type: 'yoga_instructor' },
        toProvider: { id: 'doctor_001', name: 'Dr. Patel', type: 'doctor' },
        subject: 'Exercise clearance needed for trimester 3',
        message: 'Maria is entering her third trimester. I need medical clearance to modify her yoga routine. Are there any restrictions I should be aware of?',
        isUrgent: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'delivered'
      }
    ];

    setCommunications(sampleComms);
    localStorage.setItem('pregacare_demo_communications', JSON.stringify(sampleComms));
  };

  // Get care team for selected patient
  const getPatientCareTeam = (patientId: string) => {
    const assignment = assignments.find(a => a.patientId === patientId);
    if (!assignment) return {};
    
    const careTeam: { [key: string]: any } = {};
    Object.entries(assignment.assignments || {}).forEach(([serviceType, assignmentData]: [string, any]) => {
      if (assignmentData.status === 'active') {
        careTeam[serviceType] = {
          providerId: assignmentData.providerId,
          providerName: assignmentData.providerName,
        };
      }
    });
    
    return careTeam;
  };

  // Get target provider for communication
  const getTargetProvider = (patientId: string, providerType: string) => {
    const careTeam = getPatientCareTeam(patientId);
    return careTeam[providerType] || null;
  };

  // Send communication
  const sendCommunication = () => {
    if (!selectedPatient || !selectedFromProvider || !selectedToProviderType || !messageSubject || !messageContent) {
      alert('Please fill all fields');
      return;
    }

    const targetProvider = getTargetProvider(selectedPatient, selectedToProviderType);
    if (!targetProvider) {
      alert(`No ${selectedToProviderType} assigned to this patient`);
      return;
    }

    const assignment = assignments.find(a => a.patientId === selectedPatient);
    const fromProvider = Object.entries(assignment?.assignments || {}).find(
      ([_, data]: [string, any]) => data.providerId === selectedFromProvider
    );

    if (!fromProvider) {
      alert('From provider not found');
      return;
    }

    const newComm: CommunicationDemo = {
      id: `comm_${Date.now()}`,
      patientId: selectedPatient,
      patientName: assignment?.patientName || `Patient ${selectedPatient}`,
      fromProvider: {
        id: selectedFromProvider,
        name: (fromProvider[1] as any).providerName,
        type: fromProvider[0]
      },
      toProvider: {
        id: targetProvider.providerId,
        name: targetProvider.providerName,
        type: selectedToProviderType
      },
      subject: messageSubject,
      message: messageContent,
      isUrgent,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    const updatedComms = [newComm, ...communications];
    setCommunications(updatedComms);
    localStorage.setItem('pregacare_demo_communications', JSON.stringify(updatedComms));

    // Reset form
    setSelectedPatient('');
    setSelectedFromProvider('');
    setSelectedToProviderType('');
    setMessageSubject('');
    setMessageContent('');
    setIsUrgent(false);

    alert(`Message sent successfully to ${targetProvider.providerName}!`);
  };

  // Get quick message templates
  const getQuickMessages = (fromType: string, toType: string) => {
    const templates: { [key: string]: string[] } = {
      'nutritionist-doctor': [
        'Lab results review needed for diet adjustment',
        'Requesting medication interaction check for supplements',
        'Patient reports nausea affecting nutrition - need consultation',
        'Weight gain concerns - medical evaluation needed'
      ],
      'doctor-nutritionist': [
        'New lab results available - please adjust diet accordingly',
        'Medication changes may affect appetite and nutrition',
        'Patient has gestational diabetes - urgent diet modification needed',
        'Iron deficiency detected - please increase iron-rich foods'
      ],
      'therapist-doctor': [
        'Patient anxiety affecting treatment compliance',
        'Mental health concerns may impact physical health',
        'Medication side effects causing mood changes',
        'Risk assessment indicates need for medical review'
      ],
      'yoga_instructor-doctor': [
        'Exercise clearance needed for modified routine',
        'Patient reports back pain during exercises',
        'Physical limitations noted - need medical assessment',
        'Requesting approval for prenatal yoga modifications'
      ]
    };

    return templates[`${fromType}-${toType}`] || [];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Communication Pipeline Demo</h1>
        <p className="text-gray-600">Automatic provider-to-provider communication based on admin assignments</p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <MessageCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>How it works:</strong> When admin assigns Patient 2 → Doctor 4, Nutritionist 6, Yoga 7, 
          they can automatically communicate about that patient without manual lookup!
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send Message</TabsTrigger>
          <TabsTrigger value="inbox">Communication Inbox</TabsTrigger>
          <TabsTrigger value="care-teams">Patient Care Teams</TabsTrigger>
        </TabsList>

        {/* Send Message Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send Message to Patient's Care Team Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.map((assignment) => (
                        <SelectItem key={assignment.patientId} value={assignment.patientId}>
                          {assignment.patientName} ({assignment.patientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatient && (
                  <div className="space-y-2">
                    <Label htmlFor="fromProvider">From Provider (You are)</Label>
                    <Select value={selectedFromProvider} onValueChange={setSelectedFromProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your provider role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(getPatientCareTeam(selectedPatient)).map(([serviceType, provider]: [string, any]) => (
                          <SelectItem key={provider.providerId} value={provider.providerId}>
                            {provider.providerName} ({serviceType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {selectedFromProvider && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="toProviderType">Send To (Provider Type)</Label>
                    <Select value={selectedToProviderType} onValueChange={setSelectedToProviderType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider type to contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(getPatientCareTeam(selectedPatient))
                          .filter(type => {
                            const team = getPatientCareTeam(selectedPatient);
                            return team[type].providerId !== selectedFromProvider;
                          })
                          .map((serviceType) => (
                            <SelectItem key={serviceType} value={serviceType}>
                              {serviceType.replace('_', ' ').charAt(0).toUpperCase() + serviceType.replace('_', ' ').slice(1)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedToProviderType && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Auto-routing to: {getTargetProvider(selectedPatient, selectedToProviderType)?.providerName}
                        </span>
                        <ArrowRight className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Message subject"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                />
                <Label htmlFor="urgent">Mark as urgent</Label>
              </div>

              <Button onClick={sendCommunication} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message (Auto-routes to correct provider)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Inbox Tab */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {communications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No communications yet</p>
                ) : (
                  communications.map((comm) => (
                    <Card key={comm.id} className={`border-l-4 ${comm.isUrgent ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={comm.isUrgent ? "destructive" : "secondary"}>
                              {comm.isUrgent ? "URGENT" : "Normal"}
                            </Badge>
                            <Badge variant="outline">{comm.status}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(comm.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-lg mb-1">{comm.subject}</h4>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Patient:</strong> {comm.patientName} | 
                          <strong> From:</strong> {comm.fromProvider.name} ({comm.fromProvider.type}) | 
                          <strong> To:</strong> {comm.toProvider.name} ({comm.toProvider.type})
                        </div>
                        
                        <p className="text-gray-700">{comm.message}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Care Teams Tab */}
        <TabsContent value="care-teams">
          <Card>
            <CardHeader>
              <CardTitle>Patient Care Teams (Auto-Communication Groups)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No patient assignments found</p>
                ) : (
                  assignments.map((assignment) => (
                    <Card key={assignment.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-3">{assignment.patientName}</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {Object.entries(assignment.assignments || {}).map(([serviceType, assignmentData]: [string, any]) => (
                            <div key={serviceType} className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-600 capitalize mb-1">
                                {serviceType.replace('_', ' ')}
                              </div>
                              <div className="text-sm font-semibold">
                                {assignmentData.providerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {assignmentData.providerId}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <div className="flex items-center space-x-1 text-sm text-blue-700">
                            <MessageCircle className="h-3 w-3" />
                            <span>All providers can automatically communicate about this patient</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationPipelineDemo;