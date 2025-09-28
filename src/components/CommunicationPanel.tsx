import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply, Clock, User, AlertTriangle, CheckCircle } from "lucide-react";
import { CommunicationLog } from "@/hooks/useCommunication";
import { format } from "date-fns";

interface CommunicationPanelProps {
  communications: CommunicationLog[];
  onMarkAsRead: (logId: string) => void;
  onRespond: (logId: string, response: string) => void;
}

export function CommunicationPanel({ communications, onMarkAsRead, onRespond }: CommunicationPanelProps) {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 1: return "bg-blue-500";
      case 2: return "bg-green-500"; 
      case 3: return "bg-orange-500";
      case 4: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityLabel = (priority?: number) => {
    switch (priority) {
      case 1: return "Low";
      case 2: return "Normal";
      case 3: return "High"; 
      case 4: return "Urgent";
      default: return "Normal";
    }
  };

  const handleRespond = (logId: string) => {
    if (responseText.trim()) {
      onRespond(logId, responseText);
      setResponseText("");
      setRespondingTo(null);
    }
  };

  const handleMarkAsRead = (logId: string) => {
    onMarkAsRead(logId);
  };

  if (communications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No messages from other providers yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <Card key={comm.log_id} className={`transition-all ${!comm.read_at ? 'border-primary/50 bg-primary/5' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{comm.from_provider_role}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${getPriorityColor(comm.priority)} text-white text-xs`}
                >
                  {getPriorityLabel(comm.priority)}
                  {comm.priority === 4 && <AlertTriangle className="w-3 h-3 ml-1" />}
                </Badge>
                {!comm.read_at && (
                  <Badge variant="default" className="text-xs">
                    New
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {format(new Date(comm.created_at), "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
            <CardTitle className="text-base">{comm.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`${expandedMessage === comm.log_id ? '' : 'line-clamp-2'}`}>
                <p className="text-sm leading-relaxed">{comm.message}</p>
              </div>
              
              {comm.message.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedMessage(
                    expandedMessage === comm.log_id ? null : comm.log_id
                  )}
                >
                  {expandedMessage === comm.log_id ? 'Show Less' : 'Show More'}
                </Button>
              )}

              {/* Response section */}
              {comm.response && (
                <div className="bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Your Response</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comm.responded_at!), "MMM d 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm">{comm.response}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                {!comm.read_at && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(comm.log_id)}
                  >
                    Mark as Read
                  </Button>
                )}
                
                {!comm.response && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setRespondingTo(
                      respondingTo === comm.log_id ? null : comm.log_id
                    )}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Respond
                  </Button>
                )}
              </div>

              {/* Response input */}
              {respondingTo === comm.log_id && (
                <div className="space-y-3 pt-3 border-t">
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(comm.log_id)}
                      disabled={!responseText.trim()}
                    >
                      Send Response
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}