import express from 'express';
import { streamCompare } from '../controllers/compareController.js';
import { validateCompareRequest } from '../middleware/validate.js';
import { chatRateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chat/compare
router.post('/compare', requireAuth, chatRateLimiter, validateCompareRequest, streamCompare);

export default router;
