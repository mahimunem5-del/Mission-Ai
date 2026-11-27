import express from 'express';
import { streamUiChat } from '../controllers/chatController.js';
import { validateChatRequest } from '../middleware/validate.js';
import { chatRateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chat/ui-stream (Authoritative Vercel AI SDK v7 UI Message Stream)
router.post('/ui-stream', requireAuth, chatRateLimiter, validateChatRequest, streamUiChat);

export default router;
