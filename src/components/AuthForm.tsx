import React, { useState } from 'react';
import { Leaf, Users, Building, FlaskConical, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

export function AuthForm() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    organization: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const organizations = [
    { id: 'farmer-coop-1', name: 'Rajasthan Farmer Cooperative', type: 'FarmerCoop', icon: Users },
    { id: 'processing-facility-1', name: 'Ayur Processing Ltd.', type: 'ProcessingFacility', icon: Building },
    { id: 'testing-lab-1', name: 'BioTest Laboratories', type: 'TestingLab', icon: FlaskConical },
    { id: 'manufacturer-1', name: 'HerbalLife Manufacturing', type: 'Manufacturer', icon: Package }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(credentials);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-100 animate-gradient particle-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-zoom-in interactive-card neon-green">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 floating animate-heartbeat neon-green">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2 animate-bounce-in">AyurTrace</h1>
            <p className="text-gray-600 animate-fade-in-scale">Blockchain Botanical Traceability</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Organization
              </label>
              <div className="grid grid-cols-1 gap-3">
                {organizations.map((org) => {
                  const IconComponent = org.icon;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setCredentials(prev => ({ ...prev, organization: org.id }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-500 text-left transform hover:scale-105 hover:-translate-y-1 ripple tilt ${
                        credentials.organization === org.id
                          ? 'border-green-600 bg-gradient-to-r from-green-50 to-emerald-50 neon-green'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-green-600 animate-pulse-slow" />
                        <div>
                          <p className="font-medium text-gray-800">{org.name}</p>
                          <p className="text-sm text-gray-600">{org.type}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg animate-shake">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!credentials.organization}
              className="w-full btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed magnetic"
            >
              Access Blockchain Network
            </button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg animate-fade-in-scale">
            <p className="text-xs text-gray-600 text-center">
              Demo credentials: Select any organization to access the permissioned blockchain network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}