import express from 'express';
import {
  listConversations,
  getConversation,
  createConversation,
  addMessageToConversation,
  getMessageParts,
  deleteConversation
} from '../controllers/historyController.js';
import {
  validateHistoryId,
  validateCreateConversation,
  validateAddMessage
} from '../middleware/validate.js';
import { generalRateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', requireAuth, generalRateLimiter, listConversations);
router.get('/conversations/:id', requireAuth, generalRateLimiter, validateHistoryId, getConversation);
router.post('/conversations', requireAuth, generalRateLimiter, validateCreateConversation, createConversation);
router.post('/conversations/:id/messages', requireAuth, generalRateLimiter, validateHistoryId, validateAddMessage, addMessageToConversation);
router.get('/conversations/:id/messages/:messageId/parts', requireAuth, generalRateLimiter, validateHistoryId, getMessageParts);
router.delete('/conversations/:id', requireAuth, generalRateLimiter, validateHistoryId, deleteConversation);

export default router;
