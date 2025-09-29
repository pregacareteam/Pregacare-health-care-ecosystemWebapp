import React from 'react';
import ProductionAdminDashboard from '@/components/admin/ProductionAdminDashboard';

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProductionAdminDashboard />
    </div>
  );
};

export default AdminPage;