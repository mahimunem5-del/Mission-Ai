import {
  IMAGE_MODEL_REGISTRY,
  getImageModelConfig,
  getReferenceCapableModels
} from '../config/imageModelRegistry.js';

/**
 * MESTRIO AI — Image Generation & Editing Preflight Validation (Stage E & G)
 * 
 * Guarantees zero silent stripping of reference images.
 * If a user explicitly selects a text-only model (e.g. FLUX.2 Pro, Meta: Muse Image)
 * with reference images attached, rejects with structured HTTP 422 UNSUPPORTED_REFERENCE_WORKFLOW
 * and lists compatible reference-capable models.
 */

export function validateImagePreflight(params = {}) {
  const {
    model,
    referenceImages = [],
    sourceImage,
    aspectRatio = '1:1',
    allowTextOnlyFallback = false,
    mode = 'generate'
  } = params;

  const isAuto = !model || model === 'auto' || (typeof model === 'string' && model.toLowerCase() === 'auto');
  const hasReferences = Array.isArray(referenceImages) && referenceImages.length > 0;
  const hasSource = Boolean(sourceImage);

  // If Auto mode, preflight passes because Auto smart routing dynamically picks
  // a verified reference-capable model when reference images are attached.
  if (isAuto) {
    return {
      valid: true,
      isAuto: true,
      modelConfig: null
    };
  }

  // Resolve explicit model config from registry
  const modelConfig = getImageModelConfig(model);

  // CRITICAL CHECK 1: Explicit text-only model with attached reference images
  if (hasReferences && !modelConfig.supportsReferenceImages && !allowTextOnlyFallback) {
    const recommended = getReferenceCapableModels();

    return {
      valid: false,
      statusCode: 422,
      code: 'UNSUPPORTED_REFERENCE_WORKFLOW',
      message: `The selected model '${modelConfig.displayName}' does not support reference images. Please select a reference-capable model (such as Nano Banana Pro or GPT Image 2.5 Sunburst), or approve text-only generation.`,
      details: {
        selectedModel: modelConfig.id,
        selectedModelName: modelConfig.displayName,
        supportsReferenceImages: false,
        referenceImagesAttached: referenceImages.length,
        allowTextOnlyFallback
      },
      recommendedModels: recommended
    };
  }

  // CRITICAL CHECK 2: Precise edit on a model that does not support image editing
  if (mode === 'precise-edit' && !modelConfig.supportsImageEditing && !isAuto) {
    return {
      valid: false,
      statusCode: 422,
      code: 'UNSUPPORTED_EDIT_WORKFLOW',
      message: `The selected model '${modelConfig.displayName}' does not support image editing. Please use FLUX.2 Flex, Seedream 5.5, or Nano Banana 2 for precise edits.`,
      details: {
        selectedModel: modelConfig.id,
        selectedModelName: modelConfig.displayName,
        supportsImageEditing: false
      },
      recommendedModels: Object.values(IMAGE_MODEL_REGISTRY)
        .filter(m => m.supportsImageEditing)
        .map(m => ({ id: m.id, displayName: m.displayName }))
    };
  }

  const warnings = [];
  if (hasReferences && modelConfig.supportsReferenceImages && typeof modelConfig.maxReferenceImages === 'number') {
    if (referenceImages.length > modelConfig.maxReferenceImages) {
      warnings.push({
        type: 'REFERENCE_COUNT_OVERFLOW',
        message: `Selected model '${modelConfig.displayName}' supports up to ${modelConfig.maxReferenceImages} reference image(s). Received ${referenceImages.length}; additional references will be truncated.`,
        maxAllowed: modelConfig.maxReferenceImages,
        provided: referenceImages.length
      });
    }
  }

  return {
    valid: true,
    isAuto: false,
    modelConfig,
    resolvedModel: modelConfig.id,
    resolvedModelName: modelConfig.displayName,
    ...(warnings.length > 0 ? { warnings } : {})
  };
}

export default {
  validateImagePreflight
};
