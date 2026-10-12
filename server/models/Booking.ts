import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IBookingStatusChange {
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  changedAt: Date;
  changedBy: string;
  note?: string;
}

export interface IBooking extends Document {
  referenceCode: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerFlightNumber?: string;
  vehicleId: mongoose.Types.ObjectId | string;
  vehicleSnapshot: {
    brand: string;
    model: string;
    category: string;
    image: string;
  };
  pickupLocation: string;
  returnLocation: string;
  pickupDate: Date;
  returnDate: Date;
  pickupTime: string;
  returnTime: string;
  rentalDays: number;
  dailyRateSnapshot: number;
  options: {
    driverService: boolean;
    babySeat: boolean;
    gps: boolean;
    additionalDriver: boolean;
  };
  optionsTotalTnd: number;
  depositAmountSnapshot: number;
  totalPriceTnd: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: 'pay_on_arrival' | 'pending' | 'completed';
  adminNotes?: string;
  statusHistory: IBookingStatusChange[];
  cancellationRequested?: boolean;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    referenceCode: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, required: true, trim: true },
    customerFlightNumber: { type: String, default: '' },
    vehicleId: { type: Schema.Types.Mixed, required: true, index: true },
    vehicleSnapshot: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      category: { type: String, required: true },
      image: { type: String, default: '' },
    },
    pickupLocation: { type: String, required: true },
    returnLocation: { type: String, required: true },
    pickupDate: { type: Date, required: true, index: true },
    returnDate: { type: Date, required: true, index: true },
    pickupTime: { type: String, default: '10:00' },
    returnTime: { type: String, default: '10:00' },
    rentalDays: { type: Number, required: true, min: 1 },
    dailyRateSnapshot: { type: Number, required: true },
    options: {
      driverService: { type: Boolean, default: false },
      babySeat: { type: Boolean, default: false },
      gps: { type: Boolean, default: false },
      additionalDriver: { type: Boolean, default: false },
    },
    optionsTotalTnd: { type: Number, default: 0 },
    depositAmountSnapshot: { type: Number, default: 1000 },
    totalPriceTnd: { type: Number, required: true },
    currency: { type: String, default: 'TND' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pay_on_arrival', 'pending', 'completed'],
      default: 'pay_on_arrival',
    },
    adminNotes: { type: String, default: '' },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: 'system' },
        note: { type: String, default: '' },
      },
    ],
    cancellationRequested: { type: Boolean, default: false },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

BookingSchema.index({ vehicleId: 1, pickupDate: 1, returnDate: 1, status: 1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
