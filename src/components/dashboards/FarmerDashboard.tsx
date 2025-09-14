import React, { useState } from 'react';
import { MapPin, Camera, CheckCircle, AlertCircle, TrendingUp, Leaf } from 'lucide-react';
import { useBlockchain } from '../../hooks/useBlockchain';
import { CollectionEvent } from '../../types/blockchain';
import { MobileDataCapture } from '../MobileDataCapture';
import { ConservationTracker } from '../ConservationTracker';
import { SmartContractService } from '../../services/SmartContractService';
import { useToast } from '../../hooks/useToast';
import { AnimatedCard } from '../AnimatedCard';
import { LoadingSpinner } from '../LoadingSpinner';
import { NotificationService } from '../../services/NotificationService';

export function FarmerDashboard() {
  const { addCollectionEvent, collectionEvents } = useBlockchain();
  const { success, error, warning } = useToast();
  const [activeTab, setActiveTab] = useState<'collect' | 'history' | 'conservation'>('collect');
  const [isCollecting, setIsCollecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [newCollection, setNewCollection] = useState<Partial<CollectionEvent>>({
    species: 'Withania somnifera',
    initialQualityMetrics: {
      moisture: 0,
      visual_quality: 'good',
      estimated_yield: 0
    }
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewCollection(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
        },
        () => {
          // Fallback to demo location (Rajasthan)
          setNewCollection(prev => ({
            ...prev,
            lat: 26.5671,
            lng: 74.3571
          }));
        }
      );
    }
  };

  const validateCollection = async () => {
    if (!newCollection.lat || !newCollection.lng) return;

    const mockEvent: CollectionEvent = {
      batchId: `ASH-${Date.now()}`,
      lat: newCollection.lat,
      lng: newCollection.lng,
      timestamp: new Date().toISOString(),
      collectorId: 'farmer-coop-1',
      species: newCollection.species || 'Withania somnifera',
      initialQualityMetrics: newCollection.initialQualityMetrics!,
      photos: [],
      harvestingZone: 'Rajasthan Zone A',
      approved: false
    };

    const validation = await SmartContractService.validateCollectionEvent(mockEvent);
    setValidationResult(validation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const collection: CollectionEvent = {
      batchId: `ASH-${Date.now()}`,
      lat: newCollection.lat || 26.5671,
      lng: newCollection.lng || 74.3571,
      timestamp: new Date().toISOString(),
      collectorId: 'farmer-coop-1',
      species: newCollection.species || 'Withania somnifera',
      initialQualityMetrics: newCollection.initialQualityMetrics!,
      photos: [],
      harvestingZone: 'Rajasthan Zone A',
      approved: false
    };

    try {
      await addCollectionEvent(collection);
      success('Harvest Recorded', 'Collection event successfully added to blockchain!');
      
      // Add system notification
      NotificationService.addNotification({
        type: 'harvest_alert',
        title: 'Harvest Recorded',
        message: `New harvest collection for ${collection.species} added to blockchain`,
        priority: 'medium'
      });
      
      setIsCollecting(false);
      setValidationResult(null);
      setNewCollection({
        species: 'Withania somnifera',
        initialQualityMetrics: {
          moisture: 0,
          visual_quality: 'good',
          estimated_yield: 0
        }
      });
    } catch (error) {
      error('Harvest Failed', `${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedBatches = collectionEvents.filter(e => e.approved);
  const pendingBatches = collectionEvents.filter(e => !e.approved);
  const totalYield = collectionEvents.reduce((sum, e) => sum + e.initialQualityMetrics.estimated_yield, 0);

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard delay={0} className="p-6 animate-stagger-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Harvests</h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {collectionEvents.length}
          </p>
        </AnimatedCard>
        
        <AnimatedCard delay={100} className="p-6 animate-stagger-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Approved Batches</h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {approvedBatches.length}
          </p>
        </AnimatedCard>
        
        <AnimatedCard delay={200} className="p-6 animate-stagger-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Yield</h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {totalYield.toFixed(1)} kg
          </p>
        </AnimatedCard>

        <AnimatedCard delay={300} className="p-6 animate-stagger-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Quality Score</h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            98.5%
          </p>
        </AnimatedCard>
      </div>

      {/* Tab Navigation */}
      <AnimatedCard delay={400} className="animate-stagger-5">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'collect', label: 'Data Collection', icon: MapPin },
              { id: 'history', label: 'Harvest History', icon: CheckCircle },
              { id: 'conservation', label: 'Conservation', icon: Leaf }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm animate-smooth-hover ripple ${
                  activeTab === id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'collect' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Field Data Collection</h3>
                <button
                  onClick={() => setIsCollecting(true)}
                  className="btn-primary animate-elastic"
                >
                  New Harvest Collection
                </button>
              </div>

              {isCollecting && (
                <div className="border border-green-200 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 animate-slide-reveal glass-effect">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                        <select
                          value={newCollection.species}
                          onChange={(e) => setNewCollection(prev => ({ ...prev, species: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="Withania somnifera">Ashwagandha (Withania somnifera)</option>
                          <option value="Curcuma longa">Turmeric (Curcuma longa)</option>
                          <option value="Bacopa monnieri">Brahmi (Bacopa monnieri)</option>
                          <option value="Commiphora wightii">Guggul (Commiphora wightii)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Yield (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newCollection.initialQualityMetrics?.estimated_yield || ''}
                          onChange={(e) => setNewCollection(prev => ({
                            ...prev,
                            initialQualityMetrics: {
                              ...prev.initialQualityMetrics!,
                              estimated_yield: parseFloat(e.target.value) || 0
                            }
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moisture %</label>
                        <input
                          type="number"
                          step="0.1"
                          max="15"
                          value={newCollection.initialQualityMetrics?.moisture || ''}
                          onChange={(e) => setNewCollection(prev => ({
                            ...prev,
                            initialQualityMetrics: {
                              ...prev.initialQualityMetrics!,
                              moisture: parseFloat(e.target.value) || 0
                            }
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visual Quality</label>
                        <select
                          value={newCollection.initialQualityMetrics?.visual_quality}
                          onChange={(e) => setNewCollection(prev => ({
                            ...prev,
                            initialQualityMetrics: {
                              ...prev.initialQualityMetrics!,
                              visual_quality: e.target.value as any
                            }
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 animate-smooth-hover ripple"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Capture GPS</span>
                      </button>
                      
                      {newCollection.lat && newCollection.lng && (
                        <p className="text-sm text-gray-600">
                          📍 {newCollection.lat.toFixed(4)}, {newCollection.lng.toFixed(4)}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={validateCollection}
                      className="btn-secondary w-full animate-elastic"
                      disabled={!newCollection.lat || !newCollection.lng}
                    >
                      Validate Smart Contracts
                    </button>

                    {validationResult && (
                      <div className={`p-3 rounded-lg ${validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        {validationResult.valid ? (
                          <div>
                            <p className="text-sm text-green-700 font-medium mb-2">✅ Smart Contract Validation Passed</p>
                            <ul className="text-xs text-green-600 space-y-1">
                              {validationResult.enforcedRules.map((rule: string, index: number) => (
                                <li key={index}>• {rule}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-red-700 font-medium mb-2">❌ Smart Contract Validation Failed</p>
                            <ul className="text-xs text-red-600 space-y-1">
                              {validationResult.errors.map((error: string, index: number) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {validationResult.warnings.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-amber-700 font-medium mb-1">⚠️ Warnings:</p>
                            <ul className="text-xs text-amber-600 space-y-1">
                              {validationResult.warnings.map((warning: string, index: number) => (
                                <li key={index}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={!validationResult?.valid || isSubmitting}
                        className="flex-1 btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 animate-elastic"
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner size="sm" color="white" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit to Blockchain</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCollecting(false);
                          setValidationResult(null);
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 animate-smooth-hover ripple"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <MobileDataCapture />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Harvest History</h3>
              
              {collectionEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No harvests recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collectionEvents.map((event, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <p className="font-medium text-gray-800">{event.batchId}</p>
                            {event.approved ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{event.species}</p>
                          <p className="text-sm text-gray-500">
                            📍 {event.lat.toFixed(4)}, {event.lng.toFixed(4)} • {event.harvestingZone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {event.initialQualityMetrics.estimated_yield} kg
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className={`w-2 h-2 rounded-full ${
                              event.initialQualityMetrics.visual_quality === 'excellent' ? 'bg-green-600' :
                              event.initialQualityMetrics.visual_quality === 'good' ? 'bg-blue-600' :
                              event.initialQualityMetrics.visual_quality === 'fair' ? 'bg-amber-600' : 'bg-red-600'
                            }`}></span>
                            <span className="text-xs text-gray-500 capitalize">
                              {event.initialQualityMetrics.visual_quality}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'conservation' && <ConservationTracker />}
        </div>
      </AnimatedCard>
    </div>
  );
}