import { profilesRepository } from '../database/repositories/index.js';
import { AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function getProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const profile = await profilesRepository.getProfileById(userId);
    res.json({
      success: true,
      data: profile || {
        id: userId,
        email: req.user?.email || null,
        full_name: req.user?.name || null,
        preferred_language: 'en'
      }
    });
  } catch (err) {
    logger.error('Failed to fetch user profile', { requestId: req.id, error: err.message });
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthenticationError('Authenticated user required'));

    const { full_name, fullName, avatar_url, avatarUrl, preferred_language, preferredLanguage } = req.body || {};
    const updated = await profilesRepository.upsertProfile(userId, {
      email: req.user?.email || null,
      full_name: full_name ?? fullName ?? null,
      avatar_url: avatar_url ?? avatarUrl ?? null,
      preferred_language: preferred_language ?? preferredLanguage ?? 'en'
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Failed to update user profile', { requestId: req.id, error: err.message });
    next(err);
  }
}

export default { getProfile, updateProfile };
