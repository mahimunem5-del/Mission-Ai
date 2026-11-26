import { modelUsageRepository } from '../database/repositories/index.js';
import { AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function listUserUsage(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const parsedLimit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const limit = Number.isNaN(parsedLimit) ? 50 : Math.min(Math.max(parsedLimit, 1), 100);

    const usage = await modelUsageRepository.listUsageByUser(userId, limit);
    res.json({ success: true, data: usage });
  } catch (err) {
    logger.error('Failed to list user usage', { requestId: req.id, error: err.message });
    next(err);
  }
}

export default { listUserUsage };
