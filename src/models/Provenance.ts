import mongoose, { Document, Schema } from 'mongoose';

export interface IProvenance extends Document {
  batchId: string;
  chainOfCustody: {
    organizationId: string;
    timestamp: Date;
    action: string;
    location: { lat: number; lng: number };
  }[];
  sustainabilityProofs: {
    type: 'organic' | 'fair_trade' | 'sustainable_harvest' | 'community_support';
    certificateId: string;
    issuedBy: string;
    validUntil: Date;
  }[];
  finalProduct: {
    qrCode: string;
    productName: string;
    manufacturerId: string;
    batchSize: number;
    expiryDate: Date;
  };
  verified: boolean;
  blockchainTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChainOfCustodySchema = new Schema({
  organizationId: { type: String, required: true, ref: 'Organization' },
  timestamp: { type: Date, required: true },
  action: { type: String, required: true, maxlength: 200 },
  location: {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 }
  }
}, { _id: false });

const SustainabilityProofSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['organic', 'fair_trade', 'sustainable_harvest', 'community_support']
  },
  certificateId: { type: String, required: true, maxlength: 100 },
  issuedBy: { type: String, required: true, maxlength: 200 },
  validUntil: { type: Date, required: true }
}, { _id: false });

const FinalProductSchema = new Schema({
  qrCode: { type: String, required: true, unique: true, maxlength: 100 },
  productName: { type: String, required: true, maxlength: 200 },
  manufacturerId: { type: String, required: true, ref: 'Organization' },
  batchSize: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true }
}, { _id: false });

const ProvenanceSchema = new Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    maxlength: 50
  },
  chainOfCustody: {
    type: [ChainOfCustodySchema],
    required: true
  },
  sustainabilityProofs: {
    type: [SustainabilityProofSchema],
    default: []
  },
  finalProduct: {
    type: FinalProductSchema,
    required: true
  },
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  blockchainTxHash: {
    type: String,
    maxlength: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ProvenanceSchema.index({ 'finalProduct.qrCode': 1 }, { unique: true });
ProvenanceSchema.index({ 'finalProduct.manufacturerId': 1 });
ProvenanceSchema.index({ verified: 1, 'finalProduct.expiryDate': 1 });

// Static method to find by QR code
ProvenanceSchema.statics.findByQRCode = function(qrCode: string) {
  return this.findOne({ 'finalProduct.qrCode': qrCode })
    .populate('chainOfCustody.organizationId', 'name type location')
    .populate('finalProduct.manufacturerId', 'name location');
};

export const Provenance = mongoose.model<IProvenance>('Provenance', ProvenanceSchema);

// Smart Contract Rule Schema
export interface ISmartContractRule extends Document {
  id: string;
  type: 'geo_fence' | 'seasonal' | 'conservation' | 'quality';
  species: string;
  parameters: Record<string, any>;
  active: boolean;
  description?: string;
  createdBy?: string;
  lastModified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SmartContractRuleSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['geo_fence', 'seasonal', 'conservation', 'quality'],
    index: true
  },
  species: {
    type: String,
    required: true,
    maxlength: 100,
    index: true
  },
  parameters: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: String,
    ref: 'User'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
SmartContractRuleSchema.index({ species: 1, type: 1, active: 1 });

// Static method to get active rules for species
SmartContractRuleSchema.statics.getActiveRulesForSpecies = function(species: string) {
  return this.find({ species, active: true }).sort({ type: 1 });
};

export const SmartContractRule = mongoose.model<ISmartContractRule>('SmartContractRule', SmartContractRuleSchema);