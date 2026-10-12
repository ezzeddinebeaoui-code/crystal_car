import { Router, Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';

const router = Router();

// GET all cars with filters and sorting
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, transmission, fuelType, minPrice, maxPrice, seats, search, sort } = req.query;

    let cars = await dbStore.getVehicles({
      category: category as string,
      transmission: transmission as string,
      fuelType: fuelType as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      seats: seats ? Number(seats) : undefined,
      search: search as string,
      status: 'available',
    });

    // Sorting
    if (sort === 'price_asc') {
      cars.sort((a, b) => a.dailyRateTnd - b.dailyRateTnd);
    } else if (sort === 'price_desc') {
      cars.sort((a, b) => b.dailyRateTnd - a.dailyRateTnd);
    } else if (sort === 'newest') {
      cars.sort((a, b) => b.year - a.year);
    } else {
      // Default: featured first, then price
      cars.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.dailyRateTnd - b.dailyRateTnd;
      });
    }

    res.json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Impossible de récupérer la flotte.' });
  }
});

// GET featured cars
router.get('/featured', async (_req: Request, res: Response): Promise<void> => {
  try {
    const all = await dbStore.getVehicles({ status: 'available' });
    const featured = all.filter((c) => c.isFeatured).slice(0, 6);
    res.json({
      success: true,
      data: featured.length > 0 ? featured : all.slice(0, 4),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur véhicules phares.' });
  }
});

// GET categories with counts and min daily rate
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const cars = await dbStore.getVehicles({ status: 'available' });
    const catMap: Record<string, { count: number; minPrice: number; sampleImage: string }> = {};

    cars.forEach((car) => {
      if (!catMap[car.category]) {
        catMap[car.category] = {
          count: 0,
          minPrice: car.dailyRateTnd,
          sampleImage: car.images?.[0] || '',
        };
      }
      catMap[car.category].count += 1;
      if (car.dailyRateTnd < catMap[car.category].minPrice) {
        catMap[car.category].minPrice = car.dailyRateTnd;
      }
    });

    const categories = Object.keys(catMap).map((name) => ({
      name,
      count: catMap[name].count,
      minPrice: catMap[name].minPrice,
      image: catMap[name].sampleImage,
    }));

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur catégories.' });
  }
});

// GET single car by id or slug
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const car = await dbStore.getVehicleByIdOrSlug(req.params.id);
    if (!car) {
      res.status(404).json({ success: false, error: 'Véhicule introuvable.' });
      return;
    }

    // Also get similar vehicles from same or close category
    const all = await dbStore.getVehicles({ status: 'available' });
    const similar = all
      .filter((c) => String(c._id) !== String(car._id) && c.category === car.category)
      .slice(0, 3);

    res.json({
      success: true,
      data: car,
      similar: similar.length > 0 ? similar : all.filter((c) => String(c._id) !== String(car._id)).slice(0, 3),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur chargement véhicule.' });
  }
});

export default router;
