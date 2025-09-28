import React from 'react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PregacareBranding } from '@/components/PregacareBranding';

const AdminPage: React.FC = () => {
  // In a real application, this would come from authentication
  const adminUser = {
    id: 'admin_001',
    name: 'System Administrator',
    email: 'admin@pregacare.com',
    role: 'admin'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Branding */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <PregacareBranding />
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <AdminDashboard 
          adminId={adminUser.id} 
          adminName={adminUser.name} 
        />
      </div>
    </div>
  );
};

export default AdminPage;