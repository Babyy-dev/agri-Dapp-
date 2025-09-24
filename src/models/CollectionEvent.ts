import mongoose, { Document, Schema } from 'mongoose';

export interface ICollectionEvent extends Document {
  batchId: string;
  lat: number;
  lng: number;
  timestamp: Date;
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
  blockchainTxHash?: string;
  smartContractValidation?: {
    geoFenceValid: boolean;
    seasonalValid: boolean;
    conservationValid: boolean;
    qualityValid: boolean;
    validationRules: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const QualityMetricsSchema = new Schema({
  moisture: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  visual_quality: { 
    type: String, 
    required: true, 
    enum: ['excellent', 'good', 'fair', 'poor'] 
  },
  estimated_yield: { 
    type: Number, 
    required: true, 
    min: 0 
  }
}, { _id: false });

const SmartContractValidationSchema = new Schema({
  geoFenceValid: { type: Boolean, required: true },
  seasonalValid: { type: Boolean, required: true },
  conservationValid: { type: Boolean, required: true },
  qualityValid: { type: Boolean, required: true },
  validationRules: [{ type: String }]
}, { _id: false });

const CollectionEventSchema = new Schema({
  batchId: {
    type: String,
    required: true,
    index: true,
    maxlength: 50
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  collectorId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  species: {
    type: String,
    required: true,
    maxlength: 100,
    index: true
  },
  initialQualityMetrics: {
    type: QualityMetricsSchema,
    required: true
  },
  photos: [{
    type: String,
    maxlength: 500 // URL or file path
  }],
  harvestingZone: {
    type: String,
    required: true,
    maxlength: 100,
    index: true
  },
  approved: {
    type: Boolean,
    default: false,
    index: true
  },
  blockchainTxHash: {
    type: String,
    maxlength: 100
  },
  smartContractValidation: {
    type: SmartContractValidationSchema
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
CollectionEventSchema.index({ batchId: 1, timestamp: -1 });
CollectionEventSchema.index({ collectorId: 1, timestamp: -1 });
CollectionEventSchema.index({ species: 1, harvestingZone: 1 });
CollectionEventSchema.index({ lat: 1, lng: 1 }); // Geospatial queries
CollectionEventSchema.index({ approved: 1, timestamp: -1 });

// Text search index
CollectionEventSchema.index({ species: 'text', harvestingZone: 'text' });

export const CollectionEvent = mongoose.model<ICollectionEvent>('CollectionEvent', CollectionEventSchema);