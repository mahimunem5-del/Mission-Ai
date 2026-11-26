import { attachmentsRepository } from '../database/repositories/index.js';
import { AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function listAttachments(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { conversationId } = req.query;
    const attachments = await attachmentsRepository.listAttachmentsByUser(userId, conversationId || null);
    res.json({ success: true, data: attachments });
  } catch (err) {
    logger.error('Failed to list attachments', { requestId: req.id, error: err.message });
    next(err);
  }
}

export default { listAttachments };
