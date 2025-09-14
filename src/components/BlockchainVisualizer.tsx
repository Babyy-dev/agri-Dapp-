import React, { useState, useEffect } from 'react';
import { Link, Database, Shield, Clock, Activity, Users } from 'lucide-react';
import { useBlockchain } from '../hooks/useBlockchain';
import { BlockchainAPI, NetworkStatus } from '../services/BlockchainAPI';
import { AnimatedCard } from './AnimatedCard';
import { PulsingDot } from './PulsingDot';

export function BlockchainVisualizer() {
  const { collectionEvents, processingSteps, qualityTests } = useBlockchain();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  useEffect(() => {
    loadNetworkStatus();
    const interval = setInterval(loadNetworkStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNetworkStatus = async () => {
    try {
      const status = await BlockchainAPI.getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error('Failed to load network status:', error);
    }
  };

  const totalTransactions = collectionEvents.length + processingSteps.length + qualityTests.length;

  const recentTransactions = [
    ...collectionEvents.map(e => ({ 
      ...e, 
      type: 'Collection Event', 
      color: 'bg-green-600',
      icon: '🌱',
      description: `Harvest: ${e.species} (${e.initialQualityMetrics.estimated_yield}kg)`
    })),
    ...processingSteps.map(p => ({ 
      ...p, 
      type: 'Processing Step', 
      color: 'bg-blue-600',
      icon: '⚙️',
      description: `${p.stepType} processing`
    })),
    ...qualityTests.map(t => ({ 
      ...t, 
      type: 'Quality Test', 
      color: 'bg-purple-600',
      icon: '🔬',
      description: `${t.testType} test - ${t.result}`
    }))
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  if (!networkStatus) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
          <Link className="w-6 h-6 text-blue-600" />
          <span>Blockchain Network Dashboard</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <PulsingDot color="green" />
          <span className="text-sm font-medium text-green-600">Network Active</span>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-800">Blocks</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{networkStatus.totalBlocks}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-800">Transactions</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{networkStatus.totalTransactions}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-800">Block Time</span>
          </div>
          <p className="text-lg font-bold text-purple-600">{networkStatus.averageBlockTime}s</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-800">Consensus</span>
          </div>
          <p className="text-lg font-semibold text-amber-600">{networkStatus.consensusType}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-gray-800">Active Nodes</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">{networkStatus.activeNodes}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Health</span>
          </div>
          <p className="text-lg font-semibold text-green-600 capitalize">{networkStatus.networkHealth}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">Recent Blockchain Transactions</h4>
          <button
            onClick={() => setShowTransactionDetails(!showTransactionDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showTransactionDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions in blockchain yet</p>
              <p className="text-sm text-gray-400">Start by recording a harvest event</p>
            </div>
          ) : (
            recentTransactions.map((tx, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${tx.color} flex items-center justify-center text-white`}>
                    <span className="text-lg">{tx.icon}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">{tx.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500">Batch: {tx.batchId}</p>
                  
                  {showTransactionDetails && (
                    <div className="mt-2 p-2 bg-white rounded text-xs space-y-1">
                      <p><strong>Block:</strong> #{index + networkStatus.totalBlocks - recentTransactions.length + 1}</p>
                      <p><strong>Hash:</strong> 0x{Math.random().toString(16).substr(2, 16)}...</p>
                      <p><strong>Confirmations:</strong> {Math.floor(Math.random() * 10) + 1}</p>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <PulsingDot color="green" size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Blockchain Health Indicator */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg animate-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-800">Network Security Status</span>
          </div>
          <span className="text-sm text-green-600 font-medium">Secure & Operational</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          All transactions are cryptographically secured and distributed across {networkStatus.activeNodes} validator nodes. 
          Last block confirmed {new Date(networkStatus.lastBlockTimestamp).toLocaleTimeString()}.
        </p>
      </div>
    </AnimatedCard>
  );
}