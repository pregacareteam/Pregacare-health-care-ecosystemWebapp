import React from 'react';
import AdminDashboardClean from './admin/AdminDashboardClean';

interface AdminDashboardProps {
  adminId?: string;
  adminName?: string;
}

// Clean Admin Dashboard Component (Production Ready)
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId, adminName }) => {
  return <AdminDashboardClean />;
};

export default AdminDashboard;