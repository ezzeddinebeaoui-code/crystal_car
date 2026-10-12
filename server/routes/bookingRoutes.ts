import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../services/dbStore.ts';
import { authenticate, optionalAuth } from '../middleware/auth.ts';

const router = Router();

const availabilitySchema = z.object({
  vehicleId: z.string().min(1, 'ID du véhicule requis'),
  pickupDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Date de début invalide'),
  returnDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Date de fin invalide'),
});

const createBookingSchema = z.object({
  vehicleId: z.string().min(1, 'Véhicule obligatoire'),
  pickupLocation: z.string().min(2, 'Lieu de prise en charge requis'),
  returnLocation: z.string().min(2, 'Lieu de restitution requis'),
  pickupDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Date de départ invalide'),
  returnDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Date de retour invalide'),
  pickupTime: z.string().default('10:00'),
  returnTime: z.string().default('10:00'),
  customerName: z.string().min(2, 'Nom complet requis'),
  customerEmail: z.string().email('Email valide requis'),
  customerPhone: z.string().min(6, 'Numéro de téléphone requis'),
  customerFlightNumber: z.string().optional(),
  options: z
    .object({
      driverService: z.boolean().default(false),
      babySeat: z.boolean().default(false),
      gps: z.boolean().default(false),
      additionalDriver: z.boolean().default(false),
    })
    .default({
      driverService: false,
      babySeat: false,
      gps: false,
      additionalDriver: false,
    }),
});

// POST /api/v1/bookings/availability
router.post('/availability', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = availabilitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { vehicleId, pickupDate, returnDate } = parse.data;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (end.getTime() <= start.getTime()) {
      res.status(400).json({
        success: false,
        error: 'La date de retour doit être postérieure à la date de prise en charge.',
      });
      return;
    }

    const vehicle = await dbStore.getVehicleByIdOrSlug(vehicleId);
    if (!vehicle) {
      res.status(404).json({ success: false, error: 'Véhicule introuvable.' });
      return;
    }

    const check = await dbStore.checkVehicleAvailability(vehicle._id, start, end);

    res.json({
      success: true,
      available: check.available,
      vehicle: {
        id: vehicle._id,
        brand: vehicle.brand,
        model: vehicle.model,
        dailyRateTnd: vehicle.dailyRateTnd,
      },
      message: check.available
        ? 'Ce véhicule est disponible pour les dates sélectionnées.'
        : 'Ce véhicule est déjà réservé pour tout ou partie de cette période.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur vérification disponibilité.' });
  }
});

// POST /api/v1/bookings (Create booking request with concurrency safety)
router.post('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = createBookingSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const data = parse.data;
    const pDate = new Date(data.pickupDate);
    const rDate = new Date(data.returnDate);

    if (rDate.getTime() <= pDate.getTime()) {
      res.status(400).json({
        success: false,
        error: 'La date de retour doit être strictement postérieure à la date de départ.',
      });
      return;
    }

    // Calculate rental days (minimum 1 day)
    const diffMs = rDate.getTime() - pDate.getTime();
    const rentalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Fetch vehicle
    const vehicle = await dbStore.getVehicleByIdOrSlug(data.vehicleId);
    if (!vehicle) {
      res.status(404).json({ success: false, error: 'Véhicule non trouvé.' });
      return;
    }

    if (vehicle.status !== 'available') {
      res.status(400).json({
        success: false,
        error: `Ce véhicule n'est actuellement pas disponible à la location (statut: ${vehicle.status}).`,
      });
      return;
    }

    // Critical: Backend overlap check to prevent double bookings
    const check = await dbStore.checkVehicleAvailability(vehicle._id, pDate, rDate);
    if (!check.available) {
      res.status(409).json({
        success: false,
        error: 'Conflit de disponibilité : ce véhicule est déjà réservé sur cette période. Veuillez choisir d’autres dates ou un autre véhicule.',
      });
      return;
    }

    // Retrieve settings for options pricing
    const settings = await dbStore.getSettings();
    const pricing = settings?.optionsPricing || {
      driverPerDayTnd: 60,
      babySeatPerDayTnd: 15,
      gpsPerDayTnd: 10,
      additionalDriverPerRentalTnd: 30,
    };

    let optionsTotal = 0;
    if (data.options.driverService) optionsTotal += pricing.driverPerDayTnd * rentalDays;
    if (data.options.babySeat) optionsTotal += pricing.babySeatPerDayTnd * rentalDays;
    if (data.options.gps) optionsTotal += pricing.gpsPerDayTnd * rentalDays;
    if (data.options.additionalDriver) optionsTotal += pricing.additionalDriverPerRentalTnd;

    const baseVehicleTotal = vehicle.dailyRateTnd * rentalDays;
    const totalPriceTnd = baseVehicleTotal + optionsTotal;

    const customerId = req.user?.id || (await dbStore.findUserByEmail(data.customerEmail))?._id || '';

    const newBooking = await dbStore.createBooking({
      customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerFlightNumber: data.customerFlightNumber || '',
      vehicleId: vehicle._id,
      vehicleSnapshot: {
        brand: vehicle.brand,
        model: vehicle.model,
        category: vehicle.category,
        image: vehicle.images?.[0] || '',
      },
      pickupLocation: data.pickupLocation,
      returnLocation: data.returnLocation,
      pickupDate: pDate,
      returnDate: rDate,
      pickupTime: data.pickupTime,
      returnTime: data.returnTime,
      rentalDays,
      dailyRateSnapshot: vehicle.dailyRateTnd,
      options: data.options,
      optionsTotalTnd: optionsTotal,
      depositAmountSnapshot: vehicle.depositAmountTnd || 1000,
      totalPriceTnd,
      currency: vehicle.currency || 'TND',
    });

    await dbStore.addAuditLog({
      action: 'BOOKING_CREATED',
      performedBy: data.customerName,
      performerEmail: data.customerEmail,
      performerRole: req.user?.role || 'customer',
      entityType: 'booking',
      entityId: newBooking.referenceCode,
      details: `Réservation ${newBooking.referenceCode} créée pour ${vehicle.brand} ${vehicle.model} (${rentalDays} jours, total: ${totalPriceTnd} TND).`,
    });

    res.status(201).json({
      success: true,
      message: 'Votre demande de réservation a été enregistrée avec succès.',
      booking: newBooking,
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la réservation.' });
  }
});

// GET /api/v1/bookings/my (Customer's own bookings)
router.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user!.email;
    const allBookings = await dbStore.getBookings();
    const customerBookings = allBookings.filter(
      (b) =>
        (b.customerId && String(b.customerId) === String(req.user!.id)) ||
        (b.customerEmail && b.customerEmail.toLowerCase() === userEmail.toLowerCase())
    );

    res.json({
      success: true,
      count: customerBookings.length,
      data: customerBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Impossible de récupérer vos réservations.' });
  }
});

// GET /api/v1/bookings/my/:id
router.get('/my/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await dbStore.getBookingById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Réservation non trouvée.' });
      return;
    }

    const isOwner =
      String(booking.customerId) === String(req.user!.id) ||
      booking.customerEmail.toLowerCase() === req.user!.email.toLowerCase();

    if (!isOwner && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Accès non autorisé à cette réservation.' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur de consultation.' });
  }
});

// POST /api/v1/bookings/my/:id/cancellation-request
router.post('/my/:id/cancellation-request', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const booking = await dbStore.getBookingById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Réservation introuvable.' });
      return;
    }

    const isOwner =
      String(booking.customerId) === String(req.user!.id) ||
      booking.customerEmail.toLowerCase() === req.user!.email.toLowerCase();

    if (!isOwner) {
      res.status(403).json({ success: false, error: 'Vous ne pouvez annuler que vos propres réservations.' });
      return;
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      res.status(400).json({ success: false, error: `Cette réservation est déjà ${booking.status}.` });
      return;
    }

    const updated = await dbStore.requestBookingCancellation(
      booking.referenceCode,
      req.user!.id,
      reason || 'Demande client via espace personnel'
    );

    await dbStore.addAuditLog({
      action: 'BOOKING_CANCELLED_BY_CUSTOMER',
      performedBy: req.user!.name,
      performerEmail: req.user!.email,
      performerRole: 'customer',
      entityType: 'booking',
      entityId: booking.referenceCode,
      details: `Réservation ${booking.referenceCode} annulée par le client (${reason || 'Sans motif précisé'}).`,
    });

    res.json({
      success: true,
      message: 'Votre réservation a été annulée.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Impossible de traiter l’annulation.' });
  }
});

export default router;
