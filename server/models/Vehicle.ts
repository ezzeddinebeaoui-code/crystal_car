import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle {
  _id?: string;
  brand: string;
  model: string;
  slug: string;
  category: string;
  year: number;
  dailyRateTnd: number;
  currency: string;
  images: string[];
  seats: number;
  luggage: number;
  transmission: 'Automatique' | 'Manuelle';
  fuelType: 'Essence' | 'Diesel' | 'Hybride' | 'Électrique';
  airConditioning: boolean;
  mileagePolicy: string;
  depositAmountTnd: number;
  minAge: number;
  status: 'available' | 'maintenance' | 'reserved' | 'archived';
  isFeatured: boolean;
  description: string;
  features: string[];
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    dailyRateTnd: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'TND' },
    images: [{ type: String }],
    seats: { type: Number, required: true, default: 5 },
    luggage: { type: Number, required: true, default: 2 },
    transmission: { type: String, enum: ['Automatique', 'Manuelle'], required: true },
    fuelType: { type: String, enum: ['Essence', 'Diesel', 'Hybride', 'Électrique'], required: true },
    airConditioning: { type: Boolean, default: true },
    mileagePolicy: { type: String, default: 'Kilométrage illimité' },
    depositAmountTnd: { type: Number, default: 1000 },
    minAge: { type: Number, default: 23 },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'reserved', 'archived'],
      default: 'available',
    },
    isFeatured: { type: Boolean, default: false },
    description: { type: String, default: '' },
    features: [{ type: String }],
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VehicleSchema.index({ category: 1, status: 1 });
VehicleSchema.index({ dailyRateTnd: 1 });

export const Vehicle = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
