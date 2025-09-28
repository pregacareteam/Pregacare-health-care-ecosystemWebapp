import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, AlertTriangle, Clock } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  currentProviderRole: string;
  onSend: (messageData: any) => void;
}

export function MessageModal({ isOpen, onClose, patientId, currentProviderRole, onSend }: MessageModalProps) {
  const [toProviderRole, setToProviderRole] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("2");

  const providerRoles = [
    { value: "doctor", label: "Doctor", description: "Medical consultations and prescriptions" },
    { value: "nutritionist", label: "Nutritionist", description: "Diet plans and nutrition guidance" },
    { value: "therapist", label: "Therapist", description: "Mental health and counseling" },
    { value: "yoga", label: "Yoga Trainer", description: "Yoga sessions and exercises" },
    { value: "food_partner", label: "Food Partner", description: "Meal delivery coordination" }
  ].filter(role => role.value !== currentProviderRole);

  const priorityLevels = [
    { value: "1", label: "Low", color: "bg-blue-500" },
    { value: "2", label: "Normal", color: "bg-green-500" },
    { value: "3", label: "High", color: "bg-orange-500" },
    { value: "4", label: "Urgent", color: "bg-red-500" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!toProviderRole || !subject || !message) {
      return;
    }

    onSend({
      patient_id: patientId,
      to_provider_role: toProviderRole,
      subject,
      message,
      priority: parseInt(priority)
    });

    // Reset form
    setToProviderRole("");
    setSubject("");
    setMessage("");
    setPriority("2");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Send Provider Message
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* To Provider */}
          <div>
            <Label htmlFor="to_provider">Send To</Label>
            <Select value={toProviderRole} onValueChange={setToProviderRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider type" />
              </SelectTrigger>
              <SelectContent>
                {providerRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${level.color}`} />
                      {level.label}
                      {level.value === "4" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of the message topic"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed message for the provider..."
              rows={4}
              required
            />
          </div>

          {/* Preview */}
          {(toProviderRole || subject || message) && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Message Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {toProviderRole && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      To: {providerRoles.find(r => r.value === toProviderRole)?.label}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`${priorityLevels.find(p => p.value === priority)?.color} text-white`}
                    >
                      {priorityLevels.find(p => p.value === priority)?.label} Priority
                    </Badge>
                  </div>
                )}
                {subject && <p className="font-medium text-sm">{subject}</p>}
                {message && <p className="text-sm text-muted-foreground">{message}</p>}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!toProviderRole || !subject || !message}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}