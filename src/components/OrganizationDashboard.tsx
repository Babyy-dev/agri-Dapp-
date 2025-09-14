import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FarmerDashboard } from './dashboards/FarmerDashboard';
import { ProcessorDashboard } from './dashboards/ProcessorDashboard';
import { LabDashboard } from './dashboards/LabDashboard';
import { ManufacturerDashboard } from './dashboards/ManufacturerDashboard';
import { BlockchainVisualizer } from './BlockchainVisualizer';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ComplianceReporter } from './ComplianceReporter';

export function OrganizationDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'blockchain' | 'analytics' | 'compliance'>('dashboard');

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'farmer':
        return <FarmerDashboard />;
      case 'processor':
        return <ProcessorDashboard />;
      case 'lab_tech':
        return <LabDashboard />;
      case 'manufacturer':
        return <ManufacturerDashboard />;
      default:
        return <div>Role not recognized</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user.name}
          </h2>
          <p className="text-gray-600 capitalize">
            {user.role} • {user.organizationId}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'blockchain', label: 'Blockchain' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'compliance', label: 'Compliance' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 ripple magnetic ${
                activeView === id
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white shadow-lg neon-blue'
                  : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'blockchain' && (
        <div className="mb-8">
          <BlockchainVisualizer />
        </div>
      )}

      {activeView === 'analytics' && <AnalyticsDashboard />}
      {activeView === 'compliance' && <ComplianceReporter />}
      {activeView === 'dashboard' && renderDashboard()}
    </div>
  );
}