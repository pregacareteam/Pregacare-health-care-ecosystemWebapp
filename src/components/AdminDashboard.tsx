import React from 'react';
import ProductionAdminDashboard from './admin/ProductionAdminDashboard';

interface AdminDashboardProps {
  adminId?: string;
  adminName?: string;
}

// Clean Admin Dashboard Component (Production Ready)
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId, adminName }) => {
  return       <ProductionAdminDashboard />;
};

export default AdminDashboard;