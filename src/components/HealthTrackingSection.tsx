import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Calendar,
  Clock,
  Weight,
  Thermometer,
  Droplets,
  Eye,
  Baby
} from "lucide-react";
import { User as UserType, MedicalRecord, Patient } from "@/types/pregacare";
import { pregacareDB } from "@/lib/storage";
import { format, subDays, subWeeks } from "date-fns";

interface HealthTrackingSectionProps {
  user: UserType;
}

export const HealthTrackingSection = ({ user }: HealthTrackingSectionProps) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddVital, setShowAddVital] = useState(false);
  const [newVital, setNewVital] = useState({
    type: 'blood_pressure',
    value: '',
    notes: ''
  });

  useEffect(() => {
    loadHealthData();
  }, [user]);

  const loadHealthData = () => {
    setLoading(true);
    try {
      // Get patient data
      const patient = pregacareDB.patients.getFiltered(p => p.userId === user.id)[0];
      setPatientData(patient);

      // Get medical records for this patient
      if (patient) {
        const records = pregacareDB.medicalRecords.getFiltered(
          record => record.patientId === patient.id
        ).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        setMedicalRecords(records);
      }
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addVitalRecord = () => {
    if (!patientData || !newVital.value.trim()) return;

    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      patientId: patientData.id,
      providerId: user.id,
      recordType: 'vitals',
      title: `${newVital.type.replace('_', ' ').toUpperCase()} Reading`,
      description: `${newVital.type}: ${newVital.value}${newVital.notes ? ` - ${newVital.notes}` : ''}`,
      content: {
        vitalType: newVital.type,
        value: newVital.value,
        notes: newVital.notes
      },
      tags: [newVital.type, 'vital_signs'],
      uploadDate: new Date().toISOString(),
      isConfidential: false,
      createdAt: new Date().toISOString()
    };

    pregacareDB.medicalRecords.create(newRecord);
    setNewVital({ type: 'blood_pressure', value: '', notes: '' });
    setShowAddVital(false);
    loadHealthData(); // Refresh data
  };

  const getPregnancyProgress = () => {
    if (!patientData) return { week: 0, progress: 0, dueDate: null };
    
    // Calculate pregnancy week based on due date
    const dueDate = patientData.dueDate ? new Date(patientData.dueDate) : null;
    if (!dueDate) return { week: 20, progress: 50, dueDate: null }; // Default
    
    const now = new Date();
    const pregnancyDuration = 40 * 7 * 24 * 60 * 60 * 1000; // 40 weeks in milliseconds
    const conception = new Date(dueDate.getTime() - pregnancyDuration);
    const elapsed = now.getTime() - conception.getTime();
    const week = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
    const progress = Math.min((week / 40) * 100, 100);
    
    return { week: Math.max(0, week), progress, dueDate };
  };

  const getLatestVitals = () => {
    const vitalTypes = ['blood_pressure', 'heart_rate', 'weight', 'temperature', 'blood_sugar'];
    return vitalTypes.map(type => {
      const latestRecord = medicalRecords.find(record => 
        record.recordType === 'vitals' && record.content?.vitalType === type
      );
      return {
        type,
        value: latestRecord?.content?.value || 'Not recorded',
        date: latestRecord ? format(new Date(latestRecord.uploadDate), 'MMM dd') : null,
        status: getVitalStatus(type, latestRecord?.content?.value)
      };
    });
  };

  const getVitalStatus = (type: string, value?: string) => {
    if (!value || value === 'Not recorded') return 'unknown';
    
    // Simple status logic - in real app, this would be more sophisticated
    switch (type) {
      case 'blood_pressure':
        const bp = value.split('/').map(n => parseInt(n));
        if (bp.length === 2 && bp[0] <= 140 && bp[1] <= 90) return 'normal';
        return 'attention';
      case 'heart_rate':
        const hr = parseInt(value);
        if (hr >= 60 && hr <= 100) return 'normal';
        return 'attention';
      case 'weight':
        return 'normal'; // Weight tracking is contextual during pregnancy
      case 'temperature':
        const temp = parseFloat(value);
        if (temp >= 36.1 && temp <= 37.2) return 'normal';
        return 'attention';
      case 'blood_sugar':
        const bs = parseInt(value);
        if (bs >= 70 && bs <= 140) return 'normal';
        return 'attention';
      default:
        return 'normal';
    }
  };

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure': return Droplets;
      case 'heart_rate': return Heart;
      case 'weight': return Weight;
      case 'temperature': return Thermometer;
      case 'blood_sugar': return Eye;
      default: return Activity;
    }
  };

  const getVitalLabel = (type: string) => {
    switch (type) {
      case 'blood_pressure': return 'Blood Pressure';
      case 'heart_rate': return 'Heart Rate';
      case 'weight': return 'Weight';
      case 'temperature': return 'Temperature';
      case 'blood_sugar': return 'Blood Sugar';
      default: return type;
    }
  };

  const pregnancyProgress = getPregnancyProgress();
  const latestVitals = getLatestVitals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading health data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Health Tracking</h2>
          <p className="text-gray-600">Monitor your pregnancy journey and vital signs</p>
        </div>
        <Button onClick={() => setShowAddVital(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reading
        </Button>
      </div>

      {/* Pregnancy Progress */}
      {patientData && (
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Baby className="w-5 h-5" />
              Pregnancy Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {pregnancyProgress.week}
                </div>
                <p className="text-sm text-gray-600">Weeks</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-pink-600 mb-2">
                  {patientData.pregnancyStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <p className="text-sm text-gray-600">Trimester</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-pink-600 mb-2">
                  {pregnancyProgress.dueDate ? format(pregnancyProgress.dueDate, 'MMM dd, yyyy') : 'Not set'}
                </div>
                <p className="text-sm text-gray-600">Due Date</p>
              </div>
            </div>
            <Progress value={pregnancyProgress.progress} className="mb-2" />
            <p className="text-center text-sm text-gray-600">
              {Math.round(pregnancyProgress.progress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vital Signs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestVitals.map((vital) => {
          const Icon = getVitalIcon(vital.type);
          const statusColors = {
            normal: 'border-green-200 bg-green-50',
            attention: 'border-yellow-200 bg-yellow-50',
            unknown: 'border-gray-200 bg-gray-50'
          };
          
          return (
            <Card key={vital.type} className={`${statusColors[vital.status]} border-2`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Icon className={`w-5 h-5 ${vital.status === 'normal' ? 'text-green-600' : vital.status === 'attention' ? 'text-yellow-600' : 'text-gray-400'}`} />
                  <Badge variant={vital.status === 'normal' ? 'secondary' : vital.status === 'attention' ? 'destructive' : 'outline'}>
                    {vital.status === 'unknown' ? 'No data' : vital.status}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm">{getVitalLabel(vital.type)}</h3>
                <p className="text-lg font-bold">{vital.value}</p>
                {vital.date && (
                  <p className="text-xs text-gray-500">Last: {vital.date}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Health Records</CardTitle>
          <CardDescription>Your latest medical records and vital sign readings</CardDescription>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No health records yet</p>
              <p className="text-sm text-gray-400">Start tracking your vitals to see your health journey</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{record.title}</h4>
                    <p className="text-sm text-gray-600">{record.description}</p>
                    {record.content?.notes && (
                      <p className="text-xs text-gray-500 mt-1">{record.content.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(record.uploadDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(record.uploadDate), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Vital Modal */}
      {showAddVital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Add Vital Reading</CardTitle>
              <CardDescription>Record a new vital sign measurement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vital Type</label>
                <select 
                  value={newVital.type}
                  onChange={(e) => setNewVital({...newVital, type: e.target.value})}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="heart_rate">Heart Rate</option>
                  <option value="weight">Weight</option>
                  <option value="temperature">Temperature</option>
                  <option value="blood_sugar">Blood Sugar</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Value</label>
                <Input
                  value={newVital.value}
                  onChange={(e) => setNewVital({...newVital, value: e.target.value})}
                  placeholder={newVital.type === 'blood_pressure' ? '120/80' : 
                              newVital.type === 'heart_rate' ? '72' :
                              newVital.type === 'weight' ? '65.5' :
                              newVital.type === 'temperature' ? '36.5' : '95'}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Input
                  value={newVital.notes}
                  onChange={(e) => setNewVital({...newVital, notes: e.target.value})}
                  placeholder="Any additional notes..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={addVitalRecord} disabled={!newVital.value.trim()}>
                  Add Reading
                </Button>
                <Button variant="outline" onClick={() => setShowAddVital(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};