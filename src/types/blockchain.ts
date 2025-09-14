export interface Organization {
  id: string;
  name: string;
  type: 'FarmerCoop' | 'WildCollectorGroup' | 'ProcessingFacility' | 'TestingLab' | 'Manufacturer';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  certifications: string[];
}

export interface CollectionEvent {
  batchId: string;
  lat: number;
  lng: number;
  timestamp: string;
  collectorId: string;
  species: string;
  initialQualityMetrics: {
    moisture: number;
    visual_quality: 'excellent' | 'good' | 'fair' | 'poor';
    estimated_yield: number;
  };
  photos: string[];
  harvestingZone: string;
  approved: boolean;
}

export interface ProcessingStep {
  batchId: string;
  stepType: 'drying' | 'grinding' | 'extraction' | 'packaging' | 'storage';
  parameters: Record<string, any>;
  timestamp: string;
  processorId: string;
  temperature?: number;
  humidity?: number;
  duration?: number;
}

export interface QualityTest {
  batchId: string;
  testType: 'pesticide' | 'heavy_metals' | 'dna_barcode' | 'potency' | 'microbial';
  result: 'pass' | 'fail' | 'pending';
  values: Record<string, number>;
  certificateHash: string;
  timestamp: string;
  labId: string;
  compliance: boolean;
}

export interface Provenance {
  batchId: string;
  chainOfCustody: {
    organizationId: string;
    timestamp: string;
    action: string;
    location: { lat: number; lng: number };
  }[];
  sustainabilityProofs: {
    type: 'organic' | 'fair_trade' | 'sustainable_harvest' | 'community_support';
    certificateId: string;
    issuedBy: string;
    validUntil: string;
  }[];
  finalProduct: {
    qrCode: string;
    productName: string;
    manufacturerId: string;
    batchSize: number;
    expiryDate: string;
  };
}

export interface SmartContractRule {
  id: string;
  type: 'geo_fence' | 'seasonal' | 'conservation' | 'quality';
  species: string;
  parameters: Record<string, any>;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  organizationId: string;
  role: 'farmer' | 'collector' | 'processor' | 'lab_tech' | 'manufacturer' | 'admin';
  permissions: string[];
}