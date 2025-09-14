import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { ConsumerPortal } from './components/ConsumerPortal';
import { BlockchainProvider } from './context/BlockchainContext';
import { AuthProvider } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';

function AppContent() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'consumer'>('dashboard');
  const { user } = useAuth();
  const { toasts, removeToast } = useToast();

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-100">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="container mx-auto px-4 py-8 animate-fade-in-up">
        {currentView === 'dashboard' ? (
          <OrganizationDashboard />
        ) : (
          <ConsumerPortal />
        )}
      </main>
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <AppContent />
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;