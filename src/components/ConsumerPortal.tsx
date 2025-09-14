import React, { useState } from 'react';
import { QrCode, Search, MapPin, Award, Clock, Camera } from 'lucide-react';
import { useBlockchain } from '../hooks/useBlockchain';
import { ProvenanceViewer } from './ProvenanceViewer';
import { QRScanner } from './QRScanner';
import { QRCodeService } from '../services/QRCodeService';
import { useToast } from '../hooks/useToast';
import { AnimatedCard } from './AnimatedCard';
import { LoadingSpinner } from './LoadingSpinner';
import { NotificationService } from '../services/NotificationService';

export function ConsumerPortal() {
  const { provenance, getBatchHistory } = useBlockchain();
  const { success, error, info } = useToast();
  const [qrCode, setQrCode] = useState('');
  const [selectedProvenance, setSelectedProvenance] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleQRSearch = async () => {
    setSearchError('');
    setIsLoading(true);
    info('Searching Blockchain', 'Verifying product authenticity...');
    
    try {
      // Validate QR code format and signature
      const validation = await QRCodeService.validateBatchQR(qrCode);
      
      if (!validation.valid) {
        setSearchError(validation.errors.join(', '));
        error('Invalid QR Code', validation.errors.join(', '));
        return;
      }

      // Parse QR code data
      const qrData = QRCodeService.parseQRCode(qrCode);
      if (!qrData) {
        setSearchError('Invalid QR code format');
        error('Invalid Format', 'QR code format not recognized');
        return;
      }

      // Check blockchain for provenance
      const found = provenance.find(p => p.batchId === qrData.batchId);
      
      if (found) {
        const history = getBatchHistory(found.batchId);
        setSelectedProvenance({ ...found, history });
        success('Product Verified', 'Blockchain verification successful!');
        
        // Add notification for successful verification
        NotificationService.addNotification({
          type: 'system_update',
          title: 'Product Verified',
          message: `Consumer verified product ${qrData.batchId}`,
          priority: 'low'
        });
      } else if (qrData.batchId === 'ASH-2024-001' || qrCode === 'QR_ASH-2024-001_demo') {
        // Demo provenance for Ashwagandha
        const demoProvenance = {
          batchId: 'ASH-2024-001',
          chainOfCustody: [
            {
              organizationId: 'farmer-coop-1',
              organizationName: 'Rajasthan Farmer Cooperative',
              timestamp: '2024-01-15T06:30:00Z',
              action: 'Harvested Withania somnifera',
              location: { lat: 26.5671, lng: 74.3571 },
              address: 'Jaipur District, Rajasthan, India',
              details: 'Sustainable harvest following traditional methods'
            },
            {
              organizationId: 'processing-facility-1',
              organizationName: 'Ayur Processing Ltd.',
              timestamp: '2024-01-18T14:00:00Z',
              action: 'Processing: shade drying',
              location: { lat: 26.5, lng: 74.5 },
              address: 'Jaipur Industrial Area, Rajasthan',
              details: '72-hour controlled shade drying at 25°C'
            },
            {
              organizationId: 'processing-facility-1',
              organizationName: 'Ayur Processing Ltd.',
              timestamp: '2024-01-20T10:00:00Z',
              action: 'Processing: fine grinding',
              location: { lat: 26.5, lng: 74.5 },
              address: 'Jaipur Industrial Area, Rajasthan',
              details: '80-mesh grinding to fine powder'
            },
            {
              organizationId: 'testing-lab-1',
              organizationName: 'BioTest Laboratories',
              timestamp: '2024-01-22T09:00:00Z',
              action: 'Quality test: pesticide screening',
              location: { lat: 28.6, lng: 77.2 },
              address: 'New Delhi, India',
              details: 'Comprehensive pesticide residue analysis - PASSED'
            },
            {
              organizationId: 'testing-lab-1',
              organizationName: 'BioTest Laboratories',
              timestamp: '2024-01-22T11:00:00Z',
              action: 'Quality test: potency analysis',
              location: { lat: 28.6, lng: 77.2 },
              address: 'New Delhi, India',
              details: 'Withanolides content: 2.8% - Excellent potency'
            },
            {
              organizationId: 'manufacturer-1',
              organizationName: 'HerbalLife Manufacturing',
              timestamp: '2024-01-25T15:00:00Z',
              action: 'Final packaging and QR generation',
              location: { lat: 19.0760, lng: 72.8777 },
              address: 'Mumbai, Maharashtra, India',
              details: 'Premium packaging with blockchain QR code'
            }
          ],
          sustainabilityProofs: [
            {
              type: 'organic',
              certificateId: 'ORG-IN-2024-001',
              issuedBy: 'India Organic Certification Agency (INDOCERT)',
              validUntil: '2025-12-31',
              details: 'Certified organic cultivation without synthetic pesticides or fertilizers'
            },
            {
              type: 'sustainable_harvest',
              certificateId: 'SH-RAJ-2024-001',
              issuedBy: 'Rajasthan Forest Conservation Council',
              validUntil: '2025-06-30',
              details: 'Sustainable wild harvesting practices maintaining plant population'
            },
            {
              type: 'fair_trade',
              certificateId: 'FT-COOP-2024-001',
              issuedBy: 'Fair Trade India',
              validUntil: '2025-12-31',
              details: 'Fair compensation to farmers and community development support'
            },
            {
              type: 'community_support',
              certificateId: 'CS-RAJ-2024-001',
              issuedBy: 'Rural Development Trust',
              validUntil: '2025-12-31',
              details: 'Supporting local communities and traditional knowledge preservation'
            }
          ],
          finalProduct: {
            qrCode: qrData.batchId,
            productName: 'Premium Organic Ashwagandha Root Powder',
            manufacturerId: 'manufacturer-1',
            batchSize: 50,
            expiryDate: '2026-12-31',
            nutritionalInfo: {
              withanolides: '2.8%',
              moisture: '6.2%',
              ash: '4.1%',
              protein: '11.3%'
            },
            instructions: 'Take 1-2 teaspoons daily with warm milk or water. Consult healthcare provider before use.',
            storage: 'Store in cool, dry place away from direct sunlight'
          },
          qualityMetrics: {
            pesticidesDetected: 'None',
            heavyMetals: 'Within safe limits',
            microbialCount: 'Compliant',
            dnaAuthenticity: 'Verified 99.9% Withania somnifera',
            potency: 'High (2.8% withanolides)',
            overallGrade: 'Premium A+'
          }
        };
        setSelectedProvenance(demoProvenance);
        success('Demo Product Verified', 'Viewing complete traceability journey!');
      } else {
        setSearchError('Product not found in blockchain. Please verify the QR code is from an authenticated AyurTrace product.');
        error('Product Not Found', 'This product is not registered in our blockchain network');
      }
    } catch (error) {
      setSearchError('Search failed. Please try again.');
      error('Search Failed', 'Unable to connect to blockchain network');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanResult = (scannedQR: string) => {
    setQrCode(scannedQR);
    setShowScanner(false);
    // Auto-search after scan
    setTimeout(() => handleQRSearch(), 100);
  };

  if (selectedProvenance) {
    return <ProvenanceViewer provenance={selectedProvenance} onBack={() => setSelectedProvenance(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center animate-fade-in-up">
        <h2 className="text-4xl font-bold gradient-text mb-4 animate-bounce-in">Product Authenticity Portal</h2>
        <p className="text-xl text-gray-600">
          Verify the complete journey of your Ayurvedic products from farm to shelf using blockchain technology
        </p>
      </div>

      <AnimatedCard delay={200} className="p-8 neon-green">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 via-emerald-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 floating animate-heartbeat neon-green">
            <QrCode className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold gradient-text mb-2 animate-fade-in-scale">Verify Product Authenticity</h3>
          <p className="text-gray-600">Scan or enter the QR code from your product packaging</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Enter QR code (try: QR_ASH-2024-001_demo)"
              className="w-full p-4 pl-12 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg transition-all duration-500 focus:shadow-2xl focus:scale-105 neon-green"
            />
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <button
              onClick={() => setShowScanner(true)}
              className="absolute right-2 top-2 p-2 text-gray-400 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg transition-all duration-500 transform hover:scale-125 hover:rotate-12 magnetic"
              title="Scan QR Code"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {searchError && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-sm text-red-600">{searchError}</p>
            </div>
          )}

          <button
            onClick={handleQRSearch}
            disabled={!qrCode.trim() || isLoading}
            className="w-full btn-primary text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 magnetic ripple"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Verifying on Blockchain...</span>
              </>
            ) : (
              <span>Verify Product Journey</span>
            )}
          </button>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 via-blue-50 to-emerald-50 rounded-lg animate-fade-in-scale particle-bg">
          <h4 className="font-semibold text-gray-800 mb-4 text-center">Blockchain Verification Includes:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 tilt">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-2 floating neon-green">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h5 className="font-medium text-gray-800 mb-1">Origin Verification</h5>
              <p className="text-sm text-gray-600">GPS-tracked harvest location and sustainable sourcing proof</p>
            </div>
            <div className="text-center transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 tilt">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-2 floating neon-blue">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h5 className="font-medium text-gray-800 mb-1">Complete Timeline</h5>
              <p className="text-sm text-gray-600">Immutable record of every processing step and quality check</p>
            </div>
            <div className="text-center transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 tilt">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-2 floating" style={{
                boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)'
              }}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <h5 className="font-medium text-gray-800 mb-1">Quality Certificates</h5>
              <p className="text-sm text-gray-600">Lab-verified purity, potency, and safety test results</p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Benefits Section */}
      <AnimatedCard delay={400} className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 p-8 text-white animate-gradient neon-green">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 animate-bounce-in">Why Choose Blockchain-Verified Products?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 tilt">
              <div className="w-16 h-16 bg-white bg-opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 floating">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="font-semibold mb-2">100% Authenticity</h4>
              <p className="text-sm opacity-90">Every product is cryptographically verified from source to shelf with immutable blockchain records</p>
            </div>
            <div className="text-center transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 tilt">
              <div className="w-16 h-16 bg-white bg-opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 floating">
                <MapPin className="w-8 h-8" />
              </div>
              <h4 className="font-semibold mb-2">Sustainable & Ethical</h4>
              <p className="text-sm opacity-90">Supporting traditional farming communities and ensuring sustainable harvesting practices</p>
            </div>
            <div className="text-center transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 tilt">
              <div className="w-16 h-16 bg-white bg-opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 floating">
                <QrCode className="w-8 h-8" />
              </div>
              <h4 className="font-semibold mb-2">Scientific Validation</h4>
              <p className="text-sm opacity-90">Lab-tested for purity, potency, and safety with DNA authentication</p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Demo QR Codes */}
      <AnimatedCard delay={600} className="p-6 neon-green">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Demo Products</h3>
        <p className="text-gray-600 mb-4">Try these demo QR codes to explore the traceability features:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 hover:shadow-xl cursor-pointer ripple tilt neon-green"
               onClick={() => setQrCode('QR_ASH-2024-001_demo')}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg flex items-center justify-center animate-pulse-slow">
                <QrCode className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Premium Ashwagandha</p>
                <p className="text-sm text-gray-600">QR_ASH-2024-001_demo</p>
                <p className="text-xs text-green-600">✓ Blockchain Verified</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg opacity-50 transform transition-all duration-500 hover:opacity-75 hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Organic Turmeric</p>
                <p className="text-sm text-gray-600">Coming Soon</p>
                <p className="text-xs text-gray-500">In Development</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {showScanner && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}