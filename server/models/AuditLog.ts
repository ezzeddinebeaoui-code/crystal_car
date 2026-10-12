import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: string;
  performerEmail: string;
  performerRole: string;
  entityType: 'booking' | 'vehicle' | 'user' | 'settings' | 'auth';
  entityId?: string;
  details: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    performerEmail: { type: String, required: true },
    performerRole: { type: String, default: 'admin' },
    entityType: {
      type: String,
      enum: ['booking', 'vehicle', 'user', 'settings', 'auth'],
      required: true,
    },
    entityId: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
