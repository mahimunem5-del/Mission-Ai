import { parseImagesFromResponseData } from './baseAdapter.js';
import { ensureOpenRouterPayloadLimits, optimizeBase64DataUrl } from '../../utils/imageOptimizer.js';

/**
 * MESTRIO AI — ByteDance Seedream Model Adapter
 * Supports Seedream 5.0 Pro via OpenRouter dedicated /api/v1/images endpoint.
 * Provides slug fallback between 5.0-pro, 5-0-pro, and 4.5.
 */

export const seedreamImageAdapter = {
  name: 'seedream',

  async preparePayload(options) {
    const {
      prompt,
      finalPrompt,
      modelConfig,
      dimensions = { width: 1024, height: 1024, aspect_ratio: '1:1' },
      seed,
      sourceImage,
      referenceImages = []
    } = options;

    const targetModelId = modelConfig.providerModelId || modelConfig.id;
    const textPrompt = finalPrompt || prompt || '';

    const payload = {
      model: targetModelId,
      prompt: textPrompt
    };

    if (dimensions.aspect_ratio) {
      payload.aspect_ratio = dimensions.aspect_ratio;
    }
    if (dimensions.width && dimensions.height) {
      payload.width = dimensions.width;
      payload.height = dimensions.height;
    }

    if (seed && !isNaN(parseInt(seed, 10))) {
      payload.seed = parseInt(seed, 10);
    }

    if (sourceImage) {
      const optSrc = await optimizeBase64DataUrl(sourceImage);
      // Always include source image first in input_references
      const references = [{ type: 'image_url', image_url: { url: optSrc } }];

      // Also append any reference images after the source image
      if (Array.isArray(referenceImages) && referenceImages.length > 0) {
        const maxRefs = modelConfig.maxReferenceImages || 10;
        const validRefs = referenceImages.filter(r => r && r !== sourceImage).slice(0, maxRefs);
        for (const ref of validRefs) {
          const optRef = await optimizeBase64DataUrl(ref);
          references.push({ type: 'image_url', image_url: { url: optRef } });
        }
      }
      payload.input_references = references;
    } else if (Array.isArray(referenceImages) && referenceImages.length > 0) {
      const maxRefs = modelConfig.maxReferenceImages || 10;
      const validRefs = referenceImages.slice(0, maxRefs);
      const references = [];
      for (const ref of validRefs) {
        const optRef = await optimizeBase64DataUrl(ref);
        references.push({ type: 'image_url', image_url: { url: optRef } });
      }
      payload.input_references = references;
    }

    return await ensureOpenRouterPayloadLimits(payload);
  },

  getEndpoint() {
    return {
      url: 'https://openrouter.ai/api/v1/images',
      method: 'POST'
    };
  },

  getFallbackSlug(currentSlug) {
    if (currentSlug === 'bytedance-seed/seedream-5.0-pro') {
      return 'bytedance-seed/seedream-5-0-pro';
    }
    if (currentSlug === 'bytedance-seed/seedream-5-0-pro') {
      return 'bytedance-seed/seedream-4.5';
    }
    return null;
  },

  parseResponse(responseData) {
    return parseImagesFromResponseData(responseData);
  }
};

export default seedreamImageAdapter;
