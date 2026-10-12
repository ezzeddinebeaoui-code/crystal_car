import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  agencyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  availableLocations: string[];
  defaultCurrency: string;
  currencyRates: {
    EUR: number;
    USD: number;
  };
  optionsPricing: {
    driverPerDayTnd: number;
    babySeatPerDayTnd: number;
    gpsPerDayTnd: number;
    additionalDriverPerRentalTnd: number;
  };
  minDriverAge: number;
  cancellationPolicyFr: string;
  cancellationPolicyEn: string;
  cancellationPolicyAr: string;
  businessHours: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    agencyName: { type: String, default: 'Crystal Rent Car Tunisia' },
    phone: { type: String, default: '+216 71 888 999' },
    whatsapp: { type: String, default: '+216 98 123 456' },
    email: { type: String, default: 'contact@crystalrentcar.com' },
    address: { type: String, default: 'Avenue Habib Bourguiba, Tunis, Tunisie' },
    availableLocations: [
      {
        type: String,
        default: [
          'Aéroport Tunis-Carthage (TUN)',
          'Aéroport Enfidha-Hammamet (NBE)',
          'Aéroport Monastir Habib-Bourguiba (MIR)',
          'Aéroport Djerba-Zarzis (DJE)',
          'Agence Tunis Centre',
          'Zone Touristique Hammamet',
          'Sousse & Port El Kantaoui',
        ],
      },
    ],
    defaultCurrency: { type: String, default: 'TND' },
    currencyRates: {
      EUR: { type: Number, default: 0.29 }, // 1 TND ≈ 0.29 EUR
      USD: { type: Number, default: 0.32 }, // 1 TND ≈ 0.32 USD
    },
    optionsPricing: {
      driverPerDayTnd: { type: Number, default: 60 },
      babySeatPerDayTnd: { type: Number, default: 15 },
      gpsPerDayTnd: { type: Number, default: 10 },
      additionalDriverPerRentalTnd: { type: Number, default: 30 },
    },
    minDriverAge: { type: Number, default: 23 },
    cancellationPolicyFr: {
      type: String,
      default: 'Annulation gratuite jusqu’à 48h avant la prise en charge du véhicule.',
    },
    cancellationPolicyEn: {
      type: String,
      default: 'Free cancellation up to 48 hours prior to vehicle pickup.',
    },
    cancellationPolicyAr: {
      type: String,
      default: 'إلغاء مجاني حتى 48 ساعة قبل موعد استلام السيارة.',
    },
    businessHours: { type: String, default: '7j/7 - 24h/24 Assistance & Prise en charge' },
  },
  { timestamps: true }
);

export const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
