import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, Calendar, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PregacarePatient {
  pregacare_id: string;
  patient_user_id: string;
  status: string;
  package_subscription: boolean;
  registration_date: string;
}

interface PregacarePatientLookupProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientSelected: (patient: PregacarePatient) => void;
}

export function PregacarePatientLookup({ 
  isOpen, 
  onClose, 
  onPatientSelected 
}: PregacarePatientLookupProps) {
  const { toast } = useToast();
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<PregacarePatient | null>(null);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a Pregacare ID to search.",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('pregacare_patients')
        .select('*')
        .eq('pregacare_id', searchId.toUpperCase())
        .single();

      if (error || !data) {
        toast({
          title: "Patient Not Found",
          description: "No Pregacare patient found with this ID.",
          variant: "destructive",
        });
        setSearchResult(null);
      } else {
        setSearchResult(data);
        if (data.status !== 'active') {
          toast({
            title: "Patient Inactive",
            description: "This Pregacare patient is not currently active.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for patient. Please try again.",
        variant: "destructive",
      });
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = () => {
    if (searchResult && searchResult.status === 'active') {
      onPatientSelected(searchResult);
      onClose();
      setSearchId("");
      setSearchResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Pregacare Patient
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Search for patients registered in the Pregacare ecosystem.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search_id">Pregacare Patient ID</Label>
            <div className="flex gap-2">
              <Input
                id="search_id"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="PGC-2024-XXX"
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={!searchId.trim() || searching}
                variant="outline"
              >
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Search Result */}
          {searchResult && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-primary" />
                      <span className="font-medium">{searchResult.pregacare_id}</span>
                    </div>
                    <Badge variant={searchResult.status === 'active' ? 'default' : 'secondary'}>
                      {searchResult.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Registered: {new Date(searchResult.registration_date).toLocaleDateString()}
                  </div>

                  {searchResult.package_subscription && (
                    <Badge variant="outline" className="w-fit">
                      Package Subscriber
                    </Badge>
                  )}

                  {searchResult.status === 'active' ? (
                    <Button 
                      onClick={handleSelectPatient}
                      className="w-full"
                      variant="hero"
                    >
                      Add to My Care
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-2 bg-muted/50 rounded">
                      This patient is {searchResult.status} and cannot be added to your care.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Box */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Only active Pregacare ecosystem patients can be added to your care. 
              Patient registration is managed by Pregacare administrators.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}