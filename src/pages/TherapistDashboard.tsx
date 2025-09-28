import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { SessionSchedulingModal } from "@/components/SessionSchedulingModal";
import { CommunicationPanel } from "@/components/CommunicationPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/roles";
import { useTherapistData } from "@/hooks/useTherapistData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar, 
  Brain, 
  Clock,
  Shield,
  Video,
  FileText,
  Heart,
  MessageSquare
} from "lucide-react";
import { PregacareBranding } from "@/components/PregacareBranding";

interface TherapistDashboardProps {
  user: User;
  onLogout: () => void;
}

export function TherapistDashboard({ user, onLogout }: TherapistDashboardProps) {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const { user: authUser } = useAuth();
  const { sessions, communications, loading, scheduleSession } = useTherapistData(authUser?.id || '');
  const { toast } = useToast();

  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.session_date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const handleScheduleSession = (patientId: string) => {
    setSelectedPatient(patientId);
    setShowSessionModal(true);
  };

  const handleSessionScheduled = async () => {
    toast({
      title: "Session Scheduled",
      description: "Therapy session has been scheduled successfully.",
    });
    setShowSessionModal(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout
      title="Pregacare Therapist Dashboard"
      user={user}
      onLogout={onLogout}
    >
      <div className="mb-6">
        <PregacareBranding variant="header" />
        <p className="text-sm text-muted-foreground mt-2">
          Provide therapy services for Pregacare ecosystem patients
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pregacare Patients"
          value={sessions.length}
          subtitle="Total patients"
          icon={Users}
          trend={{ value: 6, isPositive: true }}
        />
        <StatCard
          title="Today's Sessions"
          value={todaySessions.length}
          subtitle="Scheduled today"
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="New Messages"
          value={communications.filter(c => !c.read_at).length}
          subtitle="Provider communications"
          icon={MessageSquare}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Active Cases"
          value={sessions.filter(s => new Date(s.session_date) > new Date()).length}
          subtitle="Ongoing therapy"
          icon={Heart}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Sessions
            </CardTitle>
            <CardDescription>Scheduled therapy appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sessions scheduled for today</p>
              ) : (
                todaySessions.slice(0, 3).map((session) => (
                  <div key={session.session_id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{session.patient?.name || 'Patient'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.session_date).toLocaleTimeString()} • {session.session_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => toast({
                          title: "Joining Session",
                          description: `Starting therapy session with ${session.patient?.name}`
                        })}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => alert('Viewing all appointments. In a real app, this would show the complete appointment schedule.')}
            >
              View All Appointments
            </Button>
          </CardContent>
        </Card>

        <CommunicationPanel
          communications={communications}
          onMarkAsRead={() => {}}
          onRespond={() => {}}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="hero" 
            className="h-20 flex-col gap-2"
            onClick={() => setShowSessionModal(true)}
          >
            <Video className="w-6 h-6" />
            Schedule Session
          </Button>
          <Button 
            variant="wellness" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Session Notes", description: "Opening session notes interface" })}
          >
            <FileText className="w-6 h-6" />
            Session Notes
          </Button>
          <Button 
            variant="accent" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Client Progress", description: "Viewing detailed progress tracking" })}
          >
            <Brain className="w-6 h-6" />
            Client Progress
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Confidential Files", description: "Accessing secure client files" })}
          >
            <Shield className="w-6 h-6" />
            Confidential Files
          </Button>
        </div>
      </div>

      {showSessionModal && (
        <SessionSchedulingModal
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          patientId={selectedPatient}
          providerId={authUser?.id || ''}
          sessionType="therapy"
          onSessionScheduled={handleSessionScheduled}
        />
      )}
    </DashboardLayout>
  );
}