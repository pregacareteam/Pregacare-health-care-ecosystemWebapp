import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RoleSelector from "@/components/RoleSelector";
import { ArrowRight, Settings, Users, Heart, Calendar, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { testPregacareSystem } from "@/lib/testSystem";

const Index = () => {
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingSystem, setIsTestingSystem] = useState(false);

  const handleTestSystem = async () => {
    setIsTestingSystem(true);
    try {
      const result = await testPregacareSystem();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsTestingSystem(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    navigate(`/dashboard/${role}`);
  };

  return <RoleSelector onRoleSelect={handleRoleSelect} />;
};

export default Index;
