import React, { useState, useEffect } from 'react';
import { MapPin, Camera, WifiOff, Wifi, Upload, AlertTriangle } from 'lucide-react';
import { MobileGeoService, GeolocationData } from '../services/MobileGeoService';
import { SmartContractService } from '../services/SmartContractService';
import { useBlockchain } from '../hooks/useBlockchain';
import { CollectionEvent } from '../types/blockchain';

export function MobileDataCapture() {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    species: 'Withania somnifera',
    harvestingZone: '',
    estimatedYield: 0,
    moisture: 0,
    visualQuality: 'good' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { addCollectionEvent } = useBlockchain();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const position = await MobileGeoService.getCurrentLocation();
      setLocation(position);
      
      // Auto-detect harvesting zone based on location
      if (position.lat >= 26.0 && position.lat <= 27.0 && position.lng >= 74.0 && position.lng <= 75.0) {
        setFormData(prev => ({ ...prev, harvestingZone: 'Rajasthan Zone A' }));
      } else if (position.lat >= 22.0 && position.lat <= 23.0 && position.lng >= 77.0 && position.lng <= 78.0) {
        setFormData(prev => ({ ...prev, harvestingZone: 'Madhya Pradesh Zone B' }));
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const validateBeforeSubmit = async () => {
    if (!location) return;

    const mockEvent: CollectionEvent = {
      batchId: `ASH-${Date.now()}`,
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date().toISOString(),
      collectorId: 'farmer-coop-1',
      species: formData.species,
      initialQualityMetrics: {
        moisture: formData.moisture,
        visual_quality: formData.visualQuality,
        estimated_yield: formData.estimatedYield
      },
      photos,
      harvestingZone: formData.harvestingZone,
      approved: false
    };

    const validation = await SmartContractService.validateCollectionEvent(mockEvent);
    setValidationResult(validation);
    return validation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    setIsSubmitting(true);
    
    try {
      const validation = await validateBeforeSubmit();
      
      if (!validation.valid) {
        alert('Validation failed: ' + validation.errors.join(', '));
        return;
      }

      const collectionEvent: CollectionEvent = {
        batchId: `ASH-${Date.now()}`,
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date().toISOString(),
        collectorId: 'farmer-coop-1',
        species: formData.species,
        initialQualityMetrics: {
          moisture: formData.moisture,
          visual_quality: formData.visualQuality,
          estimated_yield: formData.estimatedYield
        },
        photos,
        harvestingZone: formData.harvestingZone,
        approved: false
      };

      if (isOnline) {
        await addCollectionEvent(collectionEvent);
        alert('Collection event successfully recorded on blockchain!');
      } else {
        MobileGeoService.queueOfflineData('collection_event', collectionEvent);
        alert('Data saved locally. Will sync when connection is restored.');
      }

      // Reset form
      setFormData({
        species: 'Withania somnifera',
        harvestingZone: '',
        estimatedYield: 0,
        moisture: 0,
        visualQuality: 'good'
      });
      setPhotos([]);
      setValidationResult(null);

    } catch (error) {
      alert(`Submission failed: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // In real implementation, upload to IPFS or cloud storage
    setPhotos(prev => [...prev, ...files.map(f => f.name)]);
  };

  const syncOfflineData = async () => {
    try {
      await MobileGeoService.syncOfflineData();
      alert('Offline data synced successfully!');
    } catch (error) {
      alert('Sync failed: ' + error);
    }
  };

  const pendingCount = MobileGeoService.getPendingSyncCount();

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 m-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Field Data Capture</h2>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {!isOnline && pendingCount > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                {pendingCount} items pending sync
              </span>
            </div>
            <button
              onClick={syncOfflineData}
              disabled={!isOnline}
              className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 disabled:bg-gray-300"
            >
              Sync Now
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Display */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Location</span>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          {location ? (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-800 font-mono">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </span>
              <span className="text-xs text-gray-500">
                (±{location.accuracy}m)
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Acquiring GPS location...</p>
          )}
        </div>

        {/* Species Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
          <select
            value={formData.species}
            onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="Withania somnifera">Ashwagandha (Withania somnifera)</option>
            <option value="Curcuma longa">Turmeric (Curcuma longa)</option>
            <option value="Bacopa monnieri">Brahmi (Bacopa monnieri)</option>
            <option value="Commiphora wightii">Guggul (Commiphora wightii)</option>
          </select>
        </div>

        {/* Harvesting Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Harvesting Zone</label>
          <input
            type="text"
            value={formData.harvestingZone}
            onChange={(e) => setFormData(prev => ({ ...prev, harvestingZone: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Auto-detected from GPS"
            readOnly
          />
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Yield (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.estimatedYield || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedYield: parseFloat(e.target.value) || 0 }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moisture %</label>
            <input
              type="number"
              step="0.1"
              value={formData.moisture || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, moisture: parseFloat(e.target.value) || 0 }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visual Quality</label>
          <select
            value={formData.visualQuality}
            onChange={(e) => setFormData(prev => ({ ...prev, visualQuality: e.target.value as any }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Add Photos</span>
            </label>
            <span className="text-sm text-gray-500">{photos.length} photos</span>
          </div>
        </div>

        {/* Validation Preview */}
        {validationResult && (
          <div className={`p-3 rounded-lg ${validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h4 className="font-medium text-gray-800 mb-2">Smart Contract Validation</h4>
            {validationResult.valid ? (
              <div>
                <p className="text-sm text-green-700 mb-2">✅ All validations passed</p>
                <ul className="text-xs text-green-600 space-y-1">
                  {validationResult.enforcedRules.map((rule: string, index: number) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <p className="text-sm text-red-700 mb-2">❌ Validation failed</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {validationResult.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationResult.warnings.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-amber-700 mb-1">⚠️ Warnings:</p>
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
            type="button"
            onClick={validateBeforeSubmit}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all font-medium"
            disabled={!location || isSubmitting}
          >
            Validate
          </button>
          
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-2"
            disabled={!location || isSubmitting || !validationResult?.valid}
          >
            {isOnline ? <Upload className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'Submit to Blockchain' : 'Save Offline'}</span>
          </button>
        </div>
      </form>

      {/* Offline Queue Status */}
      {pendingCount > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {pendingCount} collection events pending sync
          </p>
        </div>
      )}
    </div>
  );
}