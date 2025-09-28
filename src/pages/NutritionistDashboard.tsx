import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { MealPlanModal } from "@/components/MealPlanModal";
import { MessageModal } from "@/components/MessageModal";
import { CommunicationPanel } from "@/components/CommunicationPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/roles";
import { Users, BookOpen, TrendingUp, Calendar, Apple, ChefHat, MessageSquare, FileText, Send } from "lucide-react";
import { PregacareBranding } from "@/components/PregacareBranding";
import { useCommunication } from "@/hooks/useCommunication";
import { useAuth } from "@/hooks/useAuth";

interface NutritionistDashboardProps {
  user: User;
  onLogout: () => void;
}

export function NutritionistDashboard({ user, onLogout }: NutritionistDashboardProps) {
  const { user: authUser } = useAuth();
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedPatientForMessage, setSelectedPatientForMessage] = useState<string>("");
  
  const { communications, sendMessage, markAsRead, respondToMessage, loading: commLoading } = 
    useCommunication(authUser?.id || "", "nutritionist");
  
  const activeClients = [
    { id: 1, name: "Sarah Johnson", stage: "2nd Trimester", plan: "High Protein", adherence: 85, pregacare_id: "PGC-2024-001" },
    { id: 2, name: "Maria Garcia", stage: "Postpartum", plan: "Lactation Support", adherence: 92, pregacare_id: "PGC-2024-002" },
    { id: 3, name: "Emily Chen", stage: "1st Trimester", plan: "Morning Sickness", adherence: 78, pregacare_id: "PGC-2024-003" },
  ];

  const mealPlans = [
    { id: 1, name: "1st Trimester Nutrition", clients: 12, updated: "2 days ago" },
    { id: 2, name: "Postpartum Recovery", clients: 8, updated: "1 week ago" },
    { id: 3, name: "Lactation Support", clients: 15, updated: "3 days ago" },
  ];

  const handleCreateMealPlan = (patientId: string) => {
    setSelectedPatient(patientId);
    setShowMealPlanModal(true);
  };

  return (
    <DashboardLayout
      title="Pregacare Nutritionist Dashboard"
      user={user}
      onLogout={onLogout}
    >
      <div className="mb-6">
        <PregacareBranding variant="header" />
        <p className="text-sm text-muted-foreground mt-2">
          Manage nutrition plans for Pregacare ecosystem patients
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pregacare Patients"
          value={35}
          subtitle="Following diet plans"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Meal Plans Created"
          value={12}
          subtitle="This month"
          icon={BookOpen}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Avg. Adherence Rate"
          value="85%"
          subtitle="Client compliance"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Consultations"
          value={28}
          subtitle="This month"
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-wellness" />
              Pregacare Patients
            </CardTitle>
            <CardDescription>Monitor Pregacare ecosystem patient progress and adherence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-wellness rounded-full flex items-center justify-center">
                      <span className="text-wellness-foreground font-medium">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.stage} • {client.plan}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-wellness rounded-full transition-all"
                            style={{ width: `${client.adherence}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{client.adherence}%</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="wellness"
                    onClick={() => {
                      setSelectedPatientForMessage(client.pregacare_id);
                      setShowMessageModal(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Message Provider
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowMessageModal(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => alert('Viewing all Pregacare patients. In a real app, this would show the complete patient list.')}
              >
                View All Patients
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Meal Plans
            </CardTitle>
            <CardDescription>Manage and create nutrition plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mealPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <ChefHat className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">{plan.clients} clients • Updated {plan.updated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => alert(`Editing meal plan: ${plan.name}. In a real app, this would open the meal plan editor.`)}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => alert('Creating new meal plan. In a real app, this would open the meal plan creation interface.')}
            >
              Create New Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Communications Section */}
      <div className="mt-8">
        <Tabs defaultValue="communications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="communications">Provider Messages</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="communications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Provider Communications
                  {communications.filter(c => !c.read_at).length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {communications.filter(c => !c.read_at).length} New
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Messages and notes from doctors and other providers about your patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commLoading ? (
                  <div className="text-center py-8">Loading communications...</div>
                ) : (
                  <CommunicationPanel
                    communications={communications}
                    onMarkAsRead={markAsRead}
                    onRespond={respondToMessage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="wellness" 
            className="h-20 flex-col gap-2"
            onClick={() => handleCreateMealPlan(activeClients[0]?.id.toString() || "")}
          >
            <ChefHat className="w-6 h-6" />
            Create Meal Plan
          </Button>
          <Button 
            variant="hero" 
            className="h-20 flex-col gap-2"
            onClick={() => alert(`Pregacare Nutrition Library:\n• 2,500+ pregnancy-safe recipes\n• Nutritional guidelines by trimester\n• Allergy management protocols\n• Cultural dietary adaptations\n• Supplement recommendations\n\nIn a real app, this would show the comprehensive nutrition database with interactive meal planning tools.`)}
          >
            <Apple className="w-6 h-6" />
            Nutrition Library
          </Button>
          <Button 
            variant="accent" 
            className="h-20 flex-col gap-2"
            onClick={() => alert(`Pregacare Patient Messages:\n• ${activeClients.length} active conversations\n• 94% average response rate\n• Automated meal reminders\n• Photo food logging\n• Emergency nutrition alerts\n\nIn a real app, this would show all client communications with smart categorization and quick responses.`)}
          >
            <MessageSquare className="w-6 h-6" />
            Client Messages
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              const totalAdherence = activeClients.reduce((sum, client) => sum + client.adherence, 0) / activeClients.length;
              alert(`Pregacare Nutrition Analytics:\n• Active Patients: ${activeClients.length}\n• Average Adherence: ${totalAdherence.toFixed(1)}%\n• Meal Plans Created: ${mealPlans.length}\n• Successful Outcomes: 96%\n• Patient Satisfaction: 4.8/5\n\nIn a real app, this would show detailed progress analytics with charts, trends, and outcome predictions.`);
            }}
          >
            <TrendingUp className="w-6 h-6" />
            Progress Reports
          </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <MealPlanModal
        isOpen={showMealPlanModal}
        onClose={() => setShowMealPlanModal(false)}
        patientId={selectedPatient}
        nutritionistId={user.id}
        onMealPlanCreated={() => {
          setShowMealPlanModal(false);
        }}
      />
      
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        patientId={selectedPatientForMessage}
        currentProviderRole="nutritionist"
        onSend={sendMessage}
      />
    </DashboardLayout>
  );
}