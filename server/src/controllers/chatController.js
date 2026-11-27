import { orchestrateUiStream } from '../ai/sdk/uiStreamOrchestrator.js';
import logger from '../utils/logger.js';

/**
 * Authoritative Chat UI Stream Controller (Vercel AI SDK v7)
 */
export async function streamUiChat(req, res, next) {
  const requestId = req.id || 'no-id';
  try {
    const {
      messages = [],
      model = 'mahi-engine',
      searchMode = 'none',
      enabledTools = null,
      projectId = null,
      projectInstructions = null,
      systemPrompt = null,
      userName = null,
      language = null
    } = req.body || {};

    await orchestrateUiStream({
      req,
      res,
      messages,
      model,
      searchMode,
      enabledTools,
      projectId,
      projectInstructions,
      systemPrompt,
      userName: userName || req.user?.name || null,
      userId: req.user?.id || null,
      language,
      requestId
    });
  } catch (err) {
    logger.error('Error in streamUiChat', { requestId, error: err.message });
    if (!res.headersSent) {
      next(err);
    }
  }
}

export default {
  streamUiChat
};
