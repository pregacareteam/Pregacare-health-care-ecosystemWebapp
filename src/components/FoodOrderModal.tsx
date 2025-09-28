import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FoodPartner {
  partner_id: string;
  users: {
    name: string;
    email: string;
  };
}

interface DietPlan {
  plan_id: string;
  nutritionists: {
    users: {
      name: string;
    };
  };
}

interface FoodOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onOrderPlaced: () => void;
}

export function FoodOrderModal({ 
  isOpen, 
  onClose, 
  patientId,
  onOrderPlaced 
}: FoodOrderModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [foodPartners, setFoodPartners] = useState<FoodPartner[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedDietPlan, setSelectedDietPlan] = useState("");
  const [mealType, setMealType] = useState("");

  const mealTypes = [
    "breakfast",
    "morning_snack", 
    "lunch",
    "afternoon_snack",
    "dinner",
    "evening_snack"
  ];

  useEffect(() => {
    if (isOpen) {
      fetchFoodPartners();
      fetchDietPlans();
    }
  }, [isOpen, patientId]);

  const fetchFoodPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('food_delivery_partners')
        .select(`
          partner_id,
          users!food_delivery_partners_partner_id_fkey (
            name,
            email
          )
        `)
        .eq('availability_status', true);

      if (error) throw error;
      setFoodPartners(data || []);
    } catch (error) {
      console.error('Error fetching food partners:', error);
    }
  };

  const fetchDietPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select(`
          plan_id,
          nutritionists!diet_plans_nutritionist_id_fkey (
            users!nutritionists_nutritionist_id_fkey (
              name
            )
          )
        `)
        .eq('patient_id', patientId);

      if (error) throw error;
      setDietPlans(data || []);
    } catch (error) {
      console.error('Error fetching diet plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPartner || !mealType) {
      toast({
        title: "Error",
        description: "Please select a food partner and meal type.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        patient_id: patientId,
        partner_id: selectedPartner,
        meal_type: mealType,
        dietary_plan_id: selectedDietPlan || null,
        delivery_status: 'pending' as const,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('food_orders')
        .insert([orderData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Food order placed successfully.",
      });

      // Reset form
      setSelectedPartner("");
      setSelectedDietPlan("");
      setMealType("");
      
      onOrderPlaced();
      onClose();
    } catch (error) {
      console.error('Error placing food order:', error);
      toast({
        title: "Error",
        description: "Failed to place food order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Food</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Type */}
          <div>
            <Label htmlFor="meal_type">Meal Type *</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Diet Plan */}
          {dietPlans.length > 0 && (
            <div>
              <Label htmlFor="diet_plan">Based on Diet Plan (Optional)</Label>
              <Select value={selectedDietPlan} onValueChange={setSelectedDietPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select diet plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific diet plan</SelectItem>
                  {dietPlans.map((plan) => (
                    <SelectItem key={plan.plan_id} value={plan.plan_id}>
                      Plan by {plan.nutritionists?.users?.name || 'Nutritionist'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Food Partner */}
          <div>
            <Label htmlFor="food_partner">Food Delivery Partner *</Label>
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Select delivery partner" />
              </SelectTrigger>
              <SelectContent>
                {foodPartners.map((partner) => (
                  <SelectItem key={partner.partner_id} value={partner.partner_id}>
                    {partner.users?.name || 'Food Partner'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {foodPartners.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                No food delivery partners are currently available in your area. 
                Please try again later or contact support.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Your order will be prepared according to your dietary requirements and pregnancy nutrition guidelines.
              Delivery typically takes 30-45 minutes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || foodPartners.length === 0}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}