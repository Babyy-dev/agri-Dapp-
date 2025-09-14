import React, { useState } from 'react';
import { Code, BookOpen, Database, Shield } from 'lucide-react';

export function APIDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/blockchain/collection-events',
      description: 'Submit a new harvest collection event to the blockchain',
      requestBody: {
        batchId: 'string',
        lat: 'number',
        lng: 'number',
        timestamp: 'string (ISO 8601)',
        collectorId: 'string',
        species: 'string',
        initialQualityMetrics: 'object',
        photos: 'string[]',
        harvestingZone: 'string'
      },
      response: {
        success: 'boolean',
        transactionId: 'string',
        blockHeight: 'number',
        timestamp: 'string'
      }
    },
    {
      method: 'GET',
      path: '/api/blockchain/batches/{batchId}',
      description: 'Retrieve complete batch history and provenance data',
      parameters: {
        batchId: 'string (required) - Unique batch identifier'
      },
      response: {
        batchId: 'string',
        events: 'CollectionEvent[]',
        processing: 'ProcessingStep[]',
        tests: 'QualityTest[]',
        provenance: 'Provenance'
      }
    },
    {
      method: 'POST',
      path: '/api/blockchain/processing-steps',
      description: 'Add a processing step to an existing batch',
      requestBody: {
        batchId: 'string',
        stepType: 'string (drying|grinding|extraction|packaging|storage)',
        parameters: 'object',
        timestamp: 'string (ISO 8601)',
        processorId: 'string'
      },
      response: {
        success: 'boolean',
        transactionId: 'string'
      }
    },
    {
      method: 'POST',
      path: '/api/blockchain/quality-tests',
      description: 'Submit quality test results for a batch',
      requestBody: {
        batchId: 'string',
        testType: 'string (pesticide|heavy_metals|dna_barcode|potency|microbial)',
        result: 'string (pass|fail|pending)',
        values: 'object',
        certificateHash: 'string',
        labId: 'string'
      },
      response: {
        success: 'boolean',
        transactionId: 'string',
        compliance: 'boolean'
      }
    },
    {
      method: 'GET',
      path: '/api/blockchain/provenance/{qrCode}',
      description: 'Get provenance data for consumer QR code verification',
      parameters: {
        qrCode: 'string (required) - QR code from product packaging'
      },
      response: {
        valid: 'boolean',
        provenance: 'Provenance',
        chainOfCustody: 'object[]',
        sustainabilityProofs: 'object[]'
      }
    },
    {
      method: 'POST',
      path: '/api/blockchain/smart-contracts/validate',
      description: 'Validate data against smart contract rules',
      requestBody: {
        contractType: 'string (geo_fence|seasonal|quality|conservation)',
        species: 'string',
        parameters: 'object'
      },
      response: {
        valid: 'boolean',
        errors: 'string[]',
        enforcedRules: 'string[]'
      }
    },
    {
      method: 'GET',
      path: '/api/blockchain/network/status',
      description: 'Get blockchain network health and statistics',
      response: {
        totalBlocks: 'number',
        totalTransactions: 'number',
        averageBlockTime: 'number',
        networkHealth: 'string',
        activeNodes: 'number'
      }
    }
  ];

  const authenticationExample = `
// Authentication using organization certificates
const headers = {
  'Authorization': 'Bearer ' + organizationToken,
  'Content-Type': 'application/json',
  'X-Organization-ID': 'farmer-coop-1',
  'X-Certificate-Hash': certificateHash
};

const response = await fetch('/api/blockchain/collection-events', {
  method: 'POST',
  headers,
  body: JSON.stringify(collectionEventData)
});
`;

  const integrationExample = `
// ERP Integration Example
class ERPIntegration {
  async syncWithBlockchain(erpBatchId: string) {
    // Map ERP data to blockchain format
    const blockchainData = {
      batchId: erpBatchId,
      timestamp: new Date().toISOString(),
      // ... other mapped fields
    };
    
    // Submit to blockchain
    const result = await blockchainAPI.submitEvent(blockchainData);
    
    // Update ERP with blockchain reference
    await erp.updateBatch(erpBatchId, {
      blockchainTxId: result.transactionId,
      blockchainHash: result.hash
    });
  }
}
`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>Blockchain API Documentation</span>
        </h2>
        <p className="text-gray-600">
          RESTful API endpoints for integrating with the botanical traceability blockchain network
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {apiEndpoints.map((endpoint, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
                onClick={() => setSelectedEndpoint(selectedEndpoint === endpoint.path ? null : endpoint.path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                  </div>
                  <span className="text-gray-400">
                    {selectedEndpoint === endpoint.path ? '−' : '+'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
              </div>

              {selectedEndpoint === endpoint.path && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {endpoint.requestBody && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Request Body</h4>
                      <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                        {JSON.stringify(endpoint.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}

                  {endpoint.parameters && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Parameters</h4>
                      <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                        {JSON.stringify(endpoint.parameters, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Response</h4>
                    <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Authentication */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Authentication</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">Certificate-Based Auth</p>
                <p className="text-xs text-green-700">
                  Each organization uses X.509 certificates for blockchain network access
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Role-Based Access</p>
                <p className="text-xs text-blue-700">
                  Permissions enforced at smart contract level
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Example</h4>
              <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                {authenticationExample}
              </pre>
            </div>
          </div>

          {/* Integration Guide */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span>ERP Integration</span>
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Connect existing ERP/QMS systems to the blockchain network
              </p>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">
                  Use webhooks for real-time synchronization between systems
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Integration Code</h4>
              <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                {integrationExample}
              </pre>
            </div>
          </div>

          {/* Data Formats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Code className="w-5 h-5 text-orange-600" />
              <span>Data Standards</span>
            </h3>
            <div className="space-y-2">
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-xs font-medium text-orange-800">FHIR Compliance</p>
                <p className="text-xs text-orange-700">Resources follow FHIR R4 structure</p>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-xs font-medium text-orange-800">JSON-LD Support</p>
                <p className="text-xs text-orange-700">Semantic web compatibility</p>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-xs font-medium text-orange-800">ISO Standards</p>
                <p className="text-xs text-orange-700">GS1, ISO 8601, ISO 3166</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}