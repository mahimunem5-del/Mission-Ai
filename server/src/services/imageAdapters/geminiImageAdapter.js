import { parseImagesFromResponseData } from './baseAdapter.js';
import { ensureOpenRouterPayloadLimits, optimizeBase64DataUrl } from '../../utils/imageOptimizer.js';

/**
 * MESTRIO AI — Gemini Image Model Adapter
 * Supports Google Gemini 3 Pro Image (Nano Banana Pro) & Gemini 3.1 Flash Image (Nano Banana 2).
 * Handles multimodal reference/source image attachments cleanly.
 */

export const geminiImageAdapter = {
  name: 'gemini',

  async preparePayload(options) {
    const {
      prompt,
      finalPrompt,
      modelConfig,
      dimensions = { width: 1024, height: 1024, aspect_ratio: '1:1' },
      seed,
      sourceImage,
      referenceImages = [],
      isEditMode = false
    } = options;

    const targetModelId = modelConfig.providerModelId || modelConfig.id;
    const textPrompt = finalPrompt || prompt || '';

    // Multi-modal message content array for Gemini on OpenRouter chat/completions
    const content = [];

    // Prompt instructions including aspect ratio hint
    content.push({
      type: 'text',
      text: dimensions?.aspect_ratio 
        ? `${textPrompt} (Target aspect ratio: ${dimensions.aspect_ratio})`
        : textPrompt
    });

    const references = [];
    if (sourceImage) {
      const optimizedSource = await optimizeBase64DataUrl(sourceImage);
      // Source image always goes first
      references.push({ type: 'image_url', image_url: { url: optimizedSource } });
      content.push({ type: 'image_url', image_url: { url: optimizedSource } });
    }

    if (Array.isArray(referenceImages) && referenceImages.length > 0) {
      const maxRefs = modelConfig.maxReferenceImages || 2;
      const validRefs = referenceImages.filter(r => r && r !== sourceImage).slice(0, maxRefs);
      const optimizedRefs = await Promise.all(validRefs.map(r => optimizeBase64DataUrl(r)));
      optimizedRefs.forEach(url => {
        references.push({ type: 'image_url', image_url: { url } });
        content.push({ type: 'image_url', image_url: { url } });
      });
    }

    const payload = {
      model: targetModelId,
      prompt: textPrompt,
      aspect_ratio: dimensions.aspect_ratio || '1:1',
      width: dimensions.width || 1024,
      height: dimensions.height || 1024,
      messages: [
        {
          role: 'user',
          content
        }
      ],
      modalities: ['image', 'text'],
      max_tokens: 4096
    };

    if (references.length > 0) {
      payload.input_references = references;
    }

    if (seed && !isNaN(parseInt(seed, 10))) {
      payload.seed = parseInt(seed, 10);
    }

    // Enforce OpenRouter payload limit safeguard (< 6 MB)
    return await ensureOpenRouterPayloadLimits(payload);
  },

  getEndpoint() {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      method: 'POST'
    };
  },

  parseResponse(responseData) {
    return parseImagesFromResponseData(responseData);
  }
};

export default geminiImageAdapter;
