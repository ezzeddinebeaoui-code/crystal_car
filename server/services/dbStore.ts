import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.ts';
import { Vehicle, IVehicle } from '../models/Vehicle.ts';
import { Booking, IBooking } from '../models/Booking.ts';
import { SiteSettings, ISiteSettings } from '../models/SiteSettings.ts';
import { AuditLog, IAuditLog } from '../models/AuditLog.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'crystal_store.json');

// Interface for local resilient storage
export interface LocalStoreData {
  users: any[];
  vehicles: any[];
  bookings: any[];
  settings: any;
  auditLogs: any[];
}

// In-memory cache when running in resilient local mode
let memoryStore: LocalStoreData = {
  users: [],
  vehicles: [],
  bookings: [],
  settings: null,
  auditLogs: [],
};

// Ensure data folder exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      // Ignore if cannot write
    }
  }
}

// Load from file if available
function loadStoreFromFile(): boolean {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(content);
      return true;
    }
  } catch (err) {
    console.error('Could not load crystal_store.json:', err);
  }
  return false;
}

// Save to file
function saveStoreToFile() {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    // Ignore in read-only setups
  }
}

// Seed default dataset for Crystal Rent Car Tunisia
export async function initializeDatabaseAndSeeds() {
  const isMongooseReady = mongoose.connection.readyState === 1;

  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'AdminCrystal2026!Secure';
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(defaultAdminPassword, salt);
  const demoCustomerPasswordHash = await bcrypt.hash('ClientCrystal2026!', salt);

  const initialVehicles = [
    {
      _id: 'veh_01_toyota_chr',
      brand: 'Toyota',
      model: 'C-HR Hybride',
      slug: 'toyota-c-hr-hybride',
      category: 'SUV & 4x4',
      year: 2024,
      dailyRateTnd: 180,
      currency: 'TND',
      images: [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: 5,
      luggage: 3,
      transmission: 'Automatique',
      fuelType: 'Hybride',
      airConditioning: true,
      mileagePolicy: 'Kilométrage illimité',
      depositAmountTnd: 1500,
      minAge: 23,
      status: 'available',
      isFeatured: true,
      description:
        'Le Toyota C-HR allie la technologie hybride auto-rechargeable à une ligne futuriste audacieuse. Idéal pour explorer la Tunisie avec confort, faible consommation et transmission automatique fluide.',
      features: [
        'Boîte automatique CVT',
        'Motorisation hybride économe',
        'Climatisation automatique bi-zone',
        'Caméra de recul & Radars 360°',
        'Apple CarPlay & Android Auto',
        'Régulateur adaptatif Toyota Safety Sense',
      ],
      verified: true,
    },
    {
      _id: 'veh_02_renault_clio4',
      brand: 'Renault',
      model: 'Clio 4',
      slug: 'renault-clio-4',
      category: 'Économique',
      year: 2023,
      dailyRateTnd: 95,
      currency: 'TND',
      images: [
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: 5,
      luggage: 2,
      transmission: 'Manuelle',
      fuelType: 'Essence',
      airConditioning: true,
      mileagePolicy: 'Kilométrage illimité',
      depositAmountTnd: 1000,
      minAge: 21,
      status: 'available',
      isFeatured: true,
      description:
        'La référence des citadines en Tunisie. Agile, sobre et très confortable, la Renault Clio 4 est la compagne idéale pour vos trajets urbains à Tunis, vos escapades à Sidi Bou Saïd ou vos séjours côtiers.',
      features: [
        'Climatisation',
        'Écran tactile MediaNav Bluetooth',
        'Régulateur / Limiteur de vitesse',
        'Faible consommation (5.1L / 100km)',
        'Direction assistée électrique',
      ],
      verified: true,
    },
    {
      _id: 'veh_03_mercedes_eclass',
      brand: 'Mercedes-Benz',
      model: 'Classe E Berline',
      slug: 'mercedes-benz-classe-e',
      category: 'Luxe & Prestige',
      year: 2024,
      dailyRateTnd: 450,
      currency: 'TND',
      images: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: 5,
      luggage: 4,
      transmission: 'Automatique',
      fuelType: 'Diesel',
      airConditioning: true,
      mileagePolicy: 'Kilométrage illimité',
      depositAmountTnd: 3500,
      minAge: 25,
      status: 'available',
      isFeatured: true,
      description:
        'Le summum du raffinement automobile chez Crystal Rent Car. Finitions exclusives, sellerie cuir Nappa, insonorisation d’exception et puissance sereine pour vos déplacements VIP ou cérémonies de prestige.',
      features: [
        'Transmission 9G-TRONIC',
        'Cockpit Widescreen MBUX haute résolution',
        'Sellerie cuir luxueuse chauffante',
        'Système son ambiophonique Burmester',
        'Éclairage d’ambiance 64 couleurs',
        'Suspension pneumatique AIR BODY CONTROL',
      ],
      verified: true,
    },
    {
      _id: 'veh_04_mercedes_cclass',
      brand: 'Mercedes-Benz',
      model: 'Classe C Berline',
      slug: 'mercedes-benz-classe-c',
      category: 'Berline Premium',
      year: 2024,
      dailyRateTnd: 320,
      currency: 'TND',
      images: [
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: 5,
      luggage: 3,
      transmission: 'Automatique',
      fuelType: 'Diesel',
      airConditioning: true,
      mileagePolicy: 'Kilométrage illimité',
      depositAmountTnd: 2500,
      minAge: 24,
      status: 'available',
      isFeatured: true,
      description:
        'L’élégance sportive par excellence. Conçue pour offrir une dynamique de conduite remarquable et un habitacle d’avant-garde doté du système MBUX de dernière génération.',
      features: [
        'Boîte automatique 9 rapports',
        'Écran tactile vertical 11.9 pouces',
        'Pack AMG Line intérieur/extérieur',
        'Phares Digital Light',
        'Assistance active au stationnement PARKTRONIC',
      ],
      verified: true,
    },
    {
      _id: 'veh_05_kia_sportage',
      brand: 'Kia',
      model: 'Sportage GT-Line',
      slug: 'kia-sportage-gt-line',
      category: 'SUV & 4x4',
      year: 2024,
      dailyRateTnd: 220,
      currency: 'TND',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: 5,
      luggage: 4,
      transmission: 'Automatique',
      fuelType: 'Diesel',
      airConditioning: true,
      mileagePolicy: 'Kilométrage illimité',
      depositAmountTnd: 2000,
      minAge: 23,
      status: 'available',
      isFeatured: true,
      description:
        'SUV moderne et spacieux par excellence. Parfait pour les voyages en famille à travers toute la Tunisie, avec un coffre généreux de 591 litres, un toit ouvrant panoramique et un agrément routier remarquable.',
      features: [
        'Boîte automatique double embrayage DCT',
        'Double écran incurvé panoramique 12.3 pouces',
        'Toit ouvrant panoramique',
        'Sellerie cuir suédé GT-Line',
        'Hayon électrique intelligent',
      ],
      verified: true,
    },
    {
      _id: 'veh_06_vw_golf8',
      brand: 'Volkswagen',
      model: 'Golf 8 Life',
      slug: 'volkswagen-golf-8',
      category: 'Compacte',
      year: 2023,
      dailyRateTnd: 160,
      currency: 'TND',
      images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: 5,
      luggage: 3,
      transmission: 'Automatique',
      fuelType: 'Essence',
      airConditioning: true,
      mileagePolicy: 'Kilométrage illimité',
      depositAmountTnd: 1500,
      minAge: 22,
      status: 'available',
      isFeatured: false,
      description:
        'L’icône compacte allemande. Tenue de route irréprochable, boîte DSG réactive et habitacle digitalisé pour allier plaisir de conduite et discrétion haut de gamme.',
      features: [
        'Boîte automatique DSG7',
        'Digital Cockpit Pro',
        'Climatisation Climatronic 3 zones',
        'Phares à LED et régulateur adaptatif',
      ],
      verified: true,
    },
    {
      _id: 'veh_07_hyundai_i20',
      brand: 'Hyundai',
      model: 'i20 Facelift',
      slug: 'hyundai-i20-facelift',
      category: 'Économique',
      year: 2023,
      dailyRateTnd: 90,
      currency: 'TND',
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: 5,
      luggage: 2,
      transmission: 'Manuelle',
      fuelType: 'Essence',
      airConditioning: true,
      mileagePolicy: 'Kilométrage illimité',
      depositAmountTnd: 1000,
      minAge: 21,
      status: 'available',
      isFeatured: false,
      description:
        'Une citadine polyvalente moderne, bien équipée et très maniable. Idéale pour les petits budgets souhaitant un véhicule récent et économique avec climatisation puissante.',
      features: [
        'Climatisation',
        'Bluetooth mains libres',
        'Caméra de recul',
        'Commandes au volant',
      ],
      verified: true,
    },
  ];

  const initialSettings = {
    _id: 'site_settings_default',
    agencyName: 'Crystal Rent Car Tunisia',
    phone: '+216 71 888 999',
    whatsapp: '+216 98 123 456',
    email: 'contact@crystalrentcar.com',
    address: 'Avenue Habib Bourguiba, Tunis 1001, Tunisie',
    availableLocations: [
      'Aéroport Tunis-Carthage (TUN)',
      'Aéroport Enfidha-Hammamet (NBE)',
      'Aéroport Monastir Habib-Bourguiba (MIR)',
      'Aéroport Djerba-Zarzis (DJE)',
      'Agence Tunis Centre (Avenue Habib Bourguiba)',
      'Zone Touristique Hammamet Yasmine',
      'Sousse Ville & Port El Kantaoui',
      'La Marsa & Gammarth (Côte de Carthage)',
    ],
    defaultCurrency: 'TND',
    currencyRates: {
      EUR: 0.29,
      USD: 0.32,
    },
    optionsPricing: {
      driverPerDayTnd: 60,
      babySeatPerDayTnd: 15,
      gpsPerDayTnd: 10,
      additionalDriverPerRentalTnd: 30,
    },
    minDriverAge: 21,
    cancellationPolicyFr: 'Annulation gratuite sans frais jusqu’à 48h avant la prise en charge du véhicule.',
    cancellationPolicyEn: 'Free cancellation up to 48 hours prior to vehicle pickup with no penalty.',
    cancellationPolicyAr: 'إلغاء مجاني حتى 48 ساعة قبل موعد استلام السيارة بدون أي رسوم.',
    businessHours: 'Service 7j/7 - 24h/24 Assistance & Livraison Aéroportuaire',
    updatedAt: new Date(),
  };

  const initialUsers = [
    {
      _id: 'user_admin_01',
      name: process.env.ADMIN_NAME || 'Crystal Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@crystalrentcar.com').toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: process.env.ADMIN_PHONE || '+216 71 888 999',
      status: 'active',
      favorites: ['veh_03_mercedes_eclass', 'veh_01_toyota_chr'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'user_customer_01',
      name: 'Mohamed Ben Salem',
      email: 'client@crystalrentcar.com',
      passwordHash: demoCustomerPasswordHash,
      role: 'customer',
      phone: '+216 98 444 555',
      status: 'active',
      favorites: ['veh_01_toyota_chr'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const initialBookings = [
    {
      _id: 'booking_sample_01',
      referenceCode: 'CRC-2026-8812',
      customerId: 'user_customer_01',
      customerName: 'Mohamed Ben Salem',
      customerEmail: 'client@crystalrentcar.com',
      customerPhone: '+216 98 444 555',
      customerFlightNumber: 'TU 721',
      vehicleId: 'veh_01_toyota_chr',
      vehicleSnapshot: {
        brand: 'Toyota',
        model: 'C-HR Hybride',
        category: 'SUV & 4x4',
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      },
      pickupLocation: 'Aéroport Tunis-Carthage (TUN)',
      returnLocation: 'Aéroport Tunis-Carthage (TUN)',
      pickupDate: new Date('2026-10-20T10:00:00Z'),
      returnDate: new Date('2026-10-25T10:00:00Z'),
      pickupTime: '10:00',
      returnTime: '10:00',
      rentalDays: 5,
      dailyRateSnapshot: 180,
      options: {
        driverService: false,
        babySeat: true,
        gps: false,
        additionalDriver: false,
      },
      optionsTotalTnd: 75,
      depositAmountSnapshot: 1500,
      totalPriceTnd: 975, // (180 * 5) + 75
      currency: 'TND',
      status: 'confirmed',
      paymentStatus: 'pay_on_arrival',
      adminNotes: 'Client régulier. Véhicule préparé propre avec siège bébé.',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date('2026-10-10T09:12:00Z'),
          changedBy: 'Mohamed Ben Salem',
          note: 'Réservation créée en ligne.',
        },
        {
          status: 'confirmed',
          changedAt: new Date('2026-10-10T10:30:00Z'),
          changedBy: 'admin@crystalrentcar.com',
          note: 'Disponibilité validée et réservation confirmée.',
        },
      ],
      createdAt: new Date('2026-10-10T09:12:00Z'),
      updatedAt: new Date('2026-10-10T10:30:00Z'),
    },
    {
      _id: 'booking_sample_02',
      referenceCode: 'CRC-2026-9041',
      customerId: 'user_customer_01',
      customerName: 'Karim Trabelsi',
      customerEmail: 'karim.trabelsi@example.com',
      customerPhone: '+216 22 333 444',
      customerFlightNumber: '',
      vehicleId: 'veh_04_mercedes_cclass',
      vehicleSnapshot: {
        brand: 'Mercedes-Benz',
        model: 'Classe C Berline',
        category: 'Berline Premium',
        image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80',
      },
      pickupLocation: 'Zone Touristique Hammamet Yasmine',
      returnLocation: 'Aéroport Enfidha-Hammamet (NBE)',
      pickupDate: new Date('2026-10-28T09:00:00Z'),
      returnDate: new Date('2026-10-31T18:00:00Z'),
      pickupTime: '09:00',
      returnTime: '18:00',
      rentalDays: 4,
      dailyRateSnapshot: 320,
      options: {
        driverService: true,
        babySeat: false,
        gps: true,
        additionalDriver: false,
      },
      optionsTotalTnd: 280, // (60*4) + (10*4)
      depositAmountSnapshot: 2500,
      totalPriceTnd: 1560, // (320 * 4) + 280
      currency: 'TND',
      status: 'pending',
      paymentStatus: 'pay_on_arrival',
      adminNotes: 'Chauffeur privé demandé à Hammamet.',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date('2026-10-11T14:20:00Z'),
          changedBy: 'Karim Trabelsi',
          note: 'Demande avec chauffeur soumise.',
        },
      ],
      createdAt: new Date('2026-10-11T14:20:00Z'),
      updatedAt: new Date('2026-10-11T14:20:00Z'),
    },
  ];

  const initialAuditLogs = [
    {
      _id: 'audit_01',
      action: 'SYSTEM_BOOTSTRAP',
      performedBy: 'System Engine',
      performerEmail: 'system@crystalrentcar.com',
      performerRole: 'admin',
      entityType: 'settings',
      entityId: 'site_settings_default',
      details: 'Crystal Rent Car Tunisia database initialized with verified fleet inventory.',
      createdAt: new Date(),
    },
  ];

  // If Mongoose is connected to MongoDB Atlas, seed into Atlas
  if (isMongooseReady) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        for (const u of initialUsers) {
          await User.create(u);
        }
        console.log('✅ Seeded initial users to MongoDB Atlas.');
      }

      const vehicleCount = await Vehicle.countDocuments();
      if (vehicleCount === 0) {
        for (const v of initialVehicles) {
          await Vehicle.create(v);
        }
        console.log('✅ Seeded initial vehicles to MongoDB Atlas.');
      }

      const settingsCount = await SiteSettings.countDocuments();
      if (settingsCount === 0) {
        await SiteSettings.create(initialSettings);
        console.log('✅ Seeded default settings to MongoDB Atlas.');
      }

      const bookingCount = await Booking.countDocuments();
      if (bookingCount === 0) {
        for (const b of initialBookings) {
          await Booking.create(b);
        }
        console.log('✅ Seeded initial bookings to MongoDB Atlas.');
      }
    } catch (err: any) {
      console.error('Error seeding to MongoDB Atlas:', err.message);
    }
  }

  // Always keep resilient store up to date as backup
  const hasLoaded = loadStoreFromFile();
  if (!hasLoaded || !memoryStore.vehicles || memoryStore.vehicles.length === 0) {
    memoryStore = {
      users: initialUsers,
      vehicles: initialVehicles,
      bookings: initialBookings,
      settings: initialSettings,
      auditLogs: initialAuditLogs,
    };
    saveStoreToFile();
  }
}

// Unified Store Access Methods
export const dbStore = {
  // VEHICLES
  async getVehicles(filter: any = {}): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const query: any = {};
        if (filter.category && filter.category !== 'all') query.category = filter.category;
        if (filter.transmission && filter.transmission !== 'all') query.transmission = filter.transmission;
        if (filter.fuelType && filter.fuelType !== 'all') query.fuelType = filter.fuelType;
        if (filter.status && filter.status !== 'all') query.status = filter.status;
        if (filter.minPrice || filter.maxPrice) {
          query.dailyRateTnd = {};
          if (filter.minPrice) query.dailyRateTnd.$gte = Number(filter.minPrice);
          if (filter.maxPrice) query.dailyRateTnd.$lte = Number(filter.maxPrice);
        }
        if (filter.seats) query.seats = { $gte: Number(filter.seats) };
        if (filter.search) {
          query.$or = [
            { brand: new RegExp(filter.search, 'i') },
            { model: new RegExp(filter.search, 'i') },
            { category: new RegExp(filter.search, 'i') },
          ];
        }

        const list = await Vehicle.find(query).sort({ dailyRateTnd: 1 }).lean();
        if (list && list.length > 0) return list;
      } catch (e) {
        console.warn('Falling back to local vehicle list:', (e as any)?.message);
      }
    }

    // Local resilient search
    return memoryStore.vehicles.filter((v) => {
      if (filter.status && filter.status !== 'all' && v.status !== filter.status) return false;
      if (filter.category && filter.category !== 'all' && v.category !== filter.category) return false;
      if (filter.transmission && filter.transmission !== 'all' && v.transmission !== filter.transmission) return false;
      if (filter.fuelType && filter.fuelType !== 'all' && v.fuelType !== filter.fuelType) return false;
      if (filter.minPrice && v.dailyRateTnd < Number(filter.minPrice)) return false;
      if (filter.maxPrice && v.dailyRateTnd > Number(filter.maxPrice)) return false;
      if (filter.seats && v.seats < Number(filter.seats)) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matches =
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  },

  async getVehicleByIdOrSlug(idOrSlug: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const item = await Vehicle.findOne({
          $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
        }).lean();
        if (item) return item;
      } catch (e) {}
    }
    return (
      memoryStore.vehicles.find(
        (v) => String(v._id) === idOrSlug || v.slug === idOrSlug
      ) || null
    );
  },

  async createVehicle(data: any): Promise<any> {
    const newId = `veh_${Date.now()}`;
    const vehicleDoc = {
      _id: newId,
      ...data,
      slug: data.slug || `${data.brand}-${data.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await Vehicle.create(vehicleDoc);
      } catch (e) {
        console.error('Atlas create vehicle error:', e);
      }
    }

    memoryStore.vehicles.unshift(vehicleDoc);
    saveStoreToFile();
    return vehicleDoc;
  },

  async updateVehicle(id: string, updates: any): Promise<any | null> {
    const now = new Date();
    if (mongoose.connection.readyState === 1) {
      try {
        await Vehicle.updateOne({ _id: id }, { ...updates, updatedAt: now });
      } catch (e) {}
    }

    const idx = memoryStore.vehicles.findIndex((v) => String(v._id) === id);
    if (idx !== -1) {
      memoryStore.vehicles[idx] = {
        ...memoryStore.vehicles[idx],
        ...updates,
        updatedAt: now,
      };
      saveStoreToFile();
      return memoryStore.vehicles[idx];
    }
    return null;
  },

  async deleteVehicle(id: string): Promise<boolean> {
    if (mongoose.connection.readyState === 1) {
      try {
        await Vehicle.deleteOne({ _id: id });
      } catch (e) {}
    }
    const idx = memoryStore.vehicles.findIndex((v) => String(v._id) === id);
    if (idx !== -1) {
      memoryStore.vehicles.splice(idx, 1);
      saveStoreToFile();
      return true;
    }
    return false;
  },

  // USERS
  async findUserByEmail(email: string): Promise<any | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (mongoose.connection.readyState === 1) {
      try {
        const u = await User.findOne({ email: cleanEmail }).lean();
        if (u) return u;
      } catch (e) {}
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const u = await User.findById(id).lean();
        if (u) return u;
      } catch (e) {}
    }
    return memoryStore.users.find((u) => String(u._id) === id) || null;
  },

  async createUser(data: any): Promise<any> {
    const newId = `user_${Date.now()}`;
    const userDoc = {
      _id: newId,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role: data.role || 'customer',
      phone: data.phone || '',
      status: 'active',
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await User.create(userDoc);
      } catch (e) {
        console.error('Atlas create user error:', e);
      }
    }

    memoryStore.users.push(userDoc);
    saveStoreToFile();
    const safeUser = { ...userDoc };
    delete (safeUser as any).passwordHash;
    return safeUser;
  },

  async updateUser(id: string, updates: any): Promise<any | null> {
    const now = new Date();
    if (mongoose.connection.readyState === 1) {
      try {
        await User.updateOne({ _id: id }, { ...updates, updatedAt: now });
      } catch (e) {}
    }
    const idx = memoryStore.users.findIndex((u) => String(u._id) === id);
    if (idx !== -1) {
      memoryStore.users[idx] = {
        ...memoryStore.users[idx],
        ...updates,
        updatedAt: now,
      };
      saveStoreToFile();
      const safe = { ...memoryStore.users[idx] };
      delete safe.passwordHash;
      return safe;
    }
    return null;
  },

  async getAllUsers(): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const list = await User.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
        if (list && list.length > 0) return list;
      } catch (e) {}
    }
    return memoryStore.users.map((u) => {
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    });
  },

  // BOOKINGS & AVAILABILITY
  async checkVehicleAvailability(
    vehicleId: string,
    pickupDate: Date,
    returnDate: Date,
    excludeBookingId?: string
  ): Promise<{ available: boolean; conflict?: any }> {
    const reqStart = new Date(pickupDate).getTime();
    const reqEnd = new Date(returnDate).getTime();

    // Any overlapping booking with status pending, confirmed, active
    const activeStatuses = ['pending', 'confirmed', 'active'];

    const bookings = await this.getBookings();
    const conflict = bookings.find((b) => {
      if (String(b.vehicleId) !== String(vehicleId)) return false;
      if (excludeBookingId && String(b._id) === String(excludeBookingId)) return false;
      if (!activeStatuses.includes(b.status)) return false;

      const bStart = new Date(b.pickupDate).getTime();
      const bEnd = new Date(b.returnDate).getTime();

      // Check date interval overlap: (StartA <= EndB) and (EndA >= StartB)
      return reqStart <= bEnd && reqEnd >= bStart;
    });

    return {
      available: !conflict,
      conflict: conflict || undefined,
    };
  },

  async getBookings(filter: any = {}): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const query: any = {};
        if (filter.status && filter.status !== 'all') query.status = filter.status;
        if (filter.customerId) query.customerId = filter.customerId;
        if (filter.vehicleId) query.vehicleId = filter.vehicleId;
        const list = await Booking.find(query).sort({ createdAt: -1 }).lean();
        if (list && list.length > 0) return list;
      } catch (e) {}
    }

    return memoryStore.bookings
      .filter((b) => {
        if (filter.status && filter.status !== 'all' && b.status !== filter.status) return false;
        if (filter.customerId && String(b.customerId) !== String(filter.customerId)) return false;
        if (filter.vehicleId && String(b.vehicleId) !== String(filter.vehicleId)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getBookingById(id: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const b = await Booking.findOne({
          $or: [{ _id: id }, { referenceCode: id }],
        }).lean();
        if (b) return b;
      } catch (e) {}
    }
    return (
      memoryStore.bookings.find(
        (b) => String(b._id) === id || b.referenceCode === id
      ) || null
    );
  },

  async createBooking(data: any): Promise<any> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `CRC-2026-${randomSuffix}`;
    const newId = `book_${Date.now()}`;

    const newBooking = {
      _id: newId,
      referenceCode,
      ...data,
      status: 'pending',
      paymentStatus: 'pay_on_arrival',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
          changedBy: data.customerEmail || 'client',
          note: 'Demande de réservation enregistrée.',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await Booking.create(newBooking);
      } catch (e) {
        console.error('Atlas create booking error:', e);
      }
    }

    memoryStore.bookings.unshift(newBooking);
    saveStoreToFile();
    return newBooking;
  },

  async updateBookingStatus(
    id: string,
    newStatus: string,
    changedBy: string,
    note?: string
  ): Promise<any | null> {
    const booking = await this.getBookingById(id);
    if (!booking) return null;

    const historyItem = {
      status: newStatus,
      changedAt: new Date(),
      changedBy,
      note: note || `Statut mis à jour vers ${newStatus}`,
    };

    const updatedHistory = [...(booking.statusHistory || []), historyItem];
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      try {
        await Booking.updateOne(
          { $or: [{ _id: id }, { referenceCode: id }] },
          {
            status: newStatus,
            statusHistory: updatedHistory,
            updatedAt: now,
          }
        );
      } catch (e) {}
    }

    const idx = memoryStore.bookings.findIndex(
      (b) => String(b._id) === id || b.referenceCode === id
    );
    if (idx !== -1) {
      memoryStore.bookings[idx] = {
        ...memoryStore.bookings[idx],
        status: newStatus,
        statusHistory: updatedHistory,
        updatedAt: now,
      };
      saveStoreToFile();
      return memoryStore.bookings[idx];
    }
    return null;
  },

  async requestBookingCancellation(id: string, customerId: string, reason: string): Promise<any | null> {
    const booking = await this.getBookingById(id);
    if (!booking) return null;
    if (String(booking.customerId) !== String(customerId)) return null;

    return this.updateBookingStatus(
      id,
      'cancelled',
      booking.customerEmail,
      `Annulation demandée par le client: ${reason || 'Raison personnelle'}`
    );
  },

  // SETTINGS
  async getSettings(): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      try {
        const s = await SiteSettings.findOne().lean();
        if (s) return s;
      } catch (e) {}
    }
    return memoryStore.settings;
  },

  async updateSettings(updates: any): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      try {
        await SiteSettings.updateOne({}, updates, { upsert: true });
      } catch (e) {}
    }
    memoryStore.settings = {
      ...memoryStore.settings,
      ...updates,
      updatedAt: new Date(),
    };
    saveStoreToFile();
    return memoryStore.settings;
  },

  // AUDIT LOGS
  async addAuditLog(entry: {
    action: string;
    performedBy: string;
    performerEmail: string;
    performerRole?: string;
    entityType: 'booking' | 'vehicle' | 'user' | 'settings' | 'auth';
    entityId?: string;
    details: string;
  }): Promise<void> {
    const doc = {
      _id: `audit_${Date.now()}`,
      ...entry,
      performerRole: entry.performerRole || 'admin',
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await AuditLog.create(doc);
      } catch (e) {}
    }

    memoryStore.auditLogs.unshift(doc);
    if (memoryStore.auditLogs.length > 200) memoryStore.auditLogs.pop();
    saveStoreToFile();
  },

  async getAuditLogs(limit: number = 50): Promise<any[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
        if (logs && logs.length > 0) return logs;
      } catch (e) {}
    }
    return memoryStore.auditLogs.slice(0, limit);
  },
};
