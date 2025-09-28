import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface PregacareBrandingProps {
  variant?: 'header' | 'badge' | 'footer';
  className?: string;
}

export function PregacareBranding({ variant = 'badge', className = '' }: PregacareBrandingProps) {
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-medium text-primary">Pregacare Ecosystem</span>
        <Badge variant="outline" className="text-xs">
          Verified Provider
        </Badge>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`text-center p-3 bg-primary/5 border-t border-primary/20 ${className}`}>
        <p className="text-xs text-muted-foreground">
          <Shield className="w-4 h-4 inline mr-1" />
          Exclusive Pregacare ecosystem for verified healthcare providers and registered patients
        </p>
      </div>
    );
  }

  // Default badge variant
  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
      <Shield className="w-3 h-3" />
      Pregacare Ecosystem
    </Badge>
  );
}