import { parseImagesFromResponseData } from './baseAdapter.js';
import { ensureOpenRouterPayloadLimits } from '../../utils/imageOptimizer.js';

/**
 * MESTRIO AI — Text-Only Image Model Adapter
 * Supports Meta: Muse Image, Recraft V3, and pure text-to-image models.
 * Strictly guarantees that NO multimodal image fields (image_url, source_image, reference_images)
 * are forwarded to upstream endpoints that reject them with HTTP 400.
 */

export const textOnlyImageAdapter = {
  name: 'textOnly',

  async preparePayload(options) {
    const {
      prompt,
      finalPrompt,
      modelConfig,
      dimensions = { width: 1024, height: 1024, aspect_ratio: '1:1' },
      seed
    } = options;

    const targetModelId = modelConfig.providerModelId || modelConfig.id;
    const textPrompt = finalPrompt || prompt || '';

    const payload = {
      model: targetModelId,
      prompt: textPrompt,
      aspect_ratio: dimensions.aspect_ratio || '1:1'
    };

    if (dimensions.width && dimensions.height) {
      payload.width = dimensions.width;
      payload.height = dimensions.height;
      payload.size = `${dimensions.width}x${dimensions.height}`;
    }

    delete payload.quality;

    if (seed && !isNaN(parseInt(seed, 10))) {
      payload.seed = parseInt(seed, 10);
    }

    // Explicitly enforce: No image_url, image_reference, or source_image
    delete payload.image_url;
    delete payload.source_image;
    delete payload.init_image;
    delete payload.image;
    delete payload.reference_images;
    delete payload.image_references;
    delete payload.input_references;

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

export default textOnlyImageAdapter;
