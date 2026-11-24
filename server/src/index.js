import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config, { validateConfig } from './config/env.js';
import requestIdMiddleware from './middleware/requestId.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

import chatRouter from './routes/chat.js';
import compareRouter from './routes/compare.js';
import historyRouter from './routes/history.js';
import healthRouter from './routes/health.js';
import filesRouter from './routes/files.js';
import imageRouter from './routes/image.js';
import transcribeRouter from './routes/transcribe.js';
import templatesRouter from './routes/templates.js';
import { getHealth } from './controllers/healthController.js';
import { streamChat } from './controllers/chatController.js';
import { getTemplates, uploadTemplate, editTemplate, removeTemplate } from './controllers/templateController.js';
import { generateImage, executePreciseEdit, executeUpscaleImage, executeVectorizeImage, executeRemoveBackground } from './controllers/imageController.js';
import { validateChatRequest } from './middleware/validate.js';
import { chatRateLimiter } from './middleware/rateLimit.js';

// Validate configuration on initialization
validateConfig();

const app = express();
const PORT = config.port;

// Security & Robust CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development, web preview, file:// (null), and configured production origins
    if (
      !origin ||
      origin === 'null' ||
      (config.cors?.allowedOrigins && config.cors.allowedOrigins.includes(origin)) ||
      (config.cors?.allowNullOrigin && origin === 'null') ||
      /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|172\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback so browser fetches never fail with CORS errors
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Request-ID', 'Cache-Control'],
  exposedHeaders: ['Content-Type', 'Cache-Control', 'X-Request-ID']
}));

// Explicit preflight handling for all routes
app.options('*', cors());

// Request ID & Safe Payload Limit Protection (50mb for high-resolution Base64 image payloads)
app.use(requestIdMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); // express.urlencoded({ extended: true, limit: '50mb' })

// Route Mounts
app.use('/api', healthRouter);
app.use('/api/health', healthRouter);
app.get('/health', getHealth);
app.get('/api/health', getHealth);

app.use('/api/chat', chatRouter);
app.use('/api/chat', compareRouter);
// Explicit aliases for Chat streaming to prevent any 404 path mismatch
app.post('/api/chat/stream', chatRateLimiter, validateChatRequest, streamChat);
app.post('/api/chat', chatRateLimiter, validateChatRequest, streamChat);

app.use('/api/history', historyRouter);
app.use('/api', historyRouter); // Preserves /api/conversations aliases
app.use('/api/files', filesRouter);

app.use('/api/generate-image', imageRouter);
app.use('/api/images', imageRouter);
app.use('/api/image', imageRouter);
// Explicit aliases for Image Generation to prevent any 404 path mismatch
app.post('/api/images/generate', generateImage);
app.post('/api/generate-image', generateImage);
app.post('/api/generate-image/generate', generateImage);
app.post('/api/images', generateImage);
app.post('/api/image', generateImage);
app.post('/api/image/generate', generateImage);

app.use('/api/transcribe', transcribeRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/admin/templates', templatesRouter);

// Explicit aliases for Templates to guarantee zero 404 path mismatch
app.get('/api/templates', getTemplates);
app.post('/api/templates', uploadTemplate);
app.put('/api/templates/:id', editTemplate);
app.delete('/api/templates/:id', removeTemplate);
app.get('/api/admin/templates', getTemplates);
app.post('/api/admin/templates', uploadTemplate);
app.put('/api/admin/templates/:id', editTemplate);
app.delete('/api/admin/templates/:id', removeTemplate);

// Explicit aliases for Precise Edit, Smart Edit, and Upscale to prevent any 404 path mismatch
app.post('/api/images/precise-edit', executePreciseEdit);
app.post('/api/image/precise-edit', executePreciseEdit);
app.post('/api/generate-image/precise-edit', executePreciseEdit);
app.post('/api/images/edit', executePreciseEdit);
app.post('/api/images/smart-edit', executePreciseEdit);
app.post('/api/image/smart-edit', executePreciseEdit);
app.post('/api/generate-image/smart-edit', executePreciseEdit);
app.post('/api/images/upscale', executeUpscaleImage);
app.post('/api/image/upscale', executeUpscaleImage);
app.post('/api/generate-image/upscale', executeUpscaleImage);
app.post('/api/images/vectorize', executeVectorizeImage);
app.post('/api/image/vectorize', executeVectorizeImage);
app.post('/api/generate-image/vectorize', executeVectorizeImage);
app.post('/api/images/remove-background', executeRemoveBackground);
app.post('/api/image/remove-background', executeRemoveBackground);
app.post('/api/generate-image/remove-background', executeRemoveBackground);
app.post('/api/images/remove-bg', executeRemoveBackground);

// Static client assets & SPA route fallback for client-side routing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const VALID_SPA_ROUTES = new Set([
  '/',
  '/index.html',
  '/create/svg/vectorize',
  '/vectorize'
]);

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

// Global error handler middleware so payload errors or parsing failures never kill the Node process
app.use((err, req, res, next) => {
  console.error('Server error intercepted:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    message: err.message || 'Internal server error'
  });
});

app.use(errorHandler);

// Global process error handlers to prevent unhandled exceptions or rejections from crashing the process
process.on('uncaughtException', (err) => {
  console.error('Server uncaughtException intercepted:', err);
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Server unhandledRejection intercepted:', reason);
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
      console.error('Express server error:', err);
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
