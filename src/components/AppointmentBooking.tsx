import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Phone,
  User,
  Star,
  CheckCircle,
  ArrowLeft,
  Stethoscope,
  Heart
} from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";

// Mock data - will be replaced with Supabase data
const mockDoctors = [
  {
    id: "1",
    name: "Dr. Sarah Wilson",
    specialization: "Obstetrician & Gynecologist",
    experience: "15 years",
    rating: 4.9,
    reviews: 127,
    avatar: null,
    nextAvailable: "Today 2:30 PM",
    consultationFee: 200,
    bio: "Specializing in high-risk pregnancies and prenatal care. Board certified with over 15 years of experience."
  },
  {
    id: "2", 
    name: "Dr. Michael Chen",
    specialization: "Maternal-Fetal Medicine",
    experience: "12 years",
    rating: 4.8,
    reviews: 98,
    avatar: null,
    nextAvailable: "Tomorrow 10:00 AM",
    consultationFee: 250,
    bio: "Expert in fetal ultrasound and genetic counseling. Fellowship trained in maternal-fetal medicine."
  }
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

const appointmentTypes = [
  { id: "video", label: "Video Consultation", icon: Video, description: "Online consultation from home", price: 0 },
  { id: "in_person", label: "In-Person Visit", icon: MapPin, description: "Visit the clinic", price: 0 },
  { id: "phone", label: "Phone Consultation", icon: Phone, description: "Audio call consultation", price: -50 }
];

interface AppointmentBookingProps {
  onClose?: () => void;
  preselectedDoctor?: string;
}

export const AppointmentBooking = ({ onClose, preselectedDoctor }: AppointmentBookingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(preselectedDoctor || "");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("video");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const selectedDoctorData = mockDoctors.find(doc => doc.id === selectedDoctor);
  const selectedTypeData = appointmentTypes.find(type => type.id === selectedType);

  const handleBookAppointment = async () => {
    setIsBooking(true);
    
    // Simulate API call - will be replaced with Supabase
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here we'll create the database tables and insert the appointment
    console.log("Booking appointment:", {
      doctorId: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: selectedType,
      notes
    });
    
    setIsBooking(false);
    setCurrentStep(4); // Success step
  };

  const renderDoctorSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Doctor</h2>
        <p className="text-gray-600">Select a healthcare provider for your appointment</p>
      </div>
      
      <div className="space-y-4">
        {mockDoctors.map((doctor) => (
          <Card 
            key={doctor.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDoctor === doctor.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedDoctor(doctor.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Stethoscope className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{doctor.consultationFee}</p>
                      <p className="text-xs text-gray-500">per session</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({doctor.reviews} reviews)</span>
                    </div>
                    <Badge variant="secondary">{doctor.experience}</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{doctor.bio}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Next available: {doctor.nextAvailable}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAppointmentType = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Type</h2>
        <p className="text-gray-600">How would you like to consult with {selectedDoctorData?.name}?</p>
      </div>
      
      <div className="grid gap-4">
        {appointmentTypes.map((type) => {
          const Icon = type.icon;
          const finalPrice = (selectedDoctorData?.consultationFee || 0) + type.price;
          
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedType === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{finalPrice}</p>
                    {type.price !== 0 && (
                      <p className="text-xs text-gray-500">
                        {type.price > 0 ? `+₹${type.price}` : `₹${type.price} discount`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose your preferred appointment slot</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Choose Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
              className="w-full"
            />
          </CardContent>
        </Card>
        
        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Available Times
            </CardTitle>
            <CardDescription>
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes (Optional)</CardTitle>
          <CardDescription>
            Share any specific concerns or symptoms you'd like to discuss
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe your symptoms, concerns, or any questions you have..."
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Appointment</h2>
        <p className="text-gray-600">Please confirm the details below</p>
      </div>
      
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          {/* Doctor Info */}
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <Stethoscope className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{selectedDoctorData?.name}</h3>
              <p className="text-sm text-gray-600">{selectedDoctorData?.specialization}</p>
            </div>
          </div>
          
          {/* Appointment Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</p>
                <p className="text-sm text-gray-600">Appointment Date</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">{selectedTime}</p>
                <p className="text-sm text-gray-600">Appointment Time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedTypeData && <selectedTypeData.icon className="w-5 h-5 text-gray-400" />}
              <div>
                <p className="font-medium">{selectedTypeData?.label}</p>
                <p className="text-sm text-gray-600">Consultation Type</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">₹{(selectedDoctorData?.consultationFee || 0) + (selectedTypeData?.price || 0)}</p>
                <p className="text-sm text-gray-600">Consultation Fee</p>
              </div>
            </div>
          </div>
          
          {notes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Your Notes:</p>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
        <p className="text-gray-600 mb-4">
          Your appointment has been successfully scheduled with {selectedDoctorData?.name}
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-800">
            📅 {format(selectedDate, 'EEEE, MMMM dd, yyyy')} at {selectedTime}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            You'll receive a confirmation email with meeting details shortly.
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button className="w-full" onClick={onClose}>
          Back to Dashboard
        </Button>
        <Button variant="outline" className="w-full">
          View My Appointments
        </Button>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedDoctor !== "";
      case 2: return selectedType !== "";
      case 3: return selectedDate && selectedTime !== "";
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
              <p className="text-gray-600">Schedule your consultation in a few simple steps</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        {currentStep < 4 && (
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="mb-8">
          {currentStep === 1 && renderDoctorSelection()}
          {currentStep === 2 && renderAppointmentType()}
          {currentStep === 3 && renderDateTimeSelection()}
          {currentStep === 4 && renderSuccess()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleBookAppointment}
                disabled={!canProceed() || isBooking}
              >
                {isBooking ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};