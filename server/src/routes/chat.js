import express from 'express';
import { streamChat, streamUiChat } from '../controllers/chatController.js';
import { validateChatRequest } from '../middleware/validate.js';
import { chatRateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chat/ui-stream (Vercel AI SDK v7 UI Message Stream)
router.post('/ui-stream', requireAuth, chatRateLimiter, validateChatRequest, streamUiChat);

// POST /api/chat/stream & POST /api/chat/ (Legacy Mestrio SSE for index.html)
router.post('/stream', requireAuth, chatRateLimiter, validateChatRequest, streamChat);
router.post('/', requireAuth, chatRateLimiter, validateChatRequest, streamChat);

export default router;
