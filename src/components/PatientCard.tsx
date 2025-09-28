import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, MessageSquare, FileText, Calendar, AlertTriangle } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  pregnancy_stage: string;
  due_date: string;
  risk_status: 'normal' | 'medium' | 'high';
  profile_picture?: string;
  medical_history: any;
}

interface PatientCardProps {
  patient: Patient;
  onViewDetails: (patient: Patient) => void;
  onStartConsultation: (patient: Patient) => void;
  onScheduleAppointment: (patient: Patient) => void;
}

export function PatientCard({ patient, onViewDetails, onStartConsultation, onScheduleAppointment }: PatientCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getStageDisplay = (stage: string) => {
    switch (stage) {
      case 'first_trimester': return '1st Trimester';
      case 'second_trimester': return '2nd Trimester';
      case 'third_trimester': return '3rd Trimester';
      default: return stage;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDue(patient.due_date);

  return (
    <Card className="hover:shadow-soft transition-smooth border-l-4 border-l-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={patient.profile_picture} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">{getStageDisplay(patient.pregnancy_stage)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getRiskColor(patient.risk_status)} className="text-xs">
              {patient.risk_status.toUpperCase()}
            </Badge>
            {patient.risk_status === 'high' && (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-medium">{new Date(patient.due_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Days Left:</span>
            <span className={`font-medium ${daysLeft < 30 ? 'text-warning' : 'text-foreground'}`}>
              {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => onStartConsultation(patient)}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-1" />
            Consult
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onScheduleAppointment(patient)}
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(patient)}
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}