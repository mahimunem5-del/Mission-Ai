/**
 * Universal Streaming Message Protocol (SSE)
 * Standardized event types compatible with both legacy Mestrio UI and assistant-ui / Streamdown.
 */

export const STREAM_EVENT_TYPES = {
  TEXT_DELTA: 'text-delta',
  STATUS: 'status',
  SOURCES: 'sources',
  IMAGE: 'image',
  IMAGE_ERROR: 'image_error',
  TOOL_CALL: 'tool_call',
  TOOL_RESULT: 'tool_result',
  USAGE: 'usage',
  MODEL_DONE: 'model_done',
  MODEL_ERROR: 'model_error',
  STREAM_ERROR: 'stream_error'
};

export function createTextDeltaEvent(text, modelId = null) {
  return modelId ? { type: STREAM_EVENT_TYPES.TEXT_DELTA, modelId, text } : { text };
}

export function createStatusEvent({
  message = '',
  requestedModel = null,
  resolvedModel = null,
  isFallback = false,
  provider = null
}) {
  return {
    type: STREAM_EVENT_TYPES.STATUS,
    message,
    ...(requestedModel ? { requestedModel } : {}),
    ...(resolvedModel ? { resolvedModel } : {}),
    ...(provider ? { provider } : {}),
    isFallback: Boolean(isFallback)
  };
}

export function createUsageEvent({
  provider,
  requestedModel,
  resolvedModel,
  promptTokens = 0,
  completionTokens = 0,
  totalTokens = 0,
  cacheHit = false
}) {
  return {
    type: STREAM_EVENT_TYPES.USAGE,
    provider,
    requestedModel,
    resolvedModel,
    promptTokens,
    completionTokens,
    totalTokens,
    cacheHit
  };
}

export default {
  STREAM_EVENT_TYPES,
  createTextDeltaEvent,
  createStatusEvent,
  createUsageEvent
};
