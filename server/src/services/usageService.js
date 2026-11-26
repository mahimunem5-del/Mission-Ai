import logger from '../utils/logger.js';
import { recordModelUsage } from '../database/repositories/modelUsageRepository.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Tracks request metrics, latency, and actual provider usage (when supplied).
 * Never invents token counts or API cost when the provider does not supply them.
 */
export function recordRequestMetrics({
  requestId = '-',
  userId = null,
  conversationId = null,
  provider = 'openrouter',
  engine = null,
  requestedModel = null,
  model = 'unknown',
  mode = 'chat',
  status = 'success',
  promptLength = 0,
  completionLength = 0,
  inputTokens = null,
  outputTokens = null,
  totalTokens = null,
  apiCostUsd = null,
  durationMs = 0,
  cacheHit = false,
  sourcesCount = 0,
  retryCount = 0
}) {
  const actualInput = typeof inputTokens === 'number' ? inputTokens : null;
  const actualOutput = typeof outputTokens === 'number' ? outputTokens : null;
  const actualTotal = typeof totalTokens === 'number'
    ? totalTokens
    : (actualInput !== null && actualOutput !== null ? actualInput + actualOutput : null);
  const actualCost = typeof apiCostUsd === 'number' ? apiCostUsd : null;

  logger.info('AI Request Completed', {
    requestId,
    provider,
    ...(engine ? { engine } : {}),
    ...(requestedModel ? { requestedModel } : {}),
    model,
    mode,
    status,
    durationMs,
    cacheHit,
    retryCount,
    promptLength,
    completionLength,
    usage: actualTotal !== null ? {
      inputTokens: actualInput,
      outputTokens: actualOutput,
      totalTokens: actualTotal,
      ...(actualCost !== null ? { apiCostUsd: actualCost } : {})
    } : null,
    sourcesCount
  });

  // Non-blocking DB persistence when a valid user UUID is present
  if (userId && UUID_REGEX.test(String(userId)) && userId !== '00000000-0000-0000-0000-000000000000') {
    recordModelUsage({
      user_id: userId,
      conversation_id: conversationId && UUID_REGEX.test(String(conversationId)) ? conversationId : null,
      request_id: requestId,
      provider,
      requested_model: requestedModel || model,
      resolved_model: model,
      mode,
      input_tokens: actualInput,
      output_tokens: actualOutput,
      total_tokens: actualTotal,
      api_cost_usd: actualCost,
      duration_ms: durationMs,
      cache_hit: cacheHit,
      status
    }).catch(() => {});
  }

  return {
    requestId,
    provider,
    ...(engine ? { engine } : {}),
    requestedModel: requestedModel || model,
    model,
    status,
    durationMs,
    cacheHit,
    retryCount,
    inputTokens: actualInput,
    outputTokens: actualOutput,
    totalTokens: actualTotal,
    apiCostUsd: actualCost
  };
}

export default {
  recordRequestMetrics
};
