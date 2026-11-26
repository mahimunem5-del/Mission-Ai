import { orchestrateChatRequest } from '../orchestrator/aiOrchestrator.js';
import { orchestrateUiStream } from '../ai/sdk/uiStreamOrchestrator.js';
import { createSseSession } from '../ai/streaming/sseStream.js';
import logger from '../utils/logger.js';

/**
 * Chat Stream Controller
 * Handles SSE protocol negotiation, client abort signals, and delegates to AI Orchestrator.
 */
export async function streamChat(req, res) {
  const requestId = req.id || 'no-id';
  const { abortSignal, isAborted, writeChunk, endWithError } = createSseSession(req, res, requestId);

  try {
    const {
      messages = [],
      model = 'mahi-engine',
      searchMode = 'none',
      projectId = null,
      projectInstructions = null,
      systemPrompt = null,
      userName = null,
      language = null
    } = req.body || {};

    await orchestrateChatRequest({
      messages,
      model,
      searchMode,
      projectId,
      projectInstructions,
      systemPrompt,
      userName: userName || req.user?.name || null,
      userId: req.user?.id || null,
      language,
      writeChunk,
      isAborted,
      abortSignal,
      requestId
    });
  } catch (err) {
    if (isAborted()) return;
    logger.error('Error during chat stream orchestration', { requestId, error: err.message });
    endWithError(err.message || 'Stream processing failed');
  }
}

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
  streamChat,
  streamUiChat
};
