import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, RefreshCw, Users, Calendar, Heart, Utensils } from 'lucide-react';
import { dataSeeder } from '@/lib/dataSeeder';
import { pregacareDB } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface DataStats {
  users: number;
  patients: number;
  providers: number;
  appointments: number;
  prescriptions: number;
  dietPlans: number;
  yogaSessions: number;
  therapySessions: number;
  foodOrders: number;
  communications: number;
}

export function DataInitializer() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState<DataStats>({
    users: 0,
    patients: 0,
    providers: 0,
    appointments: 0,
    prescriptions: 0,
    dietPlans: 0,
    yogaSessions: 0,
    therapySessions: 0,
    foodOrders: 0,
    communications: 0
  });
  const { toast } = useToast();

  const updateStats = () => {
    setStats({
      users: pregacareDB.users.getAll().length,
      patients: pregacareDB.patients.getAll().length,
      providers: pregacareDB.providers.getAll().length,
      appointments: pregacareDB.appointments.getAll().length,
      prescriptions: pregacareDB.prescriptions.getAll().length,
      dietPlans: pregacareDB.dietPlans.getAll().length,
      yogaSessions: pregacareDB.yogaSessions.getAll().length,
      therapySessions: pregacareDB.therapySessions.getAll().length,
      foodOrders: pregacareDB.foodOrders.getAll().length,
      communications: pregacareDB.communications.getAll().length
    });
  };

  useEffect(() => {
    updateStats();
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await dataSeeder.seedEssentialData();
      updateStats();
      toast({
        title: "Success!",
        description: "Essential system data has been initialized successfully.",
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to initialize system data.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = () => {
    pregacareDB.clearAllData();
    updateStats();
    toast({
      title: "Cleared",
      description: "All data has been cleared.",
    });
  };

  const getTotalRecords = () => {
    return Object.values(stats).reduce((sum, count) => sum + count, 0);
  };

  const hasData = getTotalRecords() > 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pregacare Data Management
        </h1>
        <p className="text-gray-600">
          Initialize and manage your local Pregacare ecosystem data
        </p>
      </div>

      {/* Data Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Current Data Status
          </CardTitle>
          <CardDescription>
            Overview of data currently stored in local storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.patients}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Heart className="w-4 h-4" />
                Patients
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.providers}</div>
              <div className="text-sm text-gray-500">Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.appointments}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4" />
                Appointments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.foodOrders}</div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Utensils className="w-4 h-4" />
                Food Orders
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Records:</span>
              <Badge variant={hasData ? "default" : "secondary"} className="text-lg px-3 py-1">
                {getTotalRecords()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Initialize System Data</CardTitle>
            <CardDescription>
              Set up essential system configurations and subscription packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing System...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Initialize System Data
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              This will set up subscription packages and system configurations (no fake data)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Clear All Data</CardTitle>
            <CardDescription>
              Remove all data from local storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="w-full"
              disabled={!hasData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Warning: This action cannot be undone
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pregacare Ecosystem Features</CardTitle>
          <CardDescription>
            Complete local storage-based healthcare management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Patient Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Patient profiles and medical history</li>
                <li>• Pregnancy tracking and milestones</li>
                <li>• Appointment scheduling</li>
                <li>• Prescription management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Provider Services</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multi-provider support (Doctors, Nutritionists, etc.)</li>
                <li>• Telehealth consultations</li>
                <li>• Therapy and yoga sessions</li>
                <li>• Medical records management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Wellness Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Personalized nutrition plans</li>
                <li>• Healthy meal delivery</li>
                <li>• Prenatal yoga programs</li>
                <li>• Mental health support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Communication</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Provider-patient messaging</li>
                <li>• Appointment reminders</li>
                <li>• Real-time notifications</li>
                <li>• Emergency support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Ready Notice */}
      <Card className="mt-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🚀 Production Ready System</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-700">
          <div className="space-y-2">
            <p><strong>✅ All fake data has been removed</strong></p>
            <p><strong>✅ Database is clean and ready for real users</strong></p>
            <p><strong>✅ Only essential system configurations are loaded</strong></p>
          </div>
          <div className="mt-4 p-3 bg-white rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-green-700">
              <li>Initialize system data (subscription packages)</li>
              <li>Users can now register their own accounts</li>
              <li>Healthcare providers can sign up and create profiles</li>
              <li>Start using the platform with real data</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}