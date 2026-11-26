import logger from '../../utils/logger.js';

function withTimeout(promise, timeoutMs, toolName) {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Tool ${toolName} timed out after ${timeoutMs}ms`);
      err.code = 'TOOL_TIMEOUT';
      reject(err);
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Unified Tool Execution Engine
 * - Validates input via tool's Zod inputSchema
 * - Emits real status updates via onStatus
 * - Enforces timeouts, abort signal, and bounded retries
 * - Returns a normalized envelope without throwing raw provider/internal errors
 */
export async function executeUnifiedTool(toolDef, rawInput, context = {}) {
  const startedAt = Date.now();
  const {
    requestId = '-',
    abortSignal = null,
    onStatus = null
  } = context;

  if (!toolDef || !toolDef.implemented || toolDef.status !== 'active' || typeof toolDef.handler !== 'function') {
    return {
      ok: false,
      toolName: toolDef?.name || 'unknown',
      durationMs: Date.now() - startedAt,
      error: {
        code: 'TOOL_UNAVAILABLE',
        message: `Tool "${toolDef?.name || 'unknown'}" is not currently active.`
      }
    };
  }

  if (abortSignal?.aborted) {
    return {
      ok: false,
      toolName: toolDef.name,
      durationMs: Date.now() - startedAt,
      error: { code: 'TOOL_ABORTED', message: 'Tool execution aborted by client.' }
    };
  }

  let parsedInput = rawInput;
  if (toolDef.inputSchema) {
    const validation = toolDef.inputSchema.safeParse(rawInput ?? {});
    if (!validation.success) {
      return {
        ok: false,
        toolName: toolDef.name,
        durationMs: Date.now() - startedAt,
        error: {
          code: 'TOOL_VALIDATION_ERROR',
          message: validation.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ')
        }
      };
    }
    parsedInput = validation.data;
  }

  if (typeof onStatus === 'function') {
    try {
      await onStatus(`Running tool: ${toolDef.displayName}...`);
    } catch {
      // Non-fatal status callback failure
    }
  }

  const maxAttempts = Math.max(1, (toolDef.retries ?? 0) + 1);
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (abortSignal?.aborted) {
      return {
        ok: false,
        toolName: toolDef.name,
        durationMs: Date.now() - startedAt,
        error: { code: 'TOOL_ABORTED', message: 'Tool execution aborted by client.' }
      };
    }

    try {
      const data = await withTimeout(
        Promise.resolve(toolDef.handler(parsedInput, context)),
        toolDef.timeoutMs || 15000,
        toolDef.name
      );
      const durationMs = Date.now() - startedAt;
      logger.info('Unified tool executed', {
        requestId,
        toolName: toolDef.name,
        attempt,
        durationMs,
        status: 'success'
      });
      return {
        ok: true,
        toolName: toolDef.name,
        durationMs,
        data
      };
    } catch (err) {
      lastError = err;
      logger.warn('Unified tool attempt failed', {
        requestId,
        toolName: toolDef.name,
        attempt,
        error: err.message
      });
    }
  }

  return {
    ok: false,
    toolName: toolDef.name,
    durationMs: Date.now() - startedAt,
    error: {
      code: lastError?.code || 'TOOL_EXECUTION_ERROR',
      message: lastError?.message || `Tool ${toolDef.name} failed.`
    }
  };
}

export default {
  executeUnifiedTool
};
