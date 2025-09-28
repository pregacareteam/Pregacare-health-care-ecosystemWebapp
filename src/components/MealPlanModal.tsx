import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MealPlan {
  breakfast: string;
  morning_snack: string;
  lunch: string;
  afternoon_snack: string;
  dinner: string;
  evening_snack: string;
}

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  nutritionistId: string;
  onMealPlanCreated: () => void;
}

export function MealPlanModal({ 
  isOpen, 
  onClose, 
  patientId,
  nutritionistId,
  onMealPlanCreated 
}: MealPlanModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    breakfast: "",
    morning_snack: "",
    lunch: "",
    afternoon_snack: "",
    dinner: "",
    evening_snack: ""
  });
  const [notes, setNotes] = useState("");
  const [planType, setPlanType] = useState("weekly");

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'morning_snack', label: 'Morning Snack' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'afternoon_snack', label: 'Afternoon Snack' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'evening_snack', label: 'Evening Snack' }
  ];

  const updateMealPlan = (mealType: keyof MealPlan, value: string) => {
    setMealPlan(prev => ({
      ...prev,
      [mealType]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least breakfast, lunch, and dinner are filled
    const requiredMeals = ['breakfast', 'lunch', 'dinner'] as (keyof MealPlan)[];
    const hasRequiredMeals = requiredMeals.every(meal => mealPlan[meal].trim());

    if (!hasRequiredMeals) {
      toast({
        title: "Error",
        description: "Please fill in at least breakfast, lunch, and dinner.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dietPlanData = {
        patient_id: patientId,
        nutritionist_id: nutritionistId,
        meal_schedule: mealPlan,
        notes: notes || null
      };

      const { error } = await supabase
        .from('diet_plans')
        .insert([{
          patient_id: patientId,
          nutritionist_id: nutritionistId,
          meal_schedule: mealPlan as any,
          notes: notes || null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meal plan created successfully.",
      });

      // Reset form
      setMealPlan({
        breakfast: "",
        morning_snack: "",
        lunch: "",
        afternoon_snack: "",
        dinner: "",
        evening_snack: ""
      });
      setNotes("");
      setPlanType("weekly");
      
      onMealPlanCreated();
      onClose();
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to create meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Meal Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Type */}
          <div>
            <Label htmlFor="plan_type">Plan Type</Label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Plan</SelectItem>
                <SelectItem value="weekly">Weekly Plan</SelectItem>
                <SelectItem value="monthly">Monthly Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meal Schedule */}
          <div>
            <Label className="text-base font-medium mb-4 block">Meal Schedule</Label>
            <div className="space-y-4">
              {mealTypes.map(({ key, label }) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-sm font-medium">
                    {label} {['breakfast', 'lunch', 'dinner'].includes(key) && '*'}
                  </Label>
                  <Textarea
                    id={key}
                    value={mealPlan[key as keyof MealPlan]}
                    onChange={(e) => updateMealPlan(key as keyof MealPlan, e.target.value)}
                    placeholder={`Describe ${label.toLowerCase()} recommendations...`}
                    rows={2}
                    className="mt-1"
                    required={['breakfast', 'lunch', 'dinner'].includes(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Guidelines */}
          <div>
            <Label htmlFor="notes">Additional Notes & Guidelines</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Include any dietary restrictions, allergies, nutritional goals, or special instructions..."
              rows={4}
            />
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Nutrition Tips for Pregnancy:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include folate-rich foods (leafy greens, fortified cereals)</li>
              <li>• Ensure adequate calcium intake (dairy, almonds, sardines)</li>
              <li>• Include iron-rich foods (lean meat, beans, spinach)</li>
              <li>• Stay hydrated with plenty of water</li>
              <li>• Limit caffeine and avoid alcohol</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Meal Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}