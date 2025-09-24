import { CollectionEvent, ICollectionEvent } from '../models/CollectionEvent';
import { ProcessingStep, IProcessingStep } from '../models/ProcessingStep';
import { QualityTest, IQualityTest } from '../models/QualityTest';
import { Provenance, IProvenance } from '../models/Provenance';
import { SmartContractRule, ISmartContractRule } from '../models/Provenance';
import { Organization, IOrganization } from '../models/Organization';
import { User, IUser } from '../models/User';
import { 
  CollectionEvent as CollectionEventType,
  ProcessingStep as ProcessingStepType,
  QualityTest as QualityTestType,
  Provenance as ProvenanceType,
  SmartContractRule as SmartContractRuleType
} from '../types/blockchain';

export class DatabaseService {
  // Collection Events
  static async createCollectionEvent(eventData: CollectionEventType): Promise<ICollectionEvent> {
    try {
      const event = new CollectionEvent({
        ...eventData,
        timestamp: new Date(eventData.timestamp)
      });
      return await event.save();
    } catch (error) {
      console.error('Error creating collection event:', error);
      throw error;
    }
  }

  static async getCollectionEvents(filter: any = {}): Promise<ICollectionEvent[]> {
    try {
      return await CollectionEvent.find(filter)
        .populate('collectorId', 'name organizationId')
        .sort({ timestamp: -1 })
        .lean();
    } catch (error) {
      console.error('Error fetching collection events:', error);
      throw error;
    }
  }

  static async getCollectionEventsByBatch(batchId: string): Promise<ICollectionEvent[]> {
    return this.getCollectionEvents({ batchId });
  }

  static async getCollectionEventsByCollector(collectorId: string): Promise<ICollectionEvent[]> {
    return this.getCollectionEvents({ collectorId });
  }

  static async approveCollectionEvent(eventId: string): Promise<ICollectionEvent | null> {
    try {
      return await CollectionEvent.findByIdAndUpdate(
        eventId,
        { approved: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error approving collection event:', error);
      throw error;
    }
  }

  // Processing Steps
  static async createProcessingStep(stepData: ProcessingStepType): Promise<IProcessingStep> {
    try {
      const step = new ProcessingStep({
        ...stepData,
        timestamp: new Date(stepData.timestamp)
      });
      return await step.save();
    } catch (error) {
      console.error('Error creating processing step:', error);
      throw error;
    }
  }

  static async getProcessingSteps(filter: any = {}): Promise<IProcessingStep[]> {
    try {
      return await ProcessingStep.find(filter)
        .populate('processorId', 'name organizationId')
        .sort({ timestamp: 1 })
        .lean();
    } catch (error) {
      console.error('Error fetching processing steps:', error);
      throw error;
    }
  }

  static async getProcessingStepsByBatch(batchId: string): Promise<IProcessingStep[]> {
    return this.getProcessingSteps({ batchId });
  }

  static async getBatchTimeline(batchId: string): Promise<IProcessingStep[]> {
    try {
      return await (ProcessingStep as any).getBatchTimeline(batchId);
    } catch (error) {
      console.error('Error fetching batch timeline:', error);
      throw error;
    }
  }

  // Quality Tests
  static async createQualityTest(testData: QualityTestType): Promise<IQualityTest> {
    try {
      const test = new QualityTest({
        ...testData,
        timestamp: new Date(testData.timestamp)
      });
      return await test.save();
    } catch (error) {
      console.error('Error creating quality test:', error);
      throw error;
    }
  }

  static async getQualityTests(filter: any = {}): Promise<IQualityTest[]> {
    try {
      return await QualityTest.find(filter)
        .populate('labId', 'name organizationId')
        .sort({ timestamp: -1 })
        .lean();
    } catch (error) {
      console.error('Error fetching quality tests:', error);
      throw error;
    }
  }

  static async getQualityTestsByBatch(batchId: string): Promise<IQualityTest[]> {
    return this.getQualityTests({ batchId });
  }

  static async getBatchTests(batchId: string): Promise<IQualityTest[]> {
    try {
      return await (QualityTest as any).getBatchTests(batchId);
    } catch (error) {
      console.error('Error fetching batch tests:', error);
      throw error;
    }
  }

  static async getComplianceSummary(batchId: string): Promise<any> {
    try {
      const result = await (QualityTest as any).getComplianceSummary(batchId);
      return result[0] || {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        pendingTests: 0,
        overallCompliance: 0
      };
    } catch (error) {
      console.error('Error fetching compliance summary:', error);
      throw error;
    }
  }

  // Provenance
  static async createProvenance(provenanceData: ProvenanceType): Promise<IProvenance> {
    try {
      const provenance = new Provenance({
        ...provenanceData,
        chainOfCustody: provenanceData.chainOfCustody.map(custody => ({
          ...custody,
          timestamp: new Date(custody.timestamp)
        })),
        sustainabilityProofs: provenanceData.sustainabilityProofs.map(proof => ({
          ...proof,
          validUntil: new Date(proof.validUntil)
        })),
        finalProduct: {
          ...provenanceData.finalProduct,
          expiryDate: new Date(provenanceData.finalProduct.expiryDate)
        }
      });
      return await provenance.save();
    } catch (error) {
      console.error('Error creating provenance:', error);
      throw error;
    }
  }

  static async getProvenanceByBatch(batchId: string): Promise<IProvenance | null> {
    try {
      return await Provenance.findOne({ batchId })
        .populate('chainOfCustody.organizationId', 'name type location')
        .populate('finalProduct.manufacturerId', 'name location')
        .lean();
    } catch (error) {
      console.error('Error fetching provenance by batch:', error);
      throw error;
    }
  }

  static async getProvenanceByQRCode(qrCode: string): Promise<IProvenance | null> {
    try {
      return await (Provenance as any).findByQRCode(qrCode);
    } catch (error) {
      console.error('Error fetching provenance by QR code:', error);
      throw error;
    }
  }

  // Smart Contract Rules
  static async createSmartContractRule(ruleData: SmartContractRuleType): Promise<ISmartContractRule> {
    try {
      const rule = new SmartContractRule(ruleData);
      return await rule.save();
    } catch (error) {
      console.error('Error creating smart contract rule:', error);
      throw error;
    }
  }

  static async getSmartContractRules(filter: any = {}): Promise<ISmartContractRule[]> {
    try {
      return await SmartContractRule.find(filter).lean();
    } catch (error) {
      console.error('Error fetching smart contract rules:', error);
      throw error;
    }
  }

  static async getActiveRulesForSpecies(species: string): Promise<ISmartContractRule[]> {
    try {
      return await (SmartContractRule as any).getActiveRulesForSpecies(species);
    } catch (error) {
      console.error('Error fetching active rules for species:', error);
      throw error;
    }
  }

  static async updateSmartContractRule(ruleId: string, updates: Partial<SmartContractRuleType>): Promise<ISmartContractRule | null> {
    try {
      return await SmartContractRule.findByIdAndUpdate(
        ruleId,
        { ...updates, lastModified: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating smart contract rule:', error);
      throw error;
    }
  }

  // Batch Operations
  static async getBatchHistory(batchId: string): Promise<any[]> {
    try {
      const [collections, processing, tests] = await Promise.all([
        this.getCollectionEventsByBatch(batchId),
        this.getProcessingStepsByBatch(batchId),
        this.getQualityTestsByBatch(batchId)
      ]);

      const events = [
        ...collections.map(c => ({ ...c, type: 'collection' })),
        ...processing.map(p => ({ ...p, type: 'processing' })),
        ...tests.map(t => ({ ...t, type: 'testing' }))
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return events;
    } catch (error) {
      console.error('Error fetching batch history:', error);
      throw error;
    }
  }

  // Analytics and Aggregations
  static async getHarvestAnalytics(filter: any = {}): Promise<any> {
    try {
      const pipeline = [
        { $match: { approved: true, ...filter } },
        {
          $group: {
            _id: {
              species: '$species',
              zone: '$harvestingZone',
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' }
            },
            totalYield: { $sum: '$initialQualityMetrics.estimated_yield' },
            averageMoisture: { $avg: '$initialQualityMetrics.moisture' },
            harvestCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ];

      return await CollectionEvent.aggregate(pipeline);
    } catch (error) {
      console.error('Error fetching harvest analytics:', error);
      throw error;
    }
  }

  static async getQualityAnalytics(filter: any = {}): Promise<any> {
    try {
      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: {
              testType: '$testType',
              result: '$result'
            },
            count: { $sum: 1 }
          }
        }
      ];

      return await QualityTest.aggregate(pipeline);
    } catch (error) {
      console.error('Error fetching quality analytics:', error);
      throw error;
    }
  }

  // Conservation Monitoring
  static async getConservationStatus(species: string, zone: string): Promise<any> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const seasonStart = new Date(today.getFullYear(), 0, 1); // Start of year

      const [dailyHarvest, seasonalHarvest] = await Promise.all([
        CollectionEvent.aggregate([
          {
            $match: {
              species,
              harvestingZone: zone,
              approved: true,
              timestamp: { $gte: startOfDay, $lt: endOfDay }
            }
          },
          {
            $group: {
              _id: null,
              totalYield: { $sum: '$initialQualityMetrics.estimated_yield' }
            }
          }
        ]),
        CollectionEvent.aggregate([
          {
            $match: {
              species,
              harvestingZone: zone,
              approved: true,
              timestamp: { $gte: seasonStart }
            }
          },
          {
            $group: {
              _id: null,
              totalYield: { $sum: '$initialQualityMetrics.estimated_yield' }
            }
          }
        ])
      ]);

      return {
        species,
        zone,
        dailyHarvestUsed: dailyHarvest[0]?.totalYield || 0,
        dailyHarvestLimit: 100, // From smart contract rules
        seasonalHarvestUsed: seasonalHarvest[0]?.totalYield || 0,
        seasonalHarvestLimit: 2000, // From smart contract rules
        plantPopulationHealth: 94.2 // Mock value - would be calculated from ecological data
      };
    } catch (error) {
      console.error('Error fetching conservation status:', error);
      throw error;
    }
  }
}