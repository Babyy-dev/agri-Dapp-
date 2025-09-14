import React, { useState } from 'react';
import { Leaf, LogOut, Menu, X, Settings, Bell, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PulsingDot } from './PulsingDot';
import { NotificationCenter } from './NotificationCenter';
import { NotificationService } from '../services/NotificationService';

interface HeaderProps {
  currentView: 'dashboard' | 'consumer';
  onViewChange: (view: 'dashboard' | 'consumer') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = NotificationService.getUnreadCount();

  return (
    <header className="bg-white shadow-lg border-b-4 border-green-600 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 rounded-full flex items-center justify-center shadow-lg neon-green floating animate-heartbeat animate-elastic">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text animate-fade-in-scale animate-breathe">AyurTrace</h1>
              <p className="text-sm text-gray-600 animate-slide-in-right animate-wave">Blockchain Botanical Traceability</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium animate-smooth-hover ripple magnetic ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg neon-green'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
              }`}
            >
              Organization Dashboard
            </button>
            <button
              onClick={() => onViewChange('consumer')}
              className={`px-4 py-2 rounded-lg font-medium animate-smooth-hover ripple magnetic ${
                currentView === 'consumer'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg neon-green'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
              }`}
            >
              Consumer Portal
            </button>
          </nav>

          {/* User Section */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-lg animate-smooth-hover relative animate-wave ripple"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full flex items-center justify-center animate-heartbeat neon-green">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 rounded-lg animate-smooth-hover magnetic ripple">
                <Settings className="w-5 h-5" />
              </button>

              {/* User Info */}
              <div className="text-right animate-fade-in-scale">
                <p className="font-medium text-gray-800 hover:gradient-text transition-all duration-300">{user.name}</p>
                <p className="text-sm text-gray-600 capitalize">
                  <span className="flex items-center space-x-1">
                    <PulsingDot color="green" size="sm" />
                    <span>{user.role} • {user.organizationId.replace('-', ' ')}</span>
                  </span>
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg animate-smooth-hover animate-elastic ripple"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-100 hover:to-slate-100 rounded-lg animate-smooth-hover magnetic ripple"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-lg animate-slide-up glass-effect">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <button
              onClick={() => {
                onViewChange('dashboard');
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium animate-smooth-hover ripple tilt ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white neon-green'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
              }`}
            >
              Organization Dashboard
            </button>
            <button
              onClick={() => {
                onViewChange('consumer');
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium animate-smooth-hover ripple tilt ${
                currentView === 'consumer'
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white neon-green'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
              }`}
            >
              Consumer Portal
            </button>
            
            {user && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4 animate-fade-in-scale">
                  <div>
                    <p className="font-medium text-gray-800 gradient-text">{user.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg transition-all duration-500 transform hover:scale-125 hover:rotate-12 animate-shake"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
}