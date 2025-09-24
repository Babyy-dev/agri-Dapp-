import mongoose, { Document, Schema } from 'mongoose';

export interface IQualityTest extends Document {
  batchId: string;
  testType: 'pesticide' | 'heavy_metals' | 'dna_barcode' | 'potency' | 'microbial';
  result: 'pass' | 'fail' | 'pending';
  values: Record<string, number>;
  certificateHash: string;
  timestamp: Date;
  labId: string;
  compliance: boolean;
  testMethodology?: string;
  equipment?: string;
  technician?: string;
  retestRequired?: boolean;
  blockchainTxHash?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QualityTestSchema = new Schema({
  batchId: {
    type: String,
    required: true,
    index: true,
    maxlength: 50
  },
  testType: {
    type: String,
    required: true,
    enum: ['pesticide', 'heavy_metals', 'dna_barcode', 'potency', 'microbial'],
    index: true
  },
  result: {
    type: String,
    required: true,
    enum: ['pass', 'fail', 'pending'],
    default: 'pending',
    index: true
  },
  values: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  certificateHash: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  labId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  compliance: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  testMethodology: {
    type: String,
    maxlength: 200
  },
  equipment: {
    type: String,
    maxlength: 200
  },
  technician: {
    type: String,
    maxlength: 100
  },
  retestRequired: {
    type: Boolean,
    default: false
  },
  blockchainTxHash: {
    type: String,
    maxlength: 100
  },
  attachments: [{
    type: String,
    maxlength: 500 // URLs or file paths for certificates/reports
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
QualityTestSchema.index({ batchId: 1, testType: 1 });
QualityTestSchema.index({ labId: 1, timestamp: -1 });
QualityTestSchema.index({ result: 1, compliance: 1 });
QualityTestSchema.index({ certificateHash: 1 }, { unique: true });

// Virtual for test age in days
QualityTestSchema.virtual('testAgeInDays').get(function(this: IQualityTest) {
  const now = new Date();
  const testDate = new Date(this.timestamp);
  return Math.floor((now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Static method to get all tests for a batch
QualityTestSchema.statics.getBatchTests = function(batchId: string) {
  return this.find({ batchId })
    .sort({ timestamp: -1 })
    .populate('labId', 'name organizationId');
};

// Static method to get compliance summary
QualityTestSchema.statics.getComplianceSummary = function(batchId: string) {
  return this.aggregate([
    { $match: { batchId } },
    {
      $group: {
        _id: null,
        totalTests: { $sum: 1 },
        passedTests: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
        failedTests: { $sum: { $cond: [{ $eq: ['$result', 'fail'] }, 1, 0] } },
        pendingTests: { $sum: { $cond: [{ $eq: ['$result', 'pending'] }, 1, 0] } },
        overallCompliance: { $avg: { $cond: ['$compliance', 1, 0] } }
      }
    }
  ]);
};

export const QualityTest = mongoose.model<IQualityTest>('QualityTest', QualityTestSchema);