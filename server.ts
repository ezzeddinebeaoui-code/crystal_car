import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDatabase, getDatabaseStatus } from './server/config/db.ts';
import { initializeDatabaseAndSeeds } from './server/services/dbStore.ts';
import authRoutes from './server/routes/authRoutes.ts';
import carRoutes from './server/routes/carRoutes.ts';
import bookingRoutes from './server/routes/bookingRoutes.ts';
import chatRoutes from './server/routes/chatRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import settingsRoutes from './server/routes/settingsRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Cloud Run injects process.env.PORT (typically 8080). Default to 3000 in local dev.
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Connect Database (Atlas with resilient fallback) and initialize seeds
  console.log('🔄 [Crystal Rent Car] Connecting to database...');
  await connectDatabase();
  await initializeDatabaseAndSeeds();

  // Direct Health-Check Endpoints for Cloud Run & Container Probes (200 OK without redirects)
  const healthCheckHandler = (_req: express.Request, res: express.Response) => {
    const dbStatus = getDatabaseStatus();
    const isGeminiReady = !!(
      process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('MY_GEMINI_API_KEY')
    );

    res.status(200).json({
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
  };

  app.get('/healthz', healthCheckHandler);
  app.get('/api/health', healthCheckHandler);
  app.get('/api/v1/health', healthCheckHandler);

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/cars', carRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/settings', settingsRoutes);

  // 404 handler for API routes
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint API introuvable' });
  });

  // Setup Vite in Dev or Serve Static dist in Production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('⚠️ [Crystal Rent Car] dist directory not found. Please run npm run build.');
      app.get('*', (_req, res) => {
        res.status(503).send('Application build in progress. Please build the frontend first.');
      });
    }
  }

  // Centralized Error Handling Middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: isProd ? 'Une erreur interne est survenue sur le serveur.' : err.message || 'Erreur interne.',
    });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Crystal Rent Car] Server running at http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });

  // Graceful shutdown on Cloud Run SIGTERM / SIGINT
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
