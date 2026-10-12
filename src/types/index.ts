export type Language = 'fr' | 'en' | 'ar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  favorites?: string[];
}

export interface Vehicle {
  _id: string;
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
}

export interface BookingOptions {
  driverService: boolean;
  babySeat: boolean;
  gps: boolean;
  additionalDriver: boolean;
}

export interface BookingStatusHistory {
  status: string;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface Booking {
  _id: string;
  referenceCode: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerFlightNumber?: string;
  vehicleId: string;
  vehicleSnapshot: {
    brand: string;
    model: string;
    category: string;
    image: string;
  };
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  rentalDays: number;
  dailyRateSnapshot: number;
  options: BookingOptions;
  optionsTotalTnd: number;
  depositAmountSnapshot: number;
  totalPriceTnd: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: 'pay_on_arrival' | 'pending' | 'completed';
  adminNotes?: string;
  statusHistory?: BookingStatusHistory[];
  cancellationRequested?: boolean;
  cancellationReason?: string;
  createdAt: string;
}

export interface SiteSettings {
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
}

export interface RecommendedVehicleItem {
  vehicleId: string;
  brand: string;
  model: string;
  category: string;
  dailyRateTnd: number;
  image: string;
  seats: number;
  luggage: number;
  transmission: string;
  fuelType: string;
  reason: string;
  isAvailable: boolean;
}
