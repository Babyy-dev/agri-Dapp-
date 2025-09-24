import { CollectionEvent, ProcessingStep, QualityTest, Provenance, SmartContractRule } from '../types/blockchain';
import { DatabaseService } from './DatabaseService';
import { database } from '../config/database';

export class BlockchainService {
  private static transactions: any[] = [];

  // Initialize database connection
  static async initialize() {
    try {
      if (!database.isDBConnected()) {
        await database.connect();
      }
    } catch (error) {
      console.error('❌ Failed to initialize BlockchainService:', error);
      throw error;
    }
  }

  static async logTransaction(type: string, data: any) {
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      blockHeight: this.transactions.length + 1,
      hash: this.generateHash(JSON.stringify(data))
    };
    
    this.transactions.push(transaction);
    console.log('🔗 Blockchain Transaction:', transaction);
    return transaction;
  }

  static generateHash(data: string): string {
    // Simple hash simulation (in real implementation would use SHA-256)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  static async getSmartContractRules(): Promise<SmartContractRule[]> {
    try {
      await this.initialize();
      const rules = await DatabaseService.getSmartContractRules({ active: true });
      return rules as SmartContractRule[];
    } catch (error) {
      console.error('Error fetching smart contract rules:', error);
      // Fallback to hardcoded rules if database fails
      return this.getFallbackRules();
    }
  }

  private static getFallbackRules(): SmartContractRule[] {
    return [
      {
        id: 'ashwagandha-geo-fence',
        type: 'geo_fence',
        species: 'Withania somnifera',
        parameters: {
          allowedZones: [
            { name: 'Rajasthan Zone A', bounds: [[26.0, 74.0], [27.0, 75.0]] },
            { name: 'Madhya Pradesh Zone B', bounds: [[22.0, 77.0], [23.0, 78.0]] }
          ]
        },
        active: true
      },
      {
        id: 'ashwagandha-seasonal',
        type: 'seasonal',
        species: 'Withania somnifera',
        parameters: {
          harvestingMonths: [10, 11, 12, 1, 2], // Oct-Feb
          closedMonths: [6, 7, 8, 9] // Monsoon protection
        },
        active: true
      },
      {
        id: 'ashwagandha-conservation',
        type: 'conservation',
        species: 'Withania somnifera',
        parameters: {
          maxDailyHarvest: 100, // kg per day per zone
          minPlantAge: 12, // months
          sustainablePercentage: 0.3 // max 30% of available plants
        },
        active: true
      },
      {
        id: 'ashwagandha-quality',
        type: 'quality',
        species: 'Withania somnifera',
        parameters: {
          maxMoisture: 12, // %
          minWithanolides: 0.3, // %
          maxPesticides: 0.01, // ppm
          requiredDNAMatch: true
        },
        active: true
      }
    ];
  }

  static async validateHarvesting(event: CollectionEvent, rules?: SmartContractRule[]): Promise<boolean> {
    try {
      if (!rules) {
        rules = await this.getSmartContractRules();
      }
      const speciesRules = rules.filter(rule => rule.species === event.species && rule.active);
      
      for (const rule of speciesRules) {
        switch (rule.type) {
          case 'geo_fence':
            if (!this.validateGeoFence(event.lat, event.lng, rule.parameters.allowedZones)) {
              console.log('❌ Geo-fence validation failed');
              return false;
            }
            break;
            
          case 'seasonal':
            const month = new Date(event.timestamp).getMonth() + 1;
            if (!rule.parameters.harvestingMonths.includes(month)) {
              console.log('❌ Seasonal restriction violated');
              return false;
            }
            break;
            
          case 'quality':
            if (event.initialQualityMetrics.moisture > rule.parameters.maxMoisture) {
              console.log('❌ Quality threshold exceeded');
              return false;
            }
            break;
        }
      }
      
      console.log('✅ Smart contract validation passed');
      return true;
    } catch (error) {
      console.error('Error validating harvesting:', error);
      return false;
    }
  }

  private static validateGeoFence(lat: number, lng: number, allowedZones: any[]): boolean {
    return allowedZones.some(zone => {
      const [[minLat, minLng], [maxLat, maxLng]] = zone.bounds;
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });
  }

  static async generateProvenance(
    batchId: string, 
    collections?: CollectionEvent[], 
    processing?: ProcessingStep[], 
    tests?: QualityTest[]
  ): Promise<Provenance> {
    try {
      await this.initialize();
      
      // Fetch data from database if not provided
      if (!collections) {
        collections = await DatabaseService.getCollectionEventsByBatch(batchId) as CollectionEvent[];
      }
      if (!processing) {
        processing = await DatabaseService.getProcessingStepsByBatch(batchId) as ProcessingStep[];
      }
      if (!tests) {
        tests = await DatabaseService.getQualityTestsByBatch(batchId) as QualityTest[];
      }
      const batchCollections = collections.filter(c => c.batchId === batchId);
      const batchProcessing = processing.filter(p => p.batchId === batchId);
      const batchTests = tests.filter(t => t.batchId === batchId);

      const chainOfCustody = [
        ...batchCollections.map(c => ({
          organizationId: c.collectorId,
          timestamp: c.timestamp,
          action: `Harvested ${c.species}`,
          location: { lat: c.lat, lng: c.lng }
        })),
        ...batchProcessing.map(p => ({
          organizationId: p.processorId,
          timestamp: p.timestamp,
          action: `Processing: ${p.stepType}`,
          location: { lat: 26.5, lng: 74.5 } // Mock processor location
        })),
        ...batchTests.map(t => ({
          organizationId: t.labId,
          timestamp: t.timestamp,
          action: `Quality test: ${t.testType}`,
          location: { lat: 28.6, lng: 77.2 } // Mock lab location
        }))
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const provenance: Provenance = {
        batchId,
        chainOfCustody,
        sustainabilityProofs: [
          {
            type: 'organic',
            certificateId: 'ORG-2024-001',
            issuedBy: 'India Organic Certification Agency',
            validUntil: '2025-12-31'
          },
          {
            type: 'sustainable_harvest',
            certificateId: 'SH-2024-001',
            issuedBy: 'Forest Conservation Council',
            validUntil: '2025-06-30'
          }
        ],
        finalProduct: {
          qrCode: this.generateQRCode(batchId),
          productName: 'Premium Ashwagandha Root Powder',
          manufacturerId: 'manufacturer-1',
          batchSize: 50,
          expiryDate: '2026-12-31'
        }
      };
      
      // Store provenance in database
      await DatabaseService.createProvenance(provenance);
      return provenance;
    } catch (error) {
      console.error('Error generating provenance:', error);
      throw error;
    }
  }

  static generateQRCode(batchId: string): string {
    return `QR_${batchId}_${Date.now()}`;
  }

  static async getBatchHistory(batchId: string): Promise<any[]> {
    try {
      await this.initialize();
      return await DatabaseService.getBatchHistory(batchId);
    } catch (error) {
      console.error('Error fetching batch history:', error);
      return [];
    }
  }

  static async getDemoData() {
    try {
      await this.initialize();
      
      // Try to fetch from database first
      const [collectionEvents, processingSteps, qualityTests, provenance] = await Promise.all([
        DatabaseService.getCollectionEvents(),
        DatabaseService.getProcessingSteps(),
        DatabaseService.getQualityTests(),
        DatabaseService.getSmartContractRules()
      ]);
      
      if (collectionEvents.length > 0) {
        return {
          collectionEvents: collectionEvents as CollectionEvent[],
          processingSteps: processingSteps as ProcessingStep[],
          qualityTests: qualityTests as QualityTest[],
          provenance: [] // Will be populated when needed
        };
      }
    } catch (error) {
      console.error('Error fetching data from database, using fallback:', error);
    }
    
    // Fallback to hardcoded demo data
    const demoCollectionEvents: CollectionEvent[] = [
      {
        batchId: 'ASH-2024-001',
        lat: 26.5671,
        lng: 74.3571,
        timestamp: '2024-01-15T06:30:00Z',
        collectorId: 'farmer-coop-1',
        species: 'Withania somnifera',
        initialQualityMetrics: {
          moisture: 8.5,
          visual_quality: 'excellent',
          estimated_yield: 45.2
        },
        photos: ['harvest_001.jpg', 'harvest_002.jpg'],
        harvestingZone: 'Rajasthan Zone A',
        approved: true
      }
    ];

    const demoProcessingSteps: ProcessingStep[] = [
      {
        batchId: 'ASH-2024-001',
        stepType: 'drying',
        parameters: {
          method: 'shade_drying',
          duration_hours: 72,
          final_moisture: 6.2
        },
        timestamp: '2024-01-18T14:00:00Z',
        processorId: 'processing-facility-1',
        temperature: 25,
        humidity: 45
      },
      {
        batchId: 'ASH-2024-001',
        stepType: 'grinding',
        parameters: {
          mesh_size: 80,
          particle_size: 'fine'
        },
        timestamp: '2024-01-20T10:00:00Z',
        processorId: 'processing-facility-1'
      }
    ];

    const demoQualityTests: QualityTest[] = [
      {
        batchId: 'ASH-2024-001',
        testType: 'pesticide',
        result: 'pass',
        values: {
          chlorpyrifos: 0.002,
          malathion: 0.001,
          ddt: 0.0
        },
        certificateHash: '0xa1b2c3d4e5f6',
        timestamp: '2024-01-22T09:00:00Z',
        labId: 'testing-lab-1',
        compliance: true
      },
      {
        batchId: 'ASH-2024-001',
        testType: 'potency',
        result: 'pass',
        values: {
          withanolides: 2.8,
          withanoside_iv: 0.45,
          withanoside_vi: 0.32
        },
        certificateHash: '0xf6e5d4c3b2a1',
        timestamp: '2024-01-22T11:00:00Z',
        labId: 'testing-lab-1',
        compliance: true
      }
    ];

    const demoProvenance: Provenance[] = [];

    return {
      collectionEvents: demoCollectionEvents,
      processingSteps: demoProcessingSteps,
      qualityTests: demoQualityTests,
      provenance: demoProvenance
    };
  }
}