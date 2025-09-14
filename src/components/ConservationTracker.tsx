import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { SmartContractService } from '../services/SmartContractService';

export function ConservationTracker() {
  const [conservationData, setConservationData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);

  useEffect(() => {
    loadConservationData();
    loadPredictions();
  }, []);

  const loadConservationData = async () => {
    const data = await SmartContractService.getConservationStatus(
      'Withania somnifera',
      'Rajasthan Zone A'
    );
    setConservationData(data);
  };

  const loadPredictions = async () => {
    const pred = await SmartContractService.predictHarvestWindow(
      'Withania somnifera',
      { lat: 26.5671, lng: 74.3571 }
    );
    setPredictions(pred);
  };

  if (!conservationData || !predictions) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const dailyUsagePercent = (conservationData.dailyHarvestUsed / conservationData.dailyHarvestLimit) * 100;
  const seasonalUsagePercent = (conservationData.seasonalHarvestUsed / conservationData.seasonalHarvestLimit) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <Leaf className="w-6 h-6 text-green-600" />
          <span>Conservation Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Harvest Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Daily Harvest Usage</span>
              <span className="text-sm text-gray-600">
                {conservationData.dailyHarvestUsed}kg / {conservationData.dailyHarvestLimit}kg
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  dailyUsagePercent > 90 ? 'bg-red-600' :
                  dailyUsagePercent > 70 ? 'bg-amber-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(dailyUsagePercent, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {dailyUsagePercent.toFixed(1)}% of daily quota used
            </p>
          </div>

          {/* Seasonal Harvest Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Seasonal Usage</span>
              <span className="text-sm text-gray-600">
                {conservationData.seasonalHarvestUsed}kg / {conservationData.seasonalHarvestLimit}kg
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  seasonalUsagePercent > 90 ? 'bg-red-600' :
                  seasonalUsagePercent > 70 ? 'bg-amber-600' : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(seasonalUsagePercent, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {seasonalUsagePercent.toFixed(1)}% of seasonal quota used
            </p>
          </div>
        </div>

        {/* Plant Population Health */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800">Plant Population Health</span>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-600">
                {conservationData.plantPopulationHealth}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Ecosystem health indicators show sustainable harvesting practices
          </p>
        </div>
      </div>

      {/* Harvest Predictions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <span>Harvest Planning</span>
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Next Optimal Harvest Window</h4>
            <p className="text-lg font-semibold text-blue-600">
              {new Date(predictions.nextOptimalHarvest).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Estimated yield: {predictions.estimatedYield}kg
            </p>
          </div>

          {predictions.riskFactors.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Risk Factors</span>
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {predictions.riskFactors.map((risk: string, index: number) => (
                  <li key={index}>• {risk}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
            <ul className="text-sm text-green-700 space-y-1">
              {predictions.recommendations.map((rec: string, index: number) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}