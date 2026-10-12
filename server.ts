import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDatabase } from './server/config/db.ts';
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

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/cars', carRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/settings', settingsRoutes);

  // Health route shorthand
  app.get('/api/health', (_req, res) => {
    res.redirect('/api/v1/settings/health');
  });
  app.get('/api/v1/health', (_req, res) => {
    res.redirect('/api/v1/settings/health');
  });

  // Setup Vite in Dev or Serve Static in Prod
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Crystal Rent Car] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
