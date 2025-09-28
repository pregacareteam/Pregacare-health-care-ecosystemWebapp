import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoodOrder {
  order_id: string;
  patient_id: string;
  meal_type: string;
  delivery_status: string;
  created_at: string;
  patient?: {
    name: string;
    address?: string;
  };
}

interface DeliveryStats {
  totalDeliveries: number;
  activeOrders: number;
  todayEarnings: number;
  averageRating: number;
}

export function useDeliveryData(partnerId: string) {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    activeOrders: 0,
    todayEarnings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('food_orders')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching food orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total deliveries
      const { count: totalCount } = await supabase
        .from('food_orders')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', partnerId)
        .eq('delivery_status', 'delivered');

      // Get active orders
      const { count: activeCount } = await supabase
        .from('food_orders')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', partnerId)
        .in('delivery_status', ['pending']);

      setStats({
        totalDeliveries: totalCount || 0,
        activeOrders: activeCount || 0,
        todayEarnings: Math.floor(Math.random() * 200) + 100, // Mock earnings
        averageRating: 4.8 + Math.random() * 0.2 // Mock rating
      });
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'cancelled' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('food_orders')
        .update({ delivery_status: status })
        .eq('order_id', orderId);

      if (error) throw error;
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (partnerId) {
      Promise.all([fetchOrders(), fetchStats()]).finally(() => {
        setLoading(false);
      });
    }
  }, [partnerId]);

  return {
    orders,
    stats,
    loading,
    updateOrderStatus,
    refetch: () => Promise.all([fetchOrders(), fetchStats()])
  };
}