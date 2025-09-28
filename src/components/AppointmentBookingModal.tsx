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

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  providerId?: string;
  onAppointmentBooked: () => void;
}

export function AppointmentBookingModal({ 
  isOpen, 
  onClose, 
  patientId,
  providerId,
  onAppointmentBooked 
}: AppointmentBookingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("video");
  const [notes, setNotes] = useState("");
  const [providerRole, setProviderRole] = useState<"doctor" | "nutritionist" | "therapist" | "yoga">("doctor");

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both date and time for the appointment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData = {
        patient_id: patientId,
        provider_id: providerId || patientId, // Use providerId if available, otherwise patientId for demo
        provider_role: providerRole as "doctor" | "nutritionist" | "therapist" | "yoga",
        date_time: appointmentDateTime.toISOString(),
        type: appointmentType,
        status: 'scheduled' as const,
        notes: notes || null
      };

      const { error } = await supabase
        .from('appointments_new')
        .insert([appointmentData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment booked successfully.",
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("");
      setAppointmentType("video");
      setNotes("");
      setProviderRole("doctor");
      
      onAppointmentBooked();
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
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
          <DialogTitle>Book New Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider Type */}
          <div>
            <Label htmlFor="provider_role">Provider Type</Label>
            <Select value={providerRole} onValueChange={(value) => setProviderRole(value as "doctor" | "nutritionist" | "therapist" | "yoga")}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nutritionist">Nutritionist</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="yoga">Yoga Instructor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div>
            <Label>Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select appointment date"}
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
            <Label htmlFor="time">Appointment Time</Label>
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

          {/* Appointment Type */}
          <div>
            <Label htmlFor="type">Appointment Type</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes or concerns..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}