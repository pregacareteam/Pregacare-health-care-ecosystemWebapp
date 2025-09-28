import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  Video,
  Plus,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Communication, User as UserType, Patient, Provider } from "@/types/pregacare";
import { pregacareDB } from "@/lib/storage";
import { format, formatDistanceToNow } from "date-fns";

interface CommunicationSectionProps {
  user: UserType;
}

export const CommunicationSection = ({ user }: CommunicationSectionProps) => {
  const [conversations, setConversations] = useState<{[key: string]: Communication[]}>({});
  const [contacts, setContacts] = useState<(Patient | Provider)[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
    loadContacts();
  }, [user]);

  const loadCommunications = () => {
    try {
      const allCommunications = pregacareDB.communications.getAll();
      
      // Group communications by conversation (between two users)
      const grouped: {[key: string]: Communication[]} = {};
      
      allCommunications
        .filter(comm => comm.senderId === user.id || comm.receiverId === user.id)
        .forEach(comm => {
          const otherUserId = comm.senderId === user.id ? comm.receiverId : comm.senderId;
          const conversationKey = [user.id, otherUserId].sort().join('-');
          
          if (!grouped[conversationKey]) {
            grouped[conversationKey] = [];
          }
          grouped[conversationKey].push(comm);
        });
      
      // Sort messages within each conversation by timestamp
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
      
      setConversations(grouped);
    } catch (error) {
      console.error('Failed to load communications:', error);
    }
  };

  const loadContacts = () => {
    setLoading(true);
    try {
      let userContacts: (Patient | Provider)[] = [];
      
      if (user.role === 'patient') {
        // Patient can message their assigned providers
        const patientData = pregacareDB.patients.getFiltered(p => p.userId === user.id)[0];
        if (patientData) {
          const providers = pregacareDB.providers.getAll();
          userContacts = providers.filter(provider => 
            provider.id === patientData.assignedProviders.doctorId ||
            provider.id === patientData.assignedProviders.nutritionistId ||
            provider.id === patientData.assignedProviders.yogaTrainerId ||
            provider.id === patientData.assignedProviders.therapistId
          );
        }
      } else {
        // Providers can message their assigned patients
        const patients = pregacareDB.patients.getAll();
        switch (user.role) {
          case 'doctor':
            userContacts = patients.filter(p => p.assignedProviders.doctorId === user.id);
            break;
          case 'nutritionist':
            userContacts = patients.filter(p => p.assignedProviders.nutritionistId === user.id);
            break;
          case 'yoga_trainer':
            userContacts = patients.filter(p => p.assignedProviders.yogaTrainerId === user.id);
            break;
          case 'therapist':
            userContacts = patients.filter(p => p.assignedProviders.therapistId === user.id);
            break;
        }
      }
      
      setContacts(userContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;
    
    const otherUserId = activeChat;
    
    const newMessage: Communication = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: otherUserId,
      type: 'message',
      title: 'Chat Message',
      content: message.trim(),
      isRead: false,
      isUrgent: false,
      attachments: [],
      createdAt: new Date().toISOString()
    };
    
    pregacareDB.communications.create(newMessage);
    setMessage('');
    loadCommunications(); // Refresh conversations
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId || c.userId === contactId);
    return contact?.name || 'Unknown';
  };

  const getContactInitials = (contactId: string) => {
    const name = getContactName(contactId);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getLastMessage = (conversationKey: string) => {
    const messages = conversations[conversationKey];
    return messages && messages.length > 0 ? messages[messages.length - 1] : null;
  };

  const getUnreadCount = (conversationKey: string) => {
    const messages = conversations[conversationKey] || [];
    return messages.filter(msg => !msg.isRead && msg.receiverId === user.id).length;
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const conversationList = Object.keys(conversations).map(conversationKey => {
    const otherUserId = conversationKey.split('-').find(id => id !== user.id) || '';
    const lastMessage = getLastMessage(conversationKey);
    const unreadCount = getUnreadCount(conversationKey);
    
    return {
      conversationKey,
      otherUserId,
      lastMessage,
      unreadCount,
      contactName: getContactName(otherUserId)
    };
  }).sort((a, b) => {
    if (!a.lastMessage && !b.lastMessage) return 0;
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {conversationList.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start messaging your {user.role === 'patient' ? 'healthcare team' : 'patients'}</p>
            </div>
          ) : (
            conversationList.map(({ conversationKey, otherUserId, lastMessage, unreadCount, contactName }) => (
              <div
                key={conversationKey}
                onClick={() => setActiveChat(otherUserId)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  activeChat === otherUserId ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs">
                      {getContactInitials(otherUserId)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm truncate">{contactName}</p>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(lastMessage.createdAt), 'MMM dd')}
                        </span>
                      )}
                    </div>
                    
                    {lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage.senderId === user.id ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  
                  {unreadCount > 0 && (
                    <Badge variant="default" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {getContactInitials(activeChat)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{getContactName(activeChat)}</h3>
                  <p className="text-sm text-gray-500">
                    {user.role === 'patient' ? 'Healthcare Provider' : 'Patient'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {conversations[`${[user.id, activeChat].sort().join('-')}`]?.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </span>
                      {msg.senderId === user.id && (
                        <CheckCircle2 className="w-3 h-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Start a conversation</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 min-h-[40px] max-h-32 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button onClick={sendMessage} disabled={!message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};