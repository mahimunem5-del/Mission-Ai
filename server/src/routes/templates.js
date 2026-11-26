import express from 'express';
import { getTemplates, uploadTemplate, editTemplate, removeTemplate } from '../controllers/templateController.js';
import { requireAuth } from '../middleware/auth.js';
import { generalRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public read access for image templates gallery
router.get('/', getTemplates);

// Authenticated write/admin operations
router.post('/', requireAuth, generalRateLimiter, uploadTemplate);
router.put('/:id', requireAuth, generalRateLimiter, editTemplate);
router.delete('/:id', requireAuth, generalRateLimiter, removeTemplate);

export default router;
