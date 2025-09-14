import { CollectionEvent, ProcessingStep, QualityTest, SmartContractRule } from '../types/blockchain';
import { BlockchainAPI } from './BlockchainAPI';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  enforcedRules: string[];
}

export interface ConservationStatus {
  species: string;
  zone: string;
  dailyHarvestUsed: number;
  dailyHarvestLimit: number;
  seasonalHarvestUsed: number;
  seasonalHarvestLimit: number;
  plantPopulationHealth: number;
}

export class SmartContractService {
  private static rules: SmartContractRule[] = [
    {
      id: 'ashwagandha-geo-fence-rajasthan',
      type: 'geo_fence',
      species: 'Withania somnifera',
      parameters: {
        allowedZones: [
          { 
            name: 'Rajasthan Zone A',
            bounds: [[26.0, 74.0], [27.0, 75.0]],
            maxDailyHarvest: 100,
            conservationStatus: 'sustainable'
          },
          { 
            name: 'Madhya Pradesh Zone B',
            bounds: [[22.0, 77.0], [23.0, 78.0]],
            maxDailyHarvest: 150,
            conservationStatus: 'monitored'
          }
        ]
      },
      active: true
    },
    {
      id: 'ashwagandha-seasonal-restrictions',
      type: 'seasonal',
      species: 'Withania somnifera',
      parameters: {
        harvestingMonths: [10, 11, 12, 1, 2], // Oct-Feb
        closedMonths: [6, 7, 8, 9], // Monsoon protection
        reasoningPeriods: [3, 4, 5], // Recovery period
        minPlantMaturity: 12 // months
      },
      active: true
    },
    {
      id: 'ashwagandha-conservation-limits',
      type: 'conservation',
      species: 'Withania somnifera',
      parameters: {
        maxDailyHarvestPerZone: 100, // kg per day per zone
        maxSeasonalHarvestPerZone: 2000, // kg per season
        minPlantAge: 12, // months
        maxHarvestPercentage: 0.30, // 30% of available plants
        requiredRegenerationTime: 24, // months between harvests
        minimumPlantDensity: 50 // plants per hectare
      },
      active: true
    },
    {
      id: 'ashwagandha-quality-thresholds',
      type: 'quality',
      species: 'Withania somnifera',
      parameters: {
        maxMoisture: 12, // %
        minWithanolides: 0.3, // %
        maxTotalAsh: 10, // %
        maxAcidInsolublAsh: 3, // %
        maxPesticides: 0.01, // ppm
        maxHeavyMetals: {
          lead: 10, // ppm
          cadmium: 0.3, // ppm
          mercury: 1, // ppm
          arsenic: 3 // ppm
        },
        requiredDNAMatch: true,
        minActiveCompounds: {
          withanolideA: 0.1, // %
          withanolideD: 0.05 // %
        }
      },
      active: true
    }
  ];

  // Comprehensive validation for collection events
  static async validateCollectionEvent(event: CollectionEvent): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      enforcedRules: []
    };

    const speciesRules = this.rules.filter(rule => 
      rule.species === event.species && rule.active
    );

    for (const rule of speciesRules) {
      switch (rule.type) {
        case 'geo_fence':
          const geoValidation = this.validateGeoFencing(event, rule);
          if (!geoValidation.valid) {
            result.valid = false;
            result.errors.push(...geoValidation.errors);
          } else {
            result.enforcedRules.push(`Geo-fencing: ${geoValidation.zone}`);
          }
          break;

        case 'seasonal':
          const seasonalValidation = this.validateSeasonalRestrictions(event, rule);
          if (!seasonalValidation.valid) {
            result.valid = false;
            result.errors.push(...seasonalValidation.errors);
          } else {
            result.enforcedRules.push('Seasonal restrictions enforced');
          }
          result.warnings.push(...seasonalValidation.warnings);
          break;

        case 'conservation':
          const conservationValidation = await this.validateConservationLimits(event, rule);
          if (!conservationValidation.valid) {
            result.valid = false;
            result.errors.push(...conservationValidation.errors);
          } else {
            result.enforcedRules.push('Conservation limits enforced');
          }
          result.warnings.push(...conservationValidation.warnings);
          break;

        case 'quality':
          const qualityValidation = this.validateQualityThresholds(event, rule);
          if (!qualityValidation.valid) {
            result.valid = false;
            result.errors.push(...qualityValidation.errors);
          } else {
            result.enforcedRules.push('Quality thresholds met');
          }
          break;
      }
    }

    // Log validation to blockchain
    if (result.valid) {
      await BlockchainAPI.submitTransaction(
        'validation_passed',
        { batchId: event.batchId, rules: result.enforcedRules },
        event.collectorId
      );
    }

    return result;
  }

  private static validateGeoFencing(event: CollectionEvent, rule: SmartContractRule): {
    valid: boolean;
    errors: string[];
    zone?: string;
  } {
    const { allowedZones } = rule.parameters;
    
    for (const zone of allowedZones) {
      const [[minLat, minLng], [maxLat, maxLng]] = zone.bounds;
      if (event.lat >= minLat && event.lat <= maxLat && 
          event.lng >= minLng && event.lng <= maxLng) {
        return { valid: true, errors: [], zone: zone.name };
      }
    }

    return {
      valid: false,
      errors: [`Harvesting location (${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}) is outside approved zones for ${event.species}`]
    };
  }

  private static validateSeasonalRestrictions(event: CollectionEvent, rule: SmartContractRule): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const { harvestingMonths, closedMonths, reasoningPeriods } = rule.parameters;
    const month = new Date(event.timestamp).getMonth() + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (closedMonths.includes(month)) {
      errors.push(`Harvesting prohibited in month ${month} (monsoon protection period)`);
    } else if (!harvestingMonths.includes(month)) {
      if (reasoningPeriods.includes(month)) {
        errors.push(`Harvesting prohibited in month ${month} (plant recovery period)`);
      } else {
        errors.push(`Harvesting not permitted in month ${month} for ${event.species}`);
      }
    }

    // Warnings for edge cases
    if (month === harvestingMonths[harvestingMonths.length - 1]) {
      warnings.push('End of harvesting season approaching - ensure sufficient recovery time');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private static async validateConservationLimits(event: CollectionEvent, rule: SmartContractRule): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const { maxDailyHarvestPerZone, maxSeasonalHarvestPerZone, maxHarvestPercentage } = rule.parameters;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Simulate checking current harvest levels
    const currentDailyHarvest = event.initialQualityMetrics.estimated_yield;
    const todaysHarvestInZone = 45.0; // Simulated query result
    const seasonalHarvestInZone = 1200.0; // Simulated query result

    if (todaysHarvestInZone + currentDailyHarvest > maxDailyHarvestPerZone) {
      errors.push(`Daily harvest limit exceeded: ${(todaysHarvestInZone + currentDailyHarvest).toFixed(1)}kg > ${maxDailyHarvestPerZone}kg`);
    }

    if (seasonalHarvestInZone + currentDailyHarvest > maxSeasonalHarvestPerZone) {
      errors.push(`Seasonal harvest limit exceeded: ${(seasonalHarvestInZone + currentDailyHarvest).toFixed(1)}kg > ${maxSeasonalHarvestPerZone}kg`);
    }

    // Warning thresholds
    const dailyUsagePercent = (todaysHarvestInZone + currentDailyHarvest) / maxDailyHarvestPerZone;
    if (dailyUsagePercent > 0.8) {
      warnings.push(`Daily harvest quota is ${(dailyUsagePercent * 100).toFixed(1)}% utilized`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private static validateQualityThresholds(event: CollectionEvent, rule: SmartContractRule): {
    valid: boolean;
    errors: string[];
  } {
    const { maxMoisture, minWithanolides } = rule.parameters;
    const errors: string[] = [];

    if (event.initialQualityMetrics.moisture > maxMoisture) {
      errors.push(`Moisture content ${event.initialQualityMetrics.moisture}% exceeds maximum ${maxMoisture}%`);
    }

    // Visual quality check
    if (event.initialQualityMetrics.visual_quality === 'poor') {
      errors.push('Visual quality assessment failed - poor grade not acceptable');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get conservation status for dashboard
  static async getConservationStatus(species: string, zone: string): Promise<ConservationStatus> {
    // Simulate real-time conservation data
    return {
      species,
      zone,
      dailyHarvestUsed: 67.5,
      dailyHarvestLimit: 100,
      seasonalHarvestUsed: 1350,
      seasonalHarvestLimit: 2000,
      plantPopulationHealth: 94.2
    };
  }

  // Predictive analysis for harvest planning
  static async predictHarvestWindow(species: string, location: { lat: number; lng: number }): Promise<{
    nextOptimalHarvest: string;
    estimatedYield: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    // Simulate predictive model
    const nextOptimalHarvest = new Date();
    nextOptimalHarvest.setMonth(nextOptimalHarvest.getMonth() + 3);

    return {
      nextOptimalHarvest: nextOptimalHarvest.toISOString().split('T')[0],
      estimatedYield: 85.3,
      riskFactors: [
        'Monsoon season approaching',
        'High regional demand may affect sustainability'
      ],
      recommendations: [
        'Plan harvest within next 4 weeks',
        'Implement rotational harvesting to maintain plant health',
        'Consider alternative collection sites to reduce pressure'
      ]
    };
  }

  static getRules(): SmartContractRule[] {
    return [...this.rules];
  }

  static updateRule(ruleId: string, updates: Partial<SmartContractRule>): void {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    }
  }
}