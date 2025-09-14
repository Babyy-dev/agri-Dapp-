import React, { useState } from 'react';
import { FlaskConical, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useBlockchain } from '../../hooks/useBlockchain';
import { QualityTest } from '../../types/blockchain';

export function LabDashboard() {
  const { addQualityTest, collectionEvents, qualityTests } = useBlockchain();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [newTest, setNewTest] = useState<Partial<QualityTest>>({
    testType: 'pesticide'
  });

  const availableBatches = collectionEvents.filter(e => e.approved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const test: QualityTest = {
      batchId: selectedBatch,
      testType: newTest.testType!,
      result: 'pass', // Would be determined by actual test values
      values: {
        pesticide_level: 0.002,
        heavy_metals: 0.001,
        withanolides: 2.8
      },
      certificateHash: `0x${Math.random().toString(16).substr(2, 12)}`,
      timestamp: new Date().toISOString(),
      labId: 'testing-lab-1',
      compliance: true
    };

    try {
      await addQualityTest(test);
      setSelectedBatch('');
      setNewTest({ testType: 'pesticide' });
    } catch (error) {
      alert(`Test submission failed: ${error}`);
    }
  };

  const batchTests = qualityTests.filter(t => t.batchId === selectedBatch);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tests Completed</h3>
          <p className="text-3xl font-bold text-blue-600">{qualityTests.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Pass Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {qualityTests.length > 0 ? Math.round((qualityTests.filter(t => t.result === 'pass').length / qualityTests.length) * 100) : 0}%
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Tests</h3>
          <p className="text-3xl font-bold text-amber-600">
            {qualityTests.filter(t => t.result === 'pending').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Compliance</h3>
          <p className="text-3xl font-bold text-green-600">98.7%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Quality Testing</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-purple-50 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch for Testing</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                value={newTest.testType}
                onChange={(e) => setNewTest(prev => ({ ...prev, testType: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="pesticide">Pesticide Residue</option>
                <option value="heavy_metals">Heavy Metals</option>
                <option value="dna_barcode">DNA Barcode</option>
                <option value="potency">Active Compounds</option>
                <option value="microbial">Microbial Count</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedBatch}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
          >
            Submit Test Results
          </button>
        </form>

        {selectedBatch && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Test History for {selectedBatch}</h4>
            {batchTests.length === 0 ? (
              <p className="text-gray-500 italic">No tests completed yet</p>
            ) : (
              batchTests.map((test, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-800 capitalize">
                          {test.testType.replace('_', ' ')} Test
                        </p>
                        <p className="text-sm text-gray-600">
                          Certificate: {test.certificateHash}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {test.result === 'pass' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : test.result === 'fail' ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                      <span className="text-sm font-medium capitalize">{test.result}</span>
                    </div>
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