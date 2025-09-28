import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import { SetupPage } from "./pages/Setup";
import RoleAuth from "./pages/RoleAuth";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import DoctorDashboard from "./components/DoctorDashboard";
import ComingSoonDashboard from "./components/ComingSoonDashboard";
import RoleSelector from "./components/RoleSelector";
import { useNavigate } from "react-router-dom";

const queryClient = new QueryClient();

// Wrapper component to handle navigation
const RoleSelectorWrapper = () => {
  const navigate = useNavigate();
  
  const handleRoleSelect = (role: string) => {
    navigate(`/auth/${role}`);
  };
  
  return <RoleSelector onRoleSelect={handleRoleSelect} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleSelectorWrapper />} />
            <Route path="/auth/:role" element={<RoleAuth />} />
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/dashboard/radiologist" element={<ComingSoonDashboard role="Radiologist" />} />
            <Route path="/dashboard/lab_technician" element={<ComingSoonDashboard role="Lab Technician" />} />
            <Route path="/dashboard/nutritionist" element={<ComingSoonDashboard role="Nutritionist" />} />
            <Route path="/dashboard/therapist" element={<ComingSoonDashboard role="Therapist" />} />
            <Route path="/dashboard/yoga_instructor" element={<ComingSoonDashboard role="Yoga Instructor" />} />
            <Route path="/dashboard/pharmacy" element={<ComingSoonDashboard role="Pharmacy" />} />
            <Route path="/dashboard/food_service" element={<ComingSoonDashboard role="Food Service" />} />
            <Route path="/dashboard/community_manager" element={<ComingSoonDashboard role="Community Manager" />} />
            <Route path="/dashboard/patient" element={<ComingSoonDashboard role="Patient" />} />
            <Route path="/dashboard/admin" element={<AdminPage />} />
            <Route path="/setup" element={<SetupPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
