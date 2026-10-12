import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { getDatabaseStatus } from '../config/db.ts';

const router = Router();

// GET /api/v1/settings/public
router.get('/public', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await dbStore.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Impossible de charger les paramètres publics.' });
  }
});

// GET /api/v1/health
router.get('/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    const dbStatus = getDatabaseStatus();
    const isGeminiReady = !!(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('MY_GEMINI_API_KEY'));

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      service: 'Crystal Rent Car Tunisia API',
      version: '1.0.0',
      database: {
        isAtlasConnected: dbStatus.isAtlas,
        mode: dbStatus.mode,
        statusText: dbStatus.statusText,
        host: dbStatus.host || 'local-resilient-store',
      },
      aiAssistant: {
        isConfigured: isGeminiReady,
        model: 'gemini-3.8-flash',
        fallbackAvailable: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

export default router;
