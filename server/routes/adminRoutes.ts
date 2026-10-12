import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../services/dbStore.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// GET /api/v1/admin/dashboard
router.get('/dashboard', async (_req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await dbStore.getVehicles({ status: 'all' });
    const bookings = await dbStore.getBookings();

    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
    const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;
    const reservedVehicles = vehicles.filter((v) => v.status === 'reserved').length;

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
    const activeBookings = bookings.filter((b) => b.status === 'active').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length;

    // Calculate revenue from confirmed, active, and completed bookings
    const confirmedRevenue = bookings
      .filter((b) => ['confirmed', 'active', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.totalPriceTnd || 0), 0);

    const utilizationRate =
      totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100) : 0;

    // Monthly trends (aggregate last 6 months)
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyStats: Record<string, { month: string; reservations: number; revenue: number }> = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyStats[key] = {
        month: monthNames[d.getMonth()],
        reservations: 0,
        revenue: 0,
      };
    }

    bookings.forEach((b) => {
      const bDate = new Date(b.createdAt);
      const key = `${bDate.getFullYear()}-${bDate.getMonth()}`;
      if (monthlyStats[key]) {
        monthlyStats[key].reservations += 1;
        if (['confirmed', 'active', 'completed'].includes(b.status)) {
          monthlyStats[key].revenue += b.totalPriceTnd || 0;
        }
      }
    });

    const monthlyTrends = Object.values(monthlyStats);

    // Status distribution
    const statusDistribution = [
      { name: 'En attente', value: pendingBookings, color: '#f59e0b' },
      { name: 'Confirmées', value: confirmedBookings, color: '#10b981' },
      { name: 'En cours', value: activeBookings, color: '#3b82f6' },
      { name: 'Terminées', value: completedBookings, color: '#6366f1' },
      { name: 'Annulées', value: cancelledBookings, color: '#ef4444' },
    ];

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    vehicles.forEach((v) => {
      categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      count: categoryCounts[cat],
    }));

    res.json({
      success: true,
      metrics: {
        totalVehicles,
        availableVehicles,
        maintenanceVehicles,
        reservedVehicles,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        confirmedRevenue,
        currency: 'TND',
        utilizationRate,
      },
      monthlyTrends,
      statusDistribution,
      categoryDistribution,
      recentBookings: bookings.slice(0, 6),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors du calcul du tableau de bord.' });
  }
});

// GET /api/v1/admin/cars
router.get('/cars', async (_req: Request, res: Response): Promise<void> => {
  try {
    const cars = await dbStore.getVehicles({ status: 'all' });
    res.json({ success: true, count: cars.length, data: cars });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur récupération des véhicules.' });
  }
});

// POST /api/v1/admin/cars
router.post('/cars', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      brand,
      model,
      category,
      year,
      dailyRateTnd,
      images,
      seats,
      luggage,
      transmission,
      fuelType,
      airConditioning,
      depositAmountTnd,
      minAge,
      description,
      features,
      isFeatured,
      status,
    } = req.body;

    if (!brand || !model || !category || !dailyRateTnd) {
      res.status(400).json({ success: false, error: 'Marque, modèle, catégorie et tarif journalier sont requis.' });
      return;
    }

    const created = await dbStore.createVehicle({
      brand,
      model,
      category,
      year: Number(year) || new Date().getFullYear(),
      dailyRateTnd: Number(dailyRateTnd),
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      ],
      seats: Number(seats) || 5,
      luggage: Number(luggage) || 2,
      transmission: transmission || 'Automatique',
      fuelType: fuelType || 'Essence',
      airConditioning: airConditioning !== false,
      depositAmountTnd: Number(depositAmountTnd) || 1000,
      minAge: Number(minAge) || 21,
      description: description || '',
      features: Array.isArray(features) ? features : [],
      isFeatured: !!isFeatured,
      status: status || 'available',
      verified: true,
    });

    await dbStore.addAuditLog({
      action: 'VEHICLE_CREATED',
      performedBy: req.user!.name,
      performerEmail: req.user!.email,
      performerRole: 'admin',
      entityType: 'vehicle',
      entityId: created._id,
      details: `Ajout du véhicule ${created.brand} ${created.model} (${created.dailyRateTnd} TND/jour).`,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur création véhicule.' });
  }
});

// PATCH /api/v1/admin/cars/:id
router.patch('/cars/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await dbStore.updateVehicle(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Véhicule introuvable.' });
      return;
    }

    await dbStore.addAuditLog({
      action: 'VEHICLE_UPDATED',
      performedBy: req.user!.name,
      performerEmail: req.user!.email,
      performerRole: 'admin',
      entityType: 'vehicle',
      entityId: req.params.id,
      details: `Modification des données de ${updated.brand} ${updated.model}.`,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur mise à jour véhicule.' });
  }
});

// DELETE /api/v1/admin/cars/:id
router.delete('/cars/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await dbStore.getVehicleByIdOrSlug(req.params.id);
    const success = await dbStore.deleteVehicle(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Véhicule introuvable.' });
      return;
    }

    await dbStore.addAuditLog({
      action: 'VEHICLE_DELETED',
      performedBy: req.user!.name,
      performerEmail: req.user!.email,
      performerRole: 'admin',
      entityType: 'vehicle',
      entityId: req.params.id,
      details: `Suppression du véhicule ${existing?.brand || ''} ${existing?.model || ''}.`,
    });

    res.json({ success: true, message: 'Véhicule retiré du parc automobile.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur suppression véhicule.' });
  }
});

// GET /api/v1/admin/bookings
router.get('/bookings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    let list = await dbStore.getBookings({ status: status as string });

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.referenceCode.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q) ||
          b.vehicleSnapshot?.model.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur récupération réservations.' });
  }
});

// GET /api/v1/admin/bookings/:id
router.get('/bookings/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await dbStore.getBookingById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Réservation introuvable.' });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur consultation réservation.' });
  }
});

// PATCH /api/v1/admin/bookings/:id/status
router.patch('/bookings/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, note } = req.body;
    const allowed = ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'];

    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, error: `Statut non autorisé: ${status}` });
      return;
    }

    const updated = await dbStore.updateBookingStatus(req.params.id, status, req.user!.email, note);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Réservation introuvable.' });
      return;
    }

    await dbStore.addAuditLog({
      action: 'BOOKING_STATUS_CHANGED',
      performedBy: req.user!.name,
      performerEmail: req.user!.email,
      performerRole: 'admin',
      entityType: 'booking',
      entityId: updated.referenceCode,
      details: `Statut de la réservation ${updated.referenceCode} changé à "${status}". Note: ${note || 'Aucune'}.`,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur mise à jour statut.' });
  }
});

// GET /api/v1/admin/users
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await dbStore.getAllUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur liste clients.' });
  }
});

// PATCH /api/v1/admin/users/:id/status
router.patch('/users/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ success: false, error: 'Statut invalide.' });
      return;
    }

    const updated = await dbStore.updateUser(req.params.id, { status });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
      return;
    }

    await dbStore.addAuditLog({
      action: 'USER_STATUS_UPDATED',
      performedBy: req.user!.name,
      performerEmail: req.user!.email,
      performerRole: 'admin',
      entityType: 'user',
      entityId: req.params.id,
      details: `Statut de ${updated.email} changé à "${status}".`,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur modification statut client.' });
  }
});

// GET /api/v1/admin/settings & PATCH /api/v1/admin/settings
router.get('/settings', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await dbStore.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur récupération paramètres.' });
  }
});

router.patch('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await dbStore.updateSettings(req.body);
    await dbStore.addAuditLog({
      action: 'SETTINGS_UPDATED',
      performedBy: req.user!.name,
      performerEmail: req.user!.email,
      performerRole: 'admin',
      entityType: 'settings',
      details: 'Mise à jour des paramètres généraux et de la tarification.',
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur mise à jour paramètres.' });
  }
});

// GET /api/v1/admin/audit-logs
router.get('/audit-logs', async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await dbStore.getAuditLogs(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur journal d’audit.' });
  }
});

// GET /api/v1/admin/reports/csv
router.get('/reports/csv', async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await dbStore.getBookings();
    const headers = [
      'Reference',
      'Client',
      'Email',
      'Telephone',
      'Vehicule',
      'Categorie',
      'Depart',
      'Lieu_Depart',
      'Retour',
      'Lieu_Retour',
      'Jours',
      'Total_TND',
      'Statut',
      'Date_Creation',
    ];

    const rows = bookings.map((b) => [
      b.referenceCode,
      `"${b.customerName.replace(/"/g, '""')}"`,
      b.customerEmail,
      b.customerPhone,
      `"${b.vehicleSnapshot?.brand || ''} ${b.vehicleSnapshot?.model || ''}"`,
      b.vehicleSnapshot?.category || '',
      new Date(b.pickupDate).toISOString().split('T')[0],
      `"${(b.pickupLocation || '').replace(/"/g, '""')}"`,
      new Date(b.returnDate).toISOString().split('T')[0],
      `"${(b.returnLocation || '').replace(/"/g, '""')}"`,
      b.rentalDays,
      b.totalPriceTnd,
      b.status,
      new Date(b.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="crystal_rent_car_reservations.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur génération export CSV.' });
  }
});

export default router;
