import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { SessionSchedulingModal } from "@/components/SessionSchedulingModal";
import { CommunicationPanel } from "@/components/CommunicationPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/roles";
import { useYogaData } from "@/hooks/useYogaData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar, 
  Play, 
  Clock,
  Heart,
  Video,
  Upload,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { PregacareBranding } from "@/components/PregacareBranding";

interface YogaDashboardProps {
  user: User;
  onLogout: () => void;
}

export function YogaDashboard({ user, onLogout }: YogaDashboardProps) {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const { user: authUser } = useAuth();
  const { sessions, communications, loading, scheduleSession } = useYogaData(authUser?.id || '');
  const { toast } = useToast();

  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.session_date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const handleSessionScheduled = async () => {
    toast({
      title: "Session Scheduled",
      description: "Yoga session has been scheduled successfully.",
    });
    setShowSessionModal(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout
      title="Pregacare Yoga & Fitness Dashboard"
      user={user}
      onLogout={onLogout}
    >
      <div className="mb-6">
        <PregacareBranding variant="header" />
        <p className="text-sm text-muted-foreground mt-2">
          Provide yoga and fitness sessions for Pregacare ecosystem patients
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pregacare Participants"
          value={sessions.length}
          subtitle="Total participants"
          icon={Users}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Today's Sessions"
          value={todaySessions.length}
          subtitle="Scheduled today"
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="New Messages"
          value={communications.filter(c => !c.read_at).length}
          subtitle="Provider communications"
          icon={MessageSquare}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Active Sessions"
          value={sessions.filter(s => new Date(s.session_date) > new Date()).length}
          subtitle="Upcoming yoga sessions"
          icon={BarChart3}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-wellness" />
              Today's Sessions
            </CardTitle>
            <CardDescription>Manage your scheduled classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sessions scheduled for today</p>
              ) : (
                todaySessions.slice(0, 3).map((session) => (
                  <div key={session.session_id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-wellness rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-wellness-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{session.session_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.session_date).toLocaleTimeString()} • {session.mode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="wellness"
                        onClick={() => toast({
                          title: "Joining Session",
                          description: `Starting yoga session: ${session.session_type}`
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
              onClick={() => setShowSessionModal(true)}
            >
              Schedule New Session
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
            variant="wellness" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Live Session", description: "Starting live broadcast" })}
          >
            <Video className="w-6 h-6" />
            Start Live Session
          </Button>
          <Button 
            variant="hero" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Upload Recording", description: "Opening video upload interface" })}
          >
            <Upload className="w-6 h-6" />
            Upload Recording
          </Button>
          <Button 
            variant="accent" 
            className="h-20 flex-col gap-2"
            onClick={() => setShowSessionModal(true)}
          >
            <Calendar className="w-6 h-6" />
            Schedule Class
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Analytics", description: "Viewing session analytics" })}
          >
            <BarChart3 className="w-6 h-6" />
            View Analytics
          </Button>
        </div>
      </div>

      {showSessionModal && (
        <SessionSchedulingModal
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          patientId=""
          providerId={authUser?.id || ''}
          sessionType="yoga"
          onSessionScheduled={handleSessionScheduled}
        />
      )}
    </DashboardLayout>
  );
}