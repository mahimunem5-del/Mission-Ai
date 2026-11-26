import { orchestrateCompareRequest } from '../orchestrator/aiOrchestrator.js';
import { createSseSession } from '../ai/streaming/sseStream.js';
import logger from '../utils/logger.js';

/**
 * Multi-Model Compare Controller
 * Sets up SSE stream lifecycle and delegates multi-model orchestration to AI Orchestrator.
 */
export async function streamCompare(req, res) {
  const requestId = req.id || 'no-id';
  const { abortSignal, isAborted, writeChunk, endWithError } = createSseSession(req, res, requestId);

  try {
    const { messages = [], models = ['mahi-engine', 'gpt-4o-mini'] } = req.body || {};

    await orchestrateCompareRequest({
      messages,
      models,
      writeChunk,
      isAborted,
      abortSignal,
      requestId
    });
  } catch (err) {
    if (isAborted()) return;
    logger.error('Error during compare stream orchestration', { requestId, error: err.message });
    endWithError(err.message || 'Compare streaming failed');
  }
}

export default {
  streamCompare
};
