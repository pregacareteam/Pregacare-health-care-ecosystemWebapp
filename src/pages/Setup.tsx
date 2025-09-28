import React from 'react';
import { DataInitializer } from '@/components/DataInitializer';
import { PregacareBranding } from '@/components/PregacareBranding';

export function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <PregacareBranding />
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">
            Welcome to Pregacare
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive pregnancy care ecosystem powered by local storage
          </p>
        </div>
        
        <DataInitializer />
      </div>
    </div>
  );
}