import React, { useState } from 'react';
import { QrCode, Package, Award } from 'lucide-react';
import { useBlockchain } from '../../hooks/useBlockchain';

export function ManufacturerDashboard() {
  const { collectionEvents, qualityTests, generateProvenance } = useBlockchain();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const completedBatches = collectionEvents.filter(e => 
    e.approved && qualityTests.some(t => t.batchId === e.batchId && t.result === 'pass')
  );

  const handleGenerateQR = async () => {
    if (!selectedBatch) return;

    try {
      const provenance = await generateProvenance(selectedBatch);
      setGeneratedQR(provenance.finalProduct.qrCode);
    } catch (error) {
      alert(`QR generation failed: ${error}`);
    }
  };

  const getBatchQualityScore = (batchId: string) => {
    const batchTests = qualityTests.filter(t => t.batchId === batchId);
    if (batchTests.length === 0) return 0;
    
    const passedTests = batchTests.filter(t => t.result === 'pass').length;
    return Math.round((passedTests / batchTests.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready Batches</h3>
          <p className="text-3xl font-bold text-green-600">{completedBatches.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">QR Codes Generated</h3>
          <p className="text-3xl font-bold text-blue-600">
            {generatedQR ? 1 : 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg Quality Score</h3>
          <p className="text-3xl font-bold text-amber-600">
            {completedBatches.length > 0 
              ? Math.round(completedBatches.reduce((acc, batch) => acc + getBatchQualityScore(batch.batchId), 0) / completedBatches.length)
              : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Final Product Management</h3>
        
        <div className="space-y-4 p-4 bg-amber-50 rounded-lg mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch for Final Product</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Choose a completed batch...</option>
              {completedBatches.map((batch) => (
                <option key={batch.batchId} value={batch.batchId}>
                  {batch.batchId} - Quality: {getBatchQualityScore(batch.batchId)}%
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateQR}
            disabled={!selectedBatch}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Generate Product QR Code</span>
          </button>
        </div>

        {generatedQR && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="font-medium text-gray-800 mb-2">QR Code Generated Successfully!</p>
              <p className="text-sm text-gray-600 mb-4">Code: {generatedQR}</p>
              <div className="flex justify-center space-x-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                  Download QR
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                  Print Label
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Completed Batches</h4>
          {completedBatches.length === 0 ? (
            <p className="text-gray-500 italic">No completed batches yet</p>
          ) : (
            completedBatches.map((batch) => {
              const qualityScore = getBatchQualityScore(batch.batchId);
              return (
                <div key={batch.batchId} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-gray-800">{batch.batchId}</p>
                        <p className="text-sm text-gray-600">{batch.species}</p>
                        <p className="text-sm text-gray-500">
                          Harvested: {new Date(batch.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-600">{qualityScore}%</span>
                      </div>
                      <p className="text-sm text-gray-500">Quality Score</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}