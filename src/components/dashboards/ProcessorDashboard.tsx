import React, { useState } from 'react';
import { Package, Thermometer, Clock } from 'lucide-react';
import { useBlockchain } from '../../hooks/useBlockchain';
import { ProcessingStep } from '../../types/blockchain';

export function ProcessorDashboard() {
  const { addProcessingStep, collectionEvents, processingSteps } = useBlockchain();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [newStep, setNewStep] = useState<Partial<ProcessingStep>>({
    stepType: 'drying'
  });

  const availableBatches = collectionEvents.filter(e => e.approved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const step: ProcessingStep = {
      batchId: selectedBatch,
      stepType: newStep.stepType!,
      parameters: {
        method: newStep.stepType === 'drying' ? 'shade_drying' : 'standard',
        duration_hours: newStep.duration || 24,
        temperature: newStep.temperature || 25,
        humidity: newStep.humidity || 45
      },
      timestamp: new Date().toISOString(),
      processorId: 'processing-facility-1',
      temperature: newStep.temperature,
      humidity: newStep.humidity,
      duration: newStep.duration
    };

    try {
      await addProcessingStep(step);
      setSelectedBatch('');
      setNewStep({ stepType: 'drying' });
    } catch (error) {
      alert(`Processing failed: ${error}`);
    }
  };

  const batchSteps = processingSteps.filter(s => s.batchId === selectedBatch);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Batches</h3>
          <p className="text-3xl font-bold text-blue-600">{availableBatches.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Steps</h3>
          <p className="text-3xl font-bold text-purple-600">{processingSteps.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Efficiency</h3>
          <p className="text-3xl font-bold text-green-600">94.2%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Processing Operations</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-blue-50 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a batch...</option>
                {availableBatches.map((batch) => (
                  <option key={batch.batchId} value={batch.batchId}>
                    {batch.batchId} - {batch.species}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Processing Step</label>
              <select
                value={newStep.stepType}
                onChange={(e) => setNewStep(prev => ({ ...prev, stepType: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="drying">Drying</option>
                <option value="grinding">Grinding</option>
                <option value="extraction">Extraction</option>
                <option value="packaging">Packaging</option>
                <option value="storage">Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
              <input
                type="number"
                value={newStep.temperature || ''}
                onChange={(e) => setNewStep(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input
                type="number"
                value={newStep.duration || ''}
                onChange={(e) => setNewStep(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="24"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedBatch}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
          >
            Add Processing Step
          </button>
        </form>

        {selectedBatch && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Processing History for {selectedBatch}</h4>
            {batchSteps.length === 0 ? (
              <p className="text-gray-500 italic">No processing steps yet</p>
            ) : (
              batchSteps.map((step, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 capitalize">{step.stepType}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(step.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {step.temperature && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Thermometer className="w-4 h-4" />
                        <span>{step.temperature}°C</span>
                      </div>
                    )}
                    {step.duration && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{step.duration}h</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}