import express, { type Express, type Request } from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config, isProduction } from './config/index.js';
import apiRouter from './api/routes/index.js';
import { errorHandler } from './api/middlewares/error.middleware.js';
import { logger } from './utils/logger.js';

export function createApp(): Express {
  const app = express();

  // ── Security ──
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  );

  // ── Rate Limiting ──
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: isProduction() ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many requests, please try again later.' } },
  });
  app.use(limiter);

  // ── Body Parsing ──
  app.use(express.json({
    limit: '2mb',
    verify: (req, _res, buf) => {
      if ((req as unknown as Request).originalUrl?.includes('/api/parent/v2/stripe/webhook')) {
        (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
      }
    },
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());

  // ── Request Logging ──
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, { ip: req.ip });
    next();
  });

  // ── Static file serving for uploads ──
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // ── API Routes ──
  app.use('/api', apiRouter);

  // ── 404 handler ──
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { message: 'Route not found' } });
  });

  // ── Global Error Handler ──
  app.use(errorHandler);

  return app;
}
