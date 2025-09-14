import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, Target, DollarSign, Leaf, Users, Globe } from 'lucide-react';
import { AnalyticsService, SupplyChainMetrics, PredictiveAnalytics, MarketData } from '../services/AnalyticsService';
import { AnimatedCard } from './AnimatedCard';
import { LoadingSpinner } from './LoadingSpinner';

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [analytics, setAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'market'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [metricsData, analyticsData, marketDataResult] = await Promise.all([
      AnalyticsService.getSupplyChainMetrics(),
      AnalyticsService.getPredictiveAnalytics(),
      AnalyticsService.getMarketData()
    ]);
    
    setMetrics(metricsData);
    setAnalytics(analyticsData);
    setMarketData(marketDataResult);
  };

  if (!metrics || !analytics || !marketData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Supply Chain Analytics</h2>
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'predictions', label: 'AI Predictions', icon: Target },
            { id: 'market', label: 'Market Data', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedCard delay={0} className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600">{metrics.totalBatches}</span>
              </div>
              <h3 className="font-semibold text-gray-800">Total Batches</h3>
              <p className="text-sm text-gray-600">Processed this season</p>
            </AnimatedCard>

            <AnimatedCard delay={100} className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{metrics.qualityPassRate}%</span>
              </div>
              <h3 className="font-semibold text-gray-800">Quality Pass Rate</h3>
              <p className="text-sm text-gray-600">Above industry average</p>
            </AnimatedCard>

            <AnimatedCard delay={200} className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-purple-600">{metrics.sustainabilityScore}%</span>
              </div>
              <h3 className="font-semibold text-gray-800">Sustainability Score</h3>
              <p className="text-sm text-gray-600">Conservation compliance</p>
            </AnimatedCard>

            <AnimatedCard delay={300} className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-amber-600">₹{(metrics.farmerPayments / 100000).toFixed(1)}L</span>
              </div>
              <h3 className="font-semibold text-gray-800">Farmer Payments</h3>
              <p className="text-sm text-gray-600">Direct to farmers</p>
            </AnimatedCard>
          </div>

          {/* Processing Time Chart */}
          <AnimatedCard delay={400} className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Efficiency</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Average Processing Time</span>
                <span className="text-sm text-blue-600 font-semibold">{metrics.averageProcessingTime} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-1000"
                  style={{ width: `${(30 - metrics.averageProcessingTime) / 30 * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">Target: &lt;20 days | Industry Average: 25 days</p>
            </div>
          </AnimatedCard>

          {/* Carbon Footprint */}
          <AnimatedCard delay={500} className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Environmental Impact</h3>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-semibold">{metrics.carbonFootprint} kg CO₂/kg</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">-23%</p>
                <p className="text-sm text-gray-600">Carbon Reduction</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">89%</p>
                <p className="text-sm text-gray-600">Renewable Energy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">156</p>
                <p className="text-sm text-gray-600">Trees Planted</p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Demand Forecast */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Demand Forecast</span>
            </h3>
            <div className="space-y-4">
              {analytics.demandForecast.map((forecast, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{forecast.species}</h4>
                    <span className="text-blue-600 font-semibold">{forecast.predictedDemand} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{forecast.timeframe}</span>
                    <span className="text-green-600">Confidence: {forecast.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Harvest Optimization */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Harvest Optimization</span>
            </h3>
            {analytics.harvestOptimization.map((opt, index) => (
              <div key={index} className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{opt.zone}</h4>
                  <span className="text-green-600 font-semibold">{opt.expectedYield} kg</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Optimal Date: <strong>{new Date(opt.optimalHarvestDate).toLocaleDateString()}</strong>
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Risk Factors:</p>
                  {opt.riskFactors.map((risk, i) => (
                    <p key={i} className="text-xs text-amber-600">• {risk}</p>
                  ))}
                </div>
              </div>
            ))}
          </AnimatedCard>

          {/* Quality Predictions */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              <span>Quality Predictions</span>
            </h3>
            {analytics.qualityPrediction.map((pred, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{pred.batchId}</h4>
                  <span className="text-purple-600 font-semibold">{pred.predictedGrade}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Confidence: <strong>{pred.confidence}%</strong>
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Recommendations:</p>
                  {pred.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-blue-600">• {rec}</p>
                  ))}
                </div>
              </div>
            ))}
          </AnimatedCard>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="space-y-6">
          {/* Current Prices */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Current Market Prices</span>
            </h3>
            <div className="space-y-4">
              {marketData.currentPrices.map((price, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{price.species}</h4>
                    <p className="text-2xl font-bold text-green-600">₹{price.pricePerKg}/kg</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${
                      price.trend === 'up' ? 'text-green-600' :
                      price.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <span className="text-sm font-medium">
                        {price.trend === 'up' ? '↗' : price.trend === 'down' ? '↘' : '→'}
                      </span>
                      <span className="font-semibold">{price.change}%</span>
                    </div>
                    <p className="text-xs text-gray-500">vs last week</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Export Opportunities */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Export Opportunities</span>
            </h3>
            <div className="space-y-4">
              {marketData.exportOpportunities.map((opp, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">{opp.country}</h4>
                    <span className="text-blue-600 font-semibold">{opp.priceMultiplier}x Price</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Demand: <strong>{opp.demand} kg/month</strong>
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Requirements:</p>
                    {opp.regulations.map((reg, i) => (
                      <p key={i} className="text-xs text-amber-600">• {reg}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
}