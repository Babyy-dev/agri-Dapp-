export interface HarvestingZone {
  id: string;
  name: string;
  species: string[];
  boundaries: {
    type: 'polygon';
    coordinates: number[][][];
  };
  restrictions: {
    seasonalMonths: number[];
    maxDailyHarvest: number;
    conservationRules: string[];
  };
}

export class GeoValidationService {
  private static harvestingZones: HarvestingZone[] = [
    {
      id: 'rajasthan-zone-a',
      name: 'Rajasthan Sustainable Zone A',
      species: ['Withania somnifera', 'Commiphora wightii'],
      boundaries: {
        type: 'polygon',
        coordinates: [[[26.0, 74.0], [27.0, 74.0], [27.0, 75.0], [26.0, 75.0], [26.0, 74.0]]]
      },
      restrictions: {
        seasonalMonths: [10, 11, 12, 1, 2],
        maxDailyHarvest: 100,
        conservationRules: ['max_30_percent_harvest', 'min_plant_age_12_months']
      }
    },
    {
      id: 'mp-zone-b',
      name: 'Madhya Pradesh Conservation Zone B',
      species: ['Withania somnifera', 'Bacopa monnieri'],
      boundaries: {
        type: 'polygon',
        coordinates: [[[22.0, 77.0], [23.0, 77.0], [23.0, 78.0], [22.0, 78.0], [22.0, 77.0]]]
      },
      restrictions: {
        seasonalMonths: [11, 12, 1, 2, 3],
        maxDailyHarvest: 150,
        conservationRules: ['sustainable_collection_certified']
      }
    }
  ];

  static validateLocation(lat: number, lng: number, species: string): {
    valid: boolean;
    zone?: HarvestingZone;
    errors: string[];
  } {
    const errors: string[] = [];
    
    const validZone = this.harvestingZones.find(zone => {
      if (!zone.species.includes(species)) return false;
      return this.isPointInPolygon(lat, lng, zone.boundaries.coordinates[0]);
    });

    if (!validZone) {
      errors.push('Location is outside approved harvesting zones');
      return { valid: false, errors };
    }

    // Check seasonal restrictions
    const currentMonth = new Date().getMonth() + 1;
    if (!validZone.restrictions.seasonalMonths.includes(currentMonth)) {
      errors.push(`Harvesting not permitted in current season (month ${currentMonth})`);
    }

    return {
      valid: errors.length === 0,
      zone: validZone,
      errors
    };
  }

  private static isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i][1] > lng) !== (polygon[j][1] > lng)) &&
          (lat < (polygon[j][0] - polygon[i][0]) * (lng - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
        inside = !inside;
      }
    }
    return inside;
  }

  static getHarvestingZones(): HarvestingZone[] {
    return this.harvestingZones;
  }
}