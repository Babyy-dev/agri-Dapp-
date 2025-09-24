import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  id: string;
  name: string;
  type: 'FarmerCoop' | 'WildCollectorGroup' | 'ProcessingFacility' | 'TestingLab' | 'Manufacturer';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  certifications: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema({
  lat: { type: Number, required: true, min: -90, max: 90 },
  lng: { type: Number, required: true, min: -180, max: 180 },
  address: { type: String, required: true, maxlength: 500 }
}, { _id: false });

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['FarmerCoop', 'WildCollectorGroup', 'ProcessingFacility', 'TestingLab', 'Manufacturer']
  },
  location: {
    type: LocationSchema,
    required: true
  },
  certifications: [{
    type: String,
    maxlength: 100
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
OrganizationSchema.index({ type: 1, isActive: 1 });
OrganizationSchema.index({ 'location.lat': 1, 'location.lng': 1 });
OrganizationSchema.index({ name: 1 }, { unique: true });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);