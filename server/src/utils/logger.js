import config from '../config/env.js';

const SENSITIVE_KEYS = new Set([
  'apikey',
  'api_key',
  'token',
  'authorization',
  'secret',
  'password',
  'supabase_key',
  'service_role'
]);

const IMAGE_PAYLOAD_KEYS = new Set([
  'sourceimage',
  'source_image',
  'referenceimage',
  'reference_image',
  'referenceimages',
  'reference_images',
  'image',
  'images',
  'dataurl',
  'data_url',
  'init_image',
  'mask_image',
  'image_url',
  'b64_json'
]);

/**
 * Redacts secrets, tokens, and truncates Base64 image payloads in logged objects.
 */
export function redact(obj, depth = 0) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    // Redact Bearer / API keys in string
    let str = obj.replace(/(?:Bearer\s+|sk-or-v1-|sk-)[a-zA-Z0-9_\-]{16,}/gi, '[REDACTED_KEY]');
    // Truncate Base64 data URIs
    if (str.startsWith('data:image/')) {
      return `[BASE64_IMAGE len=${str.length}]`;
    }
    // Truncate long Base64 strings (> 500 chars)
    if (str.length > 500 && (/^[A-Za-z0-9+/=]{500,}$/.test(str) || str.startsWith('/9j/') || str.startsWith('iVBOR') || str.startsWith('R0lGOD') || str.startsWith('UklGR'))) {
      return `[BASE64_DATA len=${str.length}]`;
    }
    return str;
  }

  if (typeof obj !== 'object' || depth > 5) return obj;
  if (Array.isArray(obj)) return obj.map(item => redact(item, depth + 1));

  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('key') || lowerKey.includes('token') || lowerKey.includes('auth')) {
      cleaned[key] = '[REDACTED]';
    } else if (IMAGE_PAYLOAD_KEYS.has(lowerKey)) {
      if (typeof val === 'string') {
        cleaned[key] = `[BASE64_IMAGE len=${val.length}]`;
      } else if (Array.isArray(val)) {
        cleaned[key] = val.map(v => typeof v === 'string' ? `[BASE64_IMAGE len=${v.length}]` : redact(v, depth + 1));
      } else {
        cleaned[key] = redact(val, depth + 1);
      }
    } else if (typeof val === 'string') {
      cleaned[key] = redact(val, depth + 1);
    } else if (typeof val === 'object') {
      cleaned[key] = redact(val, depth + 1);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const requestId = meta.requestId || meta.id || '-';
  const cleanMeta = redact(meta);
  const cleanMsg = typeof message === 'string'
    ? message.replace(/(?:Bearer\s+|sk-or-v1-|sk-)[a-zA-Z0-9_\-]{16,}/gi, '[REDACTED_KEY]')
    : message;

  // If in dev, produce clean readable string; in prod, produce structured JSON
  if (config.isDev) {
    const metaStr = Object.keys(cleanMeta).length > 0 ? ` ${JSON.stringify(cleanMeta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [req:${requestId}] ${cleanMsg}${metaStr}`;
  }

  return JSON.stringify({
    timestamp,
    level,
    requestId,
    message: cleanMsg,
    ...cleanMeta
  });
}

export const logger = {
  info(message, meta) {
    console.log(formatMessage('info', message, meta));
  },
  warn(message, meta) {
    console.warn(formatMessage('warn', message, meta));
  },
  error(message, meta) {
    console.error(formatMessage('error', message, meta));
  },
  debug(message, meta) {
    if (!config.isProd) {
      console.debug(formatMessage('debug', message, meta));
    }
  }
};

export default logger;
