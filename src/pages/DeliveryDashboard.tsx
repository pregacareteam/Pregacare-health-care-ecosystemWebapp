import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/roles";
import { useDeliveryData } from "@/hooks/useDeliveryData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  MapPin, 
  Clock, 
  Star,
  Truck,
  Navigation,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { PregacareBranding } from "@/components/PregacareBranding";

interface DeliveryDashboardProps {
  user: User;
  onLogout: () => void;
}

export function DeliveryDashboard({ user, onLogout }: DeliveryDashboardProps) {
  const { user: authUser } = useAuth();
  const { orders, stats, loading, updateOrderStatus } = useDeliveryData(authUser?.id || '');
  const { toast } = useToast();

  const activeOrders = orders.filter(order => 
    order.delivery_status === 'pending'
  );

  const completedOrders = orders.filter(order => 
    order.delivery_status === 'delivered'
  ).slice(0, 3);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prepared': return 'default';
      case 'picked_up': return 'secondary';
      case 'out_for_delivery': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'prepared': return 'Ready';
      case 'picked_up': return 'Picked Up';
      case 'out_for_delivery': return 'Delivering';
      default: return status;
    }
  };

  return (
    <DashboardLayout
      title="Pregacare Food Delivery Dashboard"
      user={user}
      onLogout={onLogout}
    >
      <div className="mb-6">
        <PregacareBranding variant="header" />
        <p className="text-sm text-muted-foreground mt-2">
          Deliver nutritious meals to Pregacare ecosystem patients
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Deliveries"
          value={stats.totalDeliveries}
          subtitle="Completed orders"
          icon={Package}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          subtitle="In progress"
          icon={Truck}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          subtitle="Customer feedback"
          icon={Star}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Today's Earnings"
          value={`$${stats.todayEarnings}`}
          subtitle="Total earned"
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Pregacare Orders
            </CardTitle>
            <CardDescription>Pregacare ecosystem patient orders ready for pickup and delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active orders</p>
              ) : (
                activeOrders.map((order) => (
                  <div key={order.order_id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{order.patient?.name || 'Patient'}</p>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {order.meal_type} meal
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ordered: {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(order.delivery_status)} className="text-xs">
                        {getStatusText(order.delivery_status)}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="accent"
                        onClick={() => toast({
                          title: "Navigation",
                          description: `Opening GPS navigation for ${order.patient?.name}`
                        })}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => alert('Refreshing orders. In a real app, this would fetch the latest delivery assignments.')}
            >
              Refresh Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-wellness" />
              Recent Deliveries
            </CardTitle>
            <CardDescription>Completed deliveries and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent deliveries</p>
              ) : (
                completedOrders.map((delivery) => (
                  <div key={delivery.order_id} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-wellness rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-wellness-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{delivery.patient?.name || 'Patient'}</p>
                        <p className="text-sm text-muted-foreground">
                          Delivered {new Date(delivery.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">4.9</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs font-medium text-wellness">${Math.floor(Math.random() * 20) + 15}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">
                      Completed
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => alert('Viewing all deliveries. In a real app, this would show your complete delivery history.')}
            >
              View All Deliveries
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="accent" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "GPS Navigation", description: "Opening navigation for current route" })}
          >
            <Navigation className="w-6 h-6" />
            GPS Navigation
          </Button>
          <Button 
            variant="hero" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Pickup Orders", description: "Showing orders ready for pickup" })}
          >
            <Package className="w-6 h-6" />
            Pickup Orders
          </Button>
          <Button 
            variant="wellness" 
            className="h-20 flex-col gap-2"
            onClick={() => {
              if (activeOrders.length > 0) {
                updateOrderStatus(activeOrders[0].order_id, 'delivered');
                toast({ title: "Order Delivered", description: "Order marked as delivered successfully" });
              } else {
                toast({ title: "No Active Orders", description: "No orders to mark as delivered" });
              }
            }}
          >
            <CheckCircle className="w-6 h-6" />
            Mark Delivered
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => toast({ title: "Earnings", description: `Today's earnings: $${stats.todayEarnings}` })}
          >
            <DollarSign className="w-6 h-6" />
            View Earnings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}