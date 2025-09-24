import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  organizationId: string;
  role: 'farmer' | 'collector' | 'processor' | 'lab_tech' | 'manufacturer' | 'admin';
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  organizationId: {
    type: String,
    required: true,
    ref: 'Organization'
  },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'collector', 'processor', 'lab_tech', 'manufacturer', 'admin']
  },
  permissions: [{
    type: String,
    enum: [
      'create_collection_event',
      'view_own_batches',
      'create_processing_step',
      'view_batches',
      'transfer_custody',
      'create_quality_test',
      'approve_batches',
      'create_final_product',
      'generate_qr',
      'view_all_batches',
      'admin_access'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, role: 1 });
UserSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user with organization details
UserSchema.statics.findWithOrganization = function(userId: string) {
  return this.findById(userId).populate('organizationId');
};

export const User = mongoose.model<IUser>('User', UserSchema);