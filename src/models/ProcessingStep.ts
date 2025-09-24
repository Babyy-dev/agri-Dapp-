import mongoose, { Document, Schema } from 'mongoose';

export interface IProcessingStep extends Document {
  batchId: string;
  stepType: 'drying' | 'grinding' | 'extraction' | 'packaging' | 'storage';
  parameters: Record<string, any>;
  timestamp: Date;
  processorId: string;
  temperature?: number;
  humidity?: number;
  duration?: number; // in minutes
  qualityControlPassed: boolean;
  blockchainTxHash?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessingStepSchema = new Schema({
  batchId: {
    type: String,
    required: true,
    index: true,
    maxlength: 50
  },
  stepType: {
    type: String,
    required: true,
    enum: ['drying', 'grinding', 'extraction', 'packaging', 'storage'],
    index: true
  },
  parameters: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  processorId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  temperature: {
    type: Number,
    min: -50,
    max: 200 // Celsius
  },
  humidity: {
    type: Number,
    min: 0,
    max: 100 // Percentage
  },
  duration: {
    type: Number,
    min: 0 // Duration in minutes
  },
  qualityControlPassed: {
    type: Boolean,
    default: true,
    index: true
  },
  blockchainTxHash: {
    type: String,
    maxlength: 100
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
ProcessingStepSchema.index({ batchId: 1, timestamp: 1 });
ProcessingStepSchema.index({ processorId: 1, timestamp: -1 });
ProcessingStepSchema.index({ stepType: 1, qualityControlPassed: 1 });

// Virtual for processing duration in hours
ProcessingStepSchema.virtual('durationHours').get(function(this: IProcessingStep) {
  return this.duration ? Math.round((this.duration / 60) * 100) / 100 : 0;
});

// Static method to get processing timeline for a batch
ProcessingStepSchema.statics.getBatchTimeline = function(batchId: string) {
  return this.find({ batchId })
    .sort({ timestamp: 1 })
    .populate('processorId', 'name organizationId');
};

export const ProcessingStep = mongoose.model<IProcessingStep>('ProcessingStep', ProcessingStepSchema);