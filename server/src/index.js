import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config, { validateConfig } from './config/env.js';
import requestIdMiddleware from './middleware/requestId.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import logger from './utils/logger.js';

import chatRouter from './routes/chat.js';
import compareRouter from './routes/compare.js';
import historyRouter from './routes/history.js';
import healthRouter from './routes/health.js';
import filesRouter from './routes/files.js';
import imageRouter from './routes/image.js';
import transcribeRouter from './routes/transcribe.js';
import templatesRouter from './routes/templates.js';
import modelsRouter from './routes/models.js';
import toolsRouter from './routes/tools.js';
import profileRouter from './routes/profile.js';
import attachmentsRouter from './routes/attachments.js';
import usageRouter from './routes/usage.js';
import { getHealth } from './controllers/healthController.js';

validateConfig();

const app = express();
const PORT = config.port;

// Strict CORS configuration (no arbitrary origin reflection)
const LOCAL_DEV_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (origin === 'null') {
      return config.cors?.allowNullOrigin
        ? callback(null, true)
        : callback(new Error('Origin not allowed by CORS policy'), false);
    }
    if (config.cors?.allowedOrigins?.includes(origin)) {
      return callback(null, true);
    }
    if (!config.isProd && LOCAL_DEV_ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS policy'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Request-ID', 'Cache-Control'],
  exposedHeaders: ['Content-Type', 'Cache-Control', 'X-Request-ID']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Request ID & Payload Size Limits (2MB global; 50MB reserved for file/image/audio upload routes)
app.use(requestIdMiddleware);
const largePayloadJson = express.json({ limit: '50mb' });
const largePayloadUrlencoded = express.urlencoded({ limit: '50mb', extended: true });
app.use(['/api/files', '/api/generate-image', '/api/images', '/api/image', '/api/transcribe'], largePayloadJson, largePayloadUrlencoded);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Health Routes
app.use('/api', healthRouter);
app.use('/api/health', healthRouter);
app.get('/health', getHealth);

// Core AI & Chat Routes
app.use('/api/chat', chatRouter);
app.use('/api/chat', compareRouter);
app.use('/api/models', modelsRouter);
app.use('/api/tools', toolsRouter);

// Conversation History, Profile, Attachments & Usage Routes
app.use('/api/history', historyRouter);
app.use('/api', historyRouter); // Preserves /api/conversations aliases
app.use('/api/profile', requireAuth, generalRateLimiter, profileRouter);
app.use('/api/attachments', requireAuth, generalRateLimiter, attachmentsRouter);
app.use('/api/usage', requireAuth, generalRateLimiter, usageRouter);

// File Extraction & Audio Transcription Routes
app.use('/api/files', requireAuth, generalRateLimiter, filesRouter);
app.use('/api/transcribe', requireAuth, generalRateLimiter, transcribeRouter);

// Image Generation, Editing & Template Routes
app.use('/api/generate-image', requireAuth, imageRouter);
app.use('/api/images', requireAuth, imageRouter);
app.use('/api/image', requireAuth, imageRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/admin/templates', templatesRouter);

// Static client assets & SPA route fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const VALID_SPA_ROUTES = new Set([
  '/',
  '/index.html',
  '/create/svg/vectorize',
  '/vectorize'
]);

const chatNextDistDir = path.join(rootDir, 'chat-next', 'dist');
app.use('/chat-next', express.static(chatNextDistDir));
app.get('/chat-next*', (req, res, next) => {
  return res.sendFile(path.join(chatNextDistDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use(express.static(rootDir));
app.use('/public', express.static(path.join(rootDir, 'public')));
app.use(express.static(path.join(rootDir, 'public')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const cleanPath = req.path.replace(/\/+$/, '') || '/';
  if (VALID_SPA_ROUTES.has(cleanPath)) {
    return res.sendFile(path.join(rootDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  }
  next();
});

// Centralized 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', { reason: reason instanceof Error ? reason.message : reason });
});

let server = null;
if (process.env.NODE_ENV !== 'test') {
  const host = process.env.HOST || '0.0.0.0';
  server = app.listen(PORT, host, () => {
    logger.info(`[Mestrio Engine Core] Server listening on http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${PORT} (${config.env})`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use (${host}). Express cannot start a duplicate listener.`);
    } else {
      logger.error('Server error event caught:', { error: err.message, code: err.code });
    }
  });

  const handleShutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

export default app;
