import logger from '../../utils/logger.js';

/**
 * Centralized SSE Streaming Session
 * Manages SSE headers, client disconnect / AbortController lifecycle,
 * standardized event emission (text, status, sources, image, tool_call, tool_result, error, [DONE]),
 * and safe stream termination.
 */
export function createSseSession(req, res, requestId = '-') {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  let isClientDisconnected = false;
  const abortController = new AbortController();

  const handleAbort = () => {
    if (!isClientDisconnected) {
      isClientDisconnected = true;
      abortController.abort();
      logger.debug('Client SSE connection aborted', { requestId });
    }
  };

  req.on('aborted', handleAbort);
  res.on('close', () => {
    if (!res.writableEnded) {
      handleAbort();
    }
  });

  const isAborted = () => isClientDisconnected || res.writableEnded || res.destroyed;

  const writeChunk = (payload) => {
    if (isAborted()) return;

    if (payload === '[DONE]') {
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const endWithError = (message, code = 'STREAM_ERROR') => {
    if (isAborted()) return;
    try {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        if (typeof res.flushHeaders === 'function') res.flushHeaders();
      }
      res.write(`data: ${JSON.stringify({ type: 'stream_error', error: message, code, text: `\n\n[Error: ${message}]` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (_) {
      try { res.end(); } catch (__) {}
    }
  };

  return {
    abortSignal: abortController.signal,
    isAborted,
    writeChunk,
    endWithError
  };
}

export default {
  createSseSession
};
