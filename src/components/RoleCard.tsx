import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  onSelect: () => void;
  selected?: boolean;
}

export function RoleCard({ title, description, icon: Icon, features, onSelect, selected }: RoleCardProps) {
  return (
    <Card className={`cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] ${
      selected ? 'ring-2 ring-primary shadow-medium' : 'hover:shadow-soft'
    }`} onClick={onSelect}>
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          variant={selected ? "default" : "role"} 
          className="w-full" 
          size="lg"
        >
          {selected ? "Selected" : "Select Role"}
        </Button>
      </CardContent>
    </Card>
  );
}