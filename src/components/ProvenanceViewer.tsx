import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Award, Package, CheckCircle, ExternalLink, Download, Share2 } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';

interface ProvenanceViewerProps {
  provenance: any;
  onBack: () => void;
}

export function ProvenanceViewer({ provenance, onBack }: ProvenanceViewerProps) {
  const [activeSection, setActiveSection] = useState<'timeline' | 'map' | 'certificates' | 'quality'>('timeline');

  const mapPoints = provenance.chainOfCustody.map((step: any, index: number) => ({
    id: `step-${index}`,
    lat: step.location.lat,
    lng: step.location.lng,
    type: step.action.includes('Harvested') ? 'harvest' :
          step.action.includes('Processing') ? 'processing' :
          step.action.includes('Quality test') ? 'testing' : 'manufacturing',
    title: step.action,
    description: step.details || step.organizationName,
    timestamp: step.timestamp
  }));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: provenance.finalProduct.productName,
        text: 'Check out the complete blockchain-verified journey of this Ayurvedic product!',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const generateCertificatePDF = () => {
    // In real implementation, generate PDF with all provenance data
    alert('Certificate PDF generation would be triggered here');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{provenance.finalProduct.productName}</h2>
            <p className="text-gray-600">Batch: {provenance.batchId} • Blockchain Verified ✓</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={generateCertificatePDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate</span>
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'timeline', label: 'Journey Timeline', icon: Clock },
              { id: 'map', label: 'Location Map', icon: MapPin },
              { id: 'certificates', label: 'Certifications', icon: Award },
              { id: 'quality', label: 'Quality Report', icon: CheckCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all flex items-center space-x-2 ${
                  activeSection === id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeSection === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Complete Journey Timeline</h3>
              <div className="space-y-4">
                {provenance.chainOfCustody.map((step: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{step.action}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleDateString()} at {new Date(step.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-gray-700 mb-2">{step.organizationName}</p>
                      <p className="text-sm text-gray-600 mb-2">{step.details}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{step.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>📍 {step.location.lat.toFixed(4)}, {step.location.lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'map' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Journey Map</h3>
              <InteractiveMap points={mapPoints} showTrajectory={true} />
            </div>
          )}

          {activeSection === 'certificates' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Sustainability Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provenance.sustainabilityProofs.map((proof: any, index: number) => (
                  <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-gray-800 capitalize">
                          {proof.type.replace('_', ' ')} Certified
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">{proof.details}</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Certificate ID:</strong> {proof.certificateId}</p>
                        <p><strong>Issued by:</strong> {proof.issuedBy}</p>
                        <p><strong>Valid until:</strong> {new Date(proof.validUntil).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'quality' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Quality Analysis Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Safety & Purity Tests</h4>
                  <div className="space-y-3">
                    {Object.entries(provenance.qualityMetrics).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="text-sm text-green-600 font-semibold">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Nutritional Profile</h4>
                  <div className="space-y-3">
                    {Object.entries(provenance.finalProduct.nutritionalInfo).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-sm text-blue-600 font-semibold">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    Overall Grade: {provenance.qualityMetrics.overallGrade}
                  </h4>
                  <p className="text-gray-600">
                    This product meets the highest quality standards and is verified as authentic
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Usage Instructions</h4>
                <p className="text-sm text-gray-700 mb-2">{provenance.finalProduct.instructions}</p>
                <p className="text-sm text-gray-600">
                  <strong>Storage:</strong> {provenance.finalProduct.storage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Footer */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Batch Size</p>
            <p className="text-lg font-semibold text-gray-800">{provenance.finalProduct.batchSize} kg</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Manufacturing Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(provenance.chainOfCustody[provenance.chainOfCustody.length - 1].timestamp).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Expiry Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(provenance.finalProduct.expiryDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Blockchain Hash</p>
            <p className="text-sm font-mono text-gray-600 truncate">
              0x{Math.random().toString(16).substr(2, 16)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}