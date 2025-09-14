import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Navigation } from 'lucide-react';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'harvest' | 'processing' | 'testing' | 'manufacturing';
  title: string;
  description: string;
  timestamp: string;
}

interface InteractiveMapProps {
  points: MapPoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
  showTrajectory?: boolean;
}

export function InteractiveMap({ points, center, zoom = 6, showTrajectory = true }: InteractiveMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'roadmap'>('terrain');

  const defaultCenter = center || { lat: 26.0, lng: 76.0 };

  const getPointColor = (type: string) => {
    switch (type) {
      case 'harvest': return '#059669'; // green
      case 'processing': return '#0284C7'; // blue
      case 'testing': return '#7C3AED'; // purple
      case 'manufacturing': return '#EA580C'; // orange
      default: return '#6B7280'; // gray
    }
  };

  const getPointIcon = (type: string) => {
    switch (type) {
      case 'harvest': return '🌱';
      case 'processing': return '⚙️';
      case 'testing': return '🔬';
      case 'manufacturing': return '📦';
      default: return '📍';
    }
  };

  // Calculate map bounds to fit all points
  const calculateBounds = () => {
    if (points.length === 0) return null;

    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  };

  const bounds = calculateBounds();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <span>Traceability Journey Map</span>
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMapView('terrain')}
              className={`px-3 py-1 text-sm rounded ${mapView === 'terrain' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Terrain
            </button>
            <button
              onClick={() => setMapView('satellite')}
              className={`px-3 py-1 text-sm rounded ${mapView === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-96 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        {/* Map Container - In real implementation, use Google Maps or Mapbox */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">Interactive Map View</p>
            <p className="text-sm text-gray-500">
              Showing {points.length} locations in supply chain journey
            </p>
          </div>
        </div>

        {/* Simulated map points overlay */}
        <div className="absolute inset-0">
          {points.map((point, index) => {
            const x = ((point.lng - (bounds?.west || 74)) / ((bounds?.east || 78) - (bounds?.west || 74))) * 100;
            const y = 100 - ((point.lat - (bounds?.south || 22)) / ((bounds?.north || 28) - (bounds?.south || 22))) * 100;

            return (
              <div
                key={point.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                onClick={() => setSelectedPoint(point)}
              >
                <div 
                  className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: getPointColor(point.type) }}
                >
                  {index + 1}
                </div>
                
                {showTrajectory && index < points.length - 1 && (
                  <div className="absolute top-4 left-4 w-6 h-0.5 bg-gray-400 transform rotate-45"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{selectedPoint.title}</h4>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{selectedPoint.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>📍 {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}</span>
              <span>{new Date(selectedPoint.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {[
              { type: 'harvest', label: 'Harvest' },
              { type: 'processing', label: 'Processing' },
              { type: 'testing', label: 'Testing' },
              { type: 'manufacturing', label: 'Manufacturing' }
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getPointColor(type) }}
                ></div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Layers className="w-4 h-4" />
            <span>{mapView} view</span>
          </div>
        </div>
      </div>
    </div>
  );
}