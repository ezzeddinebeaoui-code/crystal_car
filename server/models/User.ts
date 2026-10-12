import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  phone?: string;
  status: 'active' | 'suspended';
  favorites: string[]; // Vehicle IDs
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    favorites: [{ type: String }],
  },
  { timestamps: true }
);

// Do not return passwordHash in queries by default
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
