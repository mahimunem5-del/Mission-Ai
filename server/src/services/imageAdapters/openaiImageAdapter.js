import { parseImagesFromResponseData } from './baseAdapter.js';
import { ensureOpenRouterPayloadLimits, optimizeBase64DataUrl } from '../../utils/imageOptimizer.js';

/**
 * MESTRIO AI — OpenAI Image Model Adapter
 * Supports GPT Image 2.5 Sunburst (and GPT-5 Image).
 * Strips raw unsupported parameters (e.g. 'quality') and formats source/init images cleanly.
 */

export const openaiImageAdapter = {
  name: 'openai',

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

    const payload = {
      model: targetModelId,
      prompt: textPrompt,
      size: `${dimensions.width}x${dimensions.height}`,
      width: dimensions.width || 1024,
      height: dimensions.height || 1024,
      aspect_ratio: dimensions.aspect_ratio || '1:1'
    };

    // Explicitly do not pass raw quality to OpenRouter to avoid "unknown parameter 'quality'"
    delete payload.quality;

    if (seed && !isNaN(parseInt(seed, 10))) {
      payload.seed = parseInt(seed, 10);
    }

    if (sourceImage) {
      const optimizedSource = await optimizeBase64DataUrl(sourceImage);
      // Use canonical OpenRouter input_references for source images
      payload.input_references = [
        { type: 'image_url', image_url: { url: optimizedSource } }
      ];
    } else if (Array.isArray(referenceImages) && referenceImages.length > 0 && modelConfig.supportsReferenceImages) {
      const maxRefs = modelConfig.maxReferenceImages || 2;
      const validRefs = referenceImages.slice(0, maxRefs);
      const optimizedRefs = await Promise.all(validRefs.map(r => optimizeBase64DataUrl(r)));

      // Use canonical OpenRouter input_references array (the ONLY field the /images endpoint reads)
      payload.input_references = optimizedRefs.map(url => ({
        type: 'image_url',
        image_url: { url }
      }));
    }

    return await ensureOpenRouterPayloadLimits(payload);
  },

  getEndpoint() {
    return {
      url: 'https://openrouter.ai/api/v1/images',
      method: 'POST'
    };
  },

  parseResponse(responseData) {
    return parseImagesFromResponseData(responseData);
  }
};

export default openaiImageAdapter;
