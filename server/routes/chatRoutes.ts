import { Router } from 'express';
import type { Request, Response } from 'express';
import { processChatRecommendation } from '../services/aiService.ts';

const router = Router();

// POST /api/v1/chat/recommend
router.post('/recommend', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history, criteria, language } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Le message est obligatoire pour dialoguer avec Crystal Assistant.',
      });
      return;
    }

    const result = await processChatRecommendation({
      message,
      history: history || [],
      criteria: criteria || {},
      language: language || 'fr',
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Le conseiller Crystal Assistant est momentanément indisponible.',
    });
  }
});

export default router;
