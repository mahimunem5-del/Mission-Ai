import { parseImagesFromResponseData } from './baseAdapter.js';
import { ensureOpenRouterPayloadLimits, optimizeBase64DataUrl } from '../../utils/imageOptimizer.js';

/**
 * MESTRIO AI — FLUX Image Model Adapter
 * Supports FLUX.2 Pro and FLUX.2 Flex.
 * Strictly avoids attaching unsupported multimodal fields to FLUX.2 Pro to prevent provider 400 errors.
 * Constructs correct image_references and input_references for inpainting / editing models.
 */

export const fluxImageAdapter = {
  name: 'flux',

  async preparePayload(options) {
    const {
      prompt,
      finalPrompt,
      modelConfig,
      dimensions = { width: 1024, height: 1024, aspect_ratio: '1:1' },
      seed,
      sourceImage,
      referenceImages = [],
      isEditMode = false,
      mode = 'generate'
    } = options;

    const targetModelId = modelConfig.providerModelId || modelConfig.id;
    const textPrompt = finalPrompt || prompt || '';
    const isDedicatedEdit = mode === 'precise-edit' || targetModelId === 'black-forest-labs/flux.2-flex' || targetModelId === 'krea/k3-edit';

    // 1. Inpainting / Precise Edit Model (FLUX.2 Flex Edit)
    if (isDedicatedEdit || (sourceImage && modelConfig.supportsImageEditing)) {
      const sanitizedSource = sourceImage ? await optimizeBase64DataUrl(sourceImage) : null;
      let rawRefs = Array.isArray(referenceImages) ? referenceImages : [];
      const optimizedRefs = await Promise.all(
        rawRefs
          .filter(r => r && r !== sourceImage)
          .slice(0, Math.min(modelConfig.maxReferenceImages || 4, 7))
          .map(r => optimizeBase64DataUrl(r))
      );

      const allRefs = [sanitizedSource, ...optimizedRefs].filter(Boolean);

      const payload = {
        model: targetModelId,
        prompt: textPrompt,
        aspect_ratio: dimensions.aspect_ratio || '1:1',
        // Canonical OpenRouter input_references format (read by /api/v1/images)
        input_references: allRefs.map(url => ({
          type: 'image_url',
          image_url: { url }
        })),
        image_references: allRefs
      };

      if (seed && !isNaN(parseInt(seed, 10))) {
        payload.seed = parseInt(seed, 10);
      }

      return await ensureOpenRouterPayloadLimits(payload);
    }

    // 2. Standard FLUX.2 Pro / Flex Generation
    const payload = {
      model: targetModelId,
      prompt: textPrompt,
      size: `${dimensions.width}x${dimensions.height}`,
      width: dimensions.width || 1024,
      height: dimensions.height || 1024,
      aspect_ratio: dimensions.aspect_ratio || '1:1'
    };

    delete payload.quality;

    if (seed && !isNaN(parseInt(seed, 10))) {
      payload.seed = parseInt(seed, 10);
    }

    // FLUX.2 Pro on standard OpenRouter /images endpoint rejects direct image_url/multimodal parameters.
    // If the model does not support reference images (supportsReferenceImages === false),
    // we strictly DO NOT attach input_references to prevent provider rejection.
    if (modelConfig.supportsReferenceImages && sourceImage) {
      const optSrc = await optimizeBase64DataUrl(sourceImage);
      payload.input_references = [
        { type: 'image_url', image_url: { url: optSrc } }
      ];
    } else if (modelConfig.supportsReferenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
      // Attach reference images for FLUX.2 Flex generate mode (supportsReferenceImages=true)
      const maxRefs = modelConfig.maxReferenceImages || 1;
      const validRefs = referenceImages.slice(0, maxRefs);
      const optimizedRefs = await Promise.all(validRefs.map(r => optimizeBase64DataUrl(r)));
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

export default fluxImageAdapter;
