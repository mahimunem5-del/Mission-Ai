import { optimizeBase64DataUrl, ensureOpenRouterPayloadLimits } from '../../utils/imageOptimizer.js';

/**
 * MESTRIO AI — Base Model Adapter
 * Shared utilities, normalization, and payload boundary enforcement.
 */

export function extractAndNormalizeImage(dataItem) {
  if (!dataItem) return null;

  if (typeof dataItem === 'string') {
    const trimmed = dataItem.trim();
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/9j/')) return `data:image/jpeg;base64,${trimmed}`;
    if (trimmed.startsWith('iVBOR')) return `data:image/png;base64,${trimmed}`;
    if (trimmed.startsWith('R0lGOD')) return `data:image/gif;base64,${trimmed}`;
    if (trimmed.startsWith('UklGR')) return `data:image/webp;base64,${trimmed}`;
    return `data:image/png;base64,${trimmed}`;
  }

  if (typeof dataItem === 'object') {
    if (dataItem.image_url) {
      const inner = typeof dataItem.image_url === 'object' ? dataItem.image_url.url : dataItem.image_url;
      return extractAndNormalizeImage(inner);
    }
    if (dataItem.url && typeof dataItem.url === 'string') {
      return extractAndNormalizeImage(dataItem.url);
    }
    if (dataItem.b64_json && typeof dataItem.b64_json === 'string') {
      const b64 = dataItem.b64_json.trim();
      return b64.startsWith('data:image/') ? b64 : `data:image/png;base64,${b64}`;
    }
    if (dataItem.image && typeof dataItem.image === 'string') {
      return extractAndNormalizeImage(dataItem.image);
    }
  }

  return null;
}

export function parseImagesFromResponseData(responseData) {
  if (!responseData) return [];
  const found = [];

  const addIfValid = (item) => {
    const formatted = extractAndNormalizeImage(item);
    if (formatted && !found.includes(formatted)) {
      found.push(formatted);
    }
  };

  // 1. choices array (Chat Completions multimodal output)
  if (Array.isArray(responseData.choices)) {
    for (const choice of responseData.choices) {
      const msg = choice?.message;
      if (!msg) continue;
      if (Array.isArray(msg.images)) {
        for (const img of msg.images) addIfValid(img);
      }
      if (msg.image) addIfValid(msg.image);
      if (typeof msg.content === 'string') {
        const mdRegex = /!\[.*?\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)/gi;
        let match;
        while ((match = mdRegex.exec(msg.content)) !== null) {
          if (match[1]) addIfValid(match[1]);
        }
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part?.type === 'image_url' && part.image_url?.url) addIfValid(part.image_url.url);
          else if (part?.type === 'image' && (part.image || part.url)) addIfValid(part.image || part.url);
        }
      }
    }
  }

  // 2. Direct data array (Standard OpenRouter /images)
  if (Array.isArray(responseData.data)) {
    for (const item of responseData.data) addIfValid(item);
  }

  // 3. Direct images array
  if (Array.isArray(responseData.images)) {
    for (const item of responseData.images) addIfValid(item);
  }

  // 4. Top-level url or image
  if (responseData.url || responseData.imageUrl) {
    addIfValid(responseData.url || responseData.imageUrl);
  }
  if (responseData.image) {
    addIfValid(responseData.image);
  }

  return found;
}

export default {
  extractAndNormalizeImage,
  parseImagesFromResponseData
};
