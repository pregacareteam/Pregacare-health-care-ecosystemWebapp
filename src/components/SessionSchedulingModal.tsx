import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SessionSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  providerId: string;
  sessionType: "therapy" | "yoga";
  onSessionScheduled: () => void;
}

export function SessionSchedulingModal({ 
  isOpen, 
  onClose, 
  patientId,
  providerId,
  sessionType,
  onSessionScheduled 
}: SessionSchedulingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [mode, setMode] = useState("video");
  const [specificType, setSpecificType] = useState("");
  const [notes, setNotes] = useState("");

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const therapyTypes = [
    "individual_counseling",
    "group_therapy", 
    "cognitive_behavioral_therapy",
    "mindfulness_therapy",
    "stress_management",
    "anxiety_therapy",
    "depression_therapy",
    "prenatal_counseling"
  ];

  const yogaTypes = [
    "prenatal_yoga",
    "postnatal_yoga",
    "gentle_yoga",
    "meditation",
    "breathing_exercises",
    "restorative_yoga",
    "chair_yoga",
    "strength_training"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !specificType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const sessionDateTime = new Date(selectedDate);
      sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const sessionData = {
        patient_id: patientId,
        session_date: sessionDateTime.toISOString(),
        session_type: specificType,
        mode: mode,
        notes: notes || null
      };

      let error;
      
      if (sessionType === "therapy") {
        const { error: therapyError } = await supabase
          .from("therapy_sessions")
          .insert([{
            ...sessionData,
            therapist_id: providerId
          }]);
        error = therapyError;
      } else {
        const { error: yogaError } = await supabase
          .from("yoga_sessions")
          .insert([{
            ...sessionData,
            trainer_id: providerId
          }]);
        error = yogaError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `${sessionType === "therapy" ? "Therapy" : "Yoga"} session scheduled successfully.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("");
      setMode("video");
      setSpecificType("");
      setNotes("");
      
      onSessionScheduled();
      onClose();
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast({
        title: "Error",
        description: "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Schedule {sessionType === "therapy" ? "Therapy" : "Yoga"} Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Type */}
          <div>
            <Label htmlFor="session_type">
              {sessionType === "therapy" ? "Therapy" : "Yoga"} Type
            </Label>
            <Select value={specificType} onValueChange={setSpecificType}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${sessionType} type`} />
              </SelectTrigger>
              <SelectContent>
                {(sessionType === "therapy" ? therapyTypes : yogaTypes).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div>
            <Label>Session Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select session date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div>
            <Label htmlFor="time">Session Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode */}
          <div>
            <Label htmlFor="mode">Session Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select session mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Any specific notes for this ${sessionType} session...`}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}