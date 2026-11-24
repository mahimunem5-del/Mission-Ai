import axios from 'axios';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';
import {
  SafetyRefusalError,
  ProviderTimeoutError,
  ProviderError
} from '../../utils/errors.js';
import { getImageModelConfig } from '../../config/imageModelRegistry.js';
import { geminiImageAdapter } from './geminiImageAdapter.js';
import { openaiImageAdapter } from './openaiImageAdapter.js';
import { fluxImageAdapter } from './fluxImageAdapter.js';
import { seedreamImageAdapter } from './seedreamImageAdapter.js';
import { textOnlyImageAdapter } from './textOnlyImageAdapter.js';
import { extractAndNormalizeImage } from './baseAdapter.js';

const ADAPTER_MAP = {
  gemini: geminiImageAdapter,
  openai: openaiImageAdapter,
  flux: fluxImageAdapter,
  seedream: seedreamImageAdapter,
  textOnly: textOnlyImageAdapter
};

/**
 * Checks whether an upstream error represents a safety / content policy refusal.
 */
export function isSafetyRefusal(err) {
  if (!err) return false;
  const status = err.response?.status || err.statusCode || err.status;
  const data = err.response?.data;
  const msg = (
    data?.error?.message ||
    data?.message ||
    err.message ||
    ''
  ).toLowerCase();

  if (status === 422 || status === 400) {
    if (
      msg.includes('safety') ||
      msg.includes('moderation') ||
      msg.includes('content policy') ||
      msg.includes('content filter') ||
      msg.includes('nsfw') ||
      msg.includes('sensitive') ||
      msg.includes('violat') ||
      msg.includes('prohibited') ||
      msg.includes('refusal')
    ) {
      return true;
    }
  }

  return err instanceof SafetyRefusalError || err.code === 'SAFETY_REFUSAL';
}

/**
 * Checks whether an error is transient (network drop, 502, 503, 504) and eligible for retry.
 */
export function isTransientError(err) {
  if (!err) return false;
  if (isSafetyRefusal(err)) return false;

  const status = err.response?.status || err.statusCode || err.status;
  if (status === 502 || status === 503 || status === 504) return true;

  const code = err.code || '';
  if (['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN', 'ECONNABORTED'].includes(code)) {
    return true;
  }

  const msg = (err.message || '').toLowerCase();
  if (msg.includes('socket hang up') || msg.includes('network error') || msg.includes('econnreset') || msg.includes('etimedout')) {
    return true;
  }

  return false;
}

/**
 * Executes an async operation with bounded transient-only retries and exponential backoff.
 * NEVER retries 400 validation, 422 capability errors, or safety refusals.
 */
export async function executeWithTransientRetry(requestFn, options = {}) {
  const maxRetries = options.maxRetries ?? 2;
  const initialDelay = options.initialDelayMs ?? 300;
  const requestId = options.requestId || '';

  let attempt = 0;
  while (true) {
    try {
      return await requestFn(attempt);
    } catch (err) {
      attempt++;

      // Absolute Rule: NEVER retry or bypass safety refusals
      if (isSafetyRefusal(err)) {
        logger.warn('Provider rejected request due to content safety policy. Zero retries executed.', {
          requestId,
          error: err.response?.data?.error?.message || err.message
        });
        const safetyMessage = err.response?.data?.error?.message || 'The request was flagged by content safety filters.';
        const safetyErr = new SafetyRefusalError(safetyMessage, {
          providerStatus: err.response?.status || 422,
          requestId
        });
        throw safetyErr;
      }

      // Retry ONLY transient errors
      if (attempt <= maxRetries && isTransientError(err)) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        logger.warn(`Transient upstream error (status ${err.response?.status || err.code}). Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`, {
          requestId,
          status: err.response?.status,
          code: err.code
        });
        await new Promise(res => setTimeout(res, delay));
        continue;
      }

      // Format clean timeout error
      if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout')) || err.response?.status === 504) {
        const timeoutErr = new ProviderTimeoutError(
          'The upstream image provider timed out while generating your image.',
          { originalMessage: err.message, requestId }
        );
        throw timeoutErr;
      }

      // Format clean 502/503 provider error
      if (err.response?.status === 502 || err.response?.status === 503) {
        const providerErr = new ProviderError(
          err.response?.data?.error?.message || 'Upstream image provider returned a service error.',
          'upstream',
          err
        );
        throw providerErr;
      }

      throw err;
    }
  }
}

/**
 * Returns the matching adapter instance for a given model identifier or registry config.
 */
export function getAdapter(rawModel) {
  const modelConfig = typeof rawModel === 'object' && rawModel?.adapter
    ? rawModel
    : getImageModelConfig(rawModel);

  const adapterKey = modelConfig.adapter || 'openai';
  return ADAPTER_MAP[adapterKey] || openaiImageAdapter;
}

/**
 * Prepares a model-specific payload with validated parameters, optimized image limits, and endpoint info.
 */
export async function prepareModelPayload(rawModel, options = {}) {
  const modelConfig = typeof rawModel === 'object' && rawModel?.id
    ? rawModel
    : getImageModelConfig(rawModel);
  const adapter = getAdapter(modelConfig);

  const payload = await adapter.preparePayload({
    ...options,
    modelConfig
  });

  const endpoint = adapter.getEndpoint(modelConfig);

  return {
    payload,
    endpoint,
    modelConfig,
    adapter
  };
}

/**
 * Dispatches an image generation request through its model-specific adapter,
 * managing concurrency (batch count), slug fallbacks, and response parsing.
 */
export async function dispatchModelGeneration({ apiKey, rawModel, options = {}, requestId = '' }) {
  const effectiveKey = apiKey || process.env.OPENROUTER_API_KEY || config.openrouter?.apiKey;
  if (!effectiveKey) {
    throw new Error('OpenRouter API key is not configured.');
  }

  const modelConfig = getImageModelConfig(rawModel);
  const adapter = getAdapter(modelConfig);
  const { payload, endpoint } = await prepareModelPayload(modelConfig, options);

  const totalCount = Math.min(Math.max(parseInt(options.count || options.imageCount || 1, 10), 1), 4);
  const headers = {
    'Authorization': `Bearer ${effectiveKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': config.openrouter?.siteUrl || 'http://localhost:5001',
    'X-Title': config.openrouter?.siteName || 'Mestrio AI'
  };

  logger.info('Dispatching generation via model-specific adapter', {
    requestId,
    adapter: adapter.name,
    model: modelConfig.id,
    providerModelId: payload.model,
    count: totalCount,
    hasSourceImage: Boolean(options.sourceImage),
    referenceImagesCount: Array.isArray(options.referenceImages) ? options.referenceImages.length : 0
  });

  // Handle Seedream special slug fallback if needed
  const isSeedream = adapter.name === 'seedream';

  const tasks = Array.from({ length: totalCount }, async () => {
    try {
      const responseData = await executeWithTransientRetry(async (attempt) => {
        let currentModel = payload.model;
        if (isSeedream && attempt > 0 && adapter.getFallbackSlug) {
          const fallbackSlug = adapter.getFallbackSlug(payload.model);
          if (fallbackSlug) currentModel = fallbackSlug;
        }

        const taskPayload = { ...payload, model: currentModel };
        if (endpoint.url.includes('/chat/completions') && taskPayload.messages) {
          delete taskPayload.prompt;
        }
        const res = await axios.post(endpoint.url, taskPayload, {
          headers,
          timeout: 60000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        });
        return res.data;
      }, { requestId, maxRetries: 2, initialDelayMs: 300 });

      return { ok: true, data: responseData };
    } catch (err) {
      return { ok: false, error: err };
    }
  });

  const results = await Promise.all(tasks);
  const generatedUrls = [];
  let firstError = null;

  for (const resItem of results) {
    if (resItem.ok && resItem.data) {
      const extracted = adapter.parseResponse(resItem.data);
      for (const url of extracted) {
        if (url && !generatedUrls.includes(url)) {
          generatedUrls.push(url);
        }
      }
    } else {
      if (!firstError) firstError = resItem.error;
    }
  }

  if (generatedUrls.length > 0 && firstError) {
    logger.warn('Partial success in variation generation: some variations succeeded while others failed', {
      requestId,
      succeededCount: generatedUrls.length,
      requestedCount: totalCount,
      partialError: firstError.message
    });
  }

  // Defensive fallback: ONLY if explicit fallback was permitted and NOT a safety refusal
  if (generatedUrls.length === 0 && options.allowTextOnlyFallback === true && !isSafetyRefusal(firstError) && (payload.image_url || payload.source_image || payload.reference_images || payload.image_references)) {
    logger.info('Adapter multimodal fields rejected by provider and text-only fallback was explicitly permitted, retrying as text-to-image', {
      requestId,
      model: modelConfig.id
    });

    const strippedPayload = { ...payload };
    delete strippedPayload.image_url;
    delete strippedPayload.source_image;
    delete strippedPayload.init_image;
    delete strippedPayload.image;
    delete strippedPayload.reference_images;
    delete strippedPayload.image_references;
    delete strippedPayload.input_references;

    const retryTasks = Array.from({ length: totalCount }, async () => {
      try {
        const responseData = await executeWithTransientRetry(async () => {
          const res = await axios.post(endpoint.url, strippedPayload, {
            headers,
            timeout: 60000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          });
          return res.data;
        }, { requestId, maxRetries: 1 });
        return { ok: true, data: responseData };
      } catch (err) {
        return { ok: false, error: err };
      }
    });

    const retryResults = await Promise.all(retryTasks);
    for (const resItem of retryResults) {
      if (resItem.ok && resItem.data) {
        const extracted = adapter.parseResponse(resItem.data);
        for (const url of extracted) {
          if (url && !generatedUrls.includes(url)) {
            generatedUrls.push(url);
          }
        }
      }
    }
  }

  if (generatedUrls.length === 0) {
    if (firstError instanceof SafetyRefusalError || firstError instanceof ProviderTimeoutError || firstError instanceof ProviderError) {
      throw firstError;
    }

    const errData = firstError?.response?.data;
    const statusCode = firstError?.response?.status || firstError?.statusCode || 500;
    const errorMsg =
      errData?.error?.message ||
      errData?.message ||
      firstError?.message ||
      `${modelConfig.displayName} generation failed. Please try again.`;

    logger.error('All generation attempts through adapter failed', {
      requestId,
      statusCode,
      error: errorMsg
    });

    const customErr = new Error(errorMsg);
    customErr.statusCode = statusCode;
    throw customErr;
  }

  return {
    images: generatedUrls.slice(0, totalCount),
    modelConfig,
    adapterName: adapter.name
  };
}

export {
  geminiImageAdapter,
  openaiImageAdapter,
  fluxImageAdapter,
  seedreamImageAdapter,
  textOnlyImageAdapter
};

export default {
  getAdapter,
  prepareModelPayload,
  dispatchModelGeneration,
  executeWithTransientRetry,
  isTransientError,
  isSafetyRefusal,
  geminiImageAdapter,
  openaiImageAdapter,
  fluxImageAdapter,
  seedreamImageAdapter,
  textOnlyImageAdapter
};
