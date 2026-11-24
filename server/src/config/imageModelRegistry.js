/**
 * MESTRIO AI — Centralized Image Model Capability Registry
 * 
 * Maps all frontend model identifiers and display names to verified provider/OpenRouter model IDs,
 * documenting real capabilities, supported modes, reference image support, resolutions, and limitations.
 * 
 * STRICT COMPLIANCE: Keeps all 6 existing frontend display names and aliases 100% intact.
 */

export const IMAGE_MODEL_REGISTRY = {
  // 1. OpenAI: GPT Image 2.5 Sunburst
  'openai/gpt-image-2.5-sunburst': {
    id: 'openai/gpt-image-2.5-sunburst',
    displayName: 'GPT Image 2.5 Sunburst',
    aliases: [
      'openai/gpt-image-2.5-sunburst',
      'GPT Image 2.5 Sunburst',
      'gpt-image-2.5-sunburst',
      'openai/gpt-5-image',
      'gpt-5-image'
    ],
    providerModelId: 'openai/gpt-image-2.5-sunburst',
    alternativeProviderIds: ['openai/gpt-5-image'],
    adapter: 'openai',
    supportedModes: ['text-to-image', 'image-to-image', 'precise-edit'],
    supportsReferenceImages: true,
    maxReferenceImages: 2,
    supportsImageEditing: true,
    identityPreservationStrength: 'moderate',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' },
      { width: 1152, height: 864, ratio: '4:3' },
      { width: 864, height: 1152, ratio: '3:4' },
      { width: 1248, height: 832, ratio: '3:2' },
      { width: 832, height: 1248, ratio: '2:3' }
    ],
    outputFormat: 'b64_json',
    knownLimitations: [
      'Safety filters reject trademarked character names (addressed via Mahi prompt sanitizer)',
      'High concurrency request limits on standard OpenAI tier'
    ]
  },

  // 2. Google: Nano Banana Pro (Gemini 3 Pro Image)
  'google/gemini-3-pro-image': {
    id: 'google/gemini-3-pro-image',
    displayName: 'Nano Banana Pro (Gemini 3 Pro Image)',
    aliases: [
      'google/gemini-3-pro-image',
      'google/nano-banana-pro',
      'Nano Banana Pro (Gemini 3 Pro Image)',
      'Nano Banana Pro',
      'google/gemini-3-pro-image-preview',
      'gemini-3-pro-image',
      'auto',
      'Auto (Mestrio Dynamic)'
    ],
    providerModelId: 'google/gemini-3-pro-image',
    alternativeProviderIds: ['google/gemini-3-pro-image-preview'],
    adapter: 'gemini',
    supportedModes: ['text-to-image', 'image-to-image', 'precise-edit'],
    supportsReferenceImages: true,
    maxReferenceImages: 3,
    supportsImageEditing: true,
    identityPreservationStrength: 'high',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' },
      { width: 1152, height: 864, ratio: '4:3' },
      { width: 864, height: 1152, ratio: '3:4' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Non-standard aspect ratios snap to nearest canonical proportion'
    ]
  },

  // 3. Black Forest Labs: FLUX.2 Pro
  'black-forest-labs/flux.2-pro': {
    id: 'black-forest-labs/flux.2-pro',
    displayName: 'FLUX.2 Pro',
    aliases: [
      'black-forest-labs/flux.2-pro',
      'FLUX.2 Pro',
      'flux.2-pro',
      'flux-2-pro'
    ],
    providerModelId: 'black-forest-labs/flux.2-pro',
    alternativeProviderIds: [],
    adapter: 'flux',
    supportedModes: ['text-to-image'],
    supportsReferenceImages: false,
    maxReferenceImages: 0,
    supportsImageEditing: false,
    identityPreservationStrength: 'none',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' },
      { width: 1152, height: 864, ratio: '4:3' },
      { width: 864, height: 1152, ratio: '3:4' },
      { width: 1248, height: 832, ratio: '3:2' },
      { width: 832, height: 1248, ratio: '2:3' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Standard OpenRouter /images endpoint rejects multimodal image_url fields',
      'Must use Mahi Engine dual-vision prompt synthesis for reference image guidance',
      'Strict keyword filter on celebrity and IP names'
    ]
  },

  // 4. ByteDance: Seedream 5.0 Pro
  'bytedance-seed/seedream-5.0-pro': {
    id: 'bytedance-seed/seedream-5.0-pro',
    displayName: 'Seedream 5.0 Pro',
    aliases: [
      'bytedance-seed/seedream-5.0-pro',
      'bytedance-seed/seedream-5-0-pro',
      'bytedance-seed/seedream-4.5',
      'Seedream 5.0 Pro',
      'seedream-5.0-pro'
    ],
    providerModelId: 'bytedance-seed/seedream-5.0-pro',
    alternativeProviderIds: ['bytedance-seed/seedream-5-0-pro', 'bytedance-seed/seedream-4.5'],
    adapter: 'seedream',
    supportedModes: ['text-to-image', 'image-to-image'],
    supportsReferenceImages: true,
    maxReferenceImages: 1,
    supportsImageEditing: false,
    identityPreservationStrength: 'moderate',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' },
      { width: 1152, height: 864, ratio: '4:3' },
      { width: 864, height: 1152, ratio: '3:4' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Requires OpenRouter dedicated /api/v1/images endpoint (404 on /chat/completions)',
      'OpenRouter slug periodically alternates between 5.0-pro, 5-0-pro and 4.5'
    ]
  },

  // 5. Meta: Muse Image
  'meta/muse-image': {
    id: 'meta/muse-image',
    displayName: 'Meta: Muse Image',
    aliases: [
      'meta/muse-image',
      'Meta: Muse Image',
      'muse-image'
    ],
    providerModelId: 'meta/muse-image',
    alternativeProviderIds: [],
    adapter: 'textOnly',
    supportedModes: ['text-to-image'],
    supportsReferenceImages: false,
    maxReferenceImages: 0,
    supportsImageEditing: false,
    identityPreservationStrength: 'none',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Text-to-image only; multimodal image inputs are rejected by provider'
    ]
  },

  // 6. Google: Nano Banana 2 (Gemini 3.1 Flash Image)
  'google/gemini-3.1-flash-image-preview': {
    id: 'google/gemini-3.1-flash-image-preview',
    displayName: 'Nano Banana 2 (Gemini 3.1 Flash Image)',
    aliases: [
      'google/gemini-3.1-flash-image-preview',
      'google/nano-banana-2',
      'Nano Banana 2 (Gemini 3.1 Flash Image)',
      'Nano Banana 2',
      'google/gemini-2.5-flash-image',
      'gemini-3.1-flash-image'
    ],
    providerModelId: 'google/gemini-3.1-flash-image-preview',
    alternativeProviderIds: ['google/gemini-2.5-flash-image'],
    adapter: 'gemini',
    supportedModes: ['text-to-image', 'image-to-image', 'precise-edit'],
    supportsReferenceImages: true,
    maxReferenceImages: 2,
    supportsImageEditing: true,
    identityPreservationStrength: 'high',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Optimized for ultra-fast drafting and interactive editing'
    ]
  },

  // Precise Edit & Generation Model: FLUX.2 Flex (Dedicated inpainting & identity-preserving editing)
  'black-forest-labs/flux.2-flex': {
    id: 'black-forest-labs/flux.2-flex',
    displayName: 'FLUX.2 Flex',
    aliases: [
      'black-forest-labs/flux.2-flex',
      'FLUX.2 Flex',
      'flux.2-flex',
      'flux-flex',
      'flex'
    ],
    providerModelId: 'black-forest-labs/flux.2-flex',
    alternativeProviderIds: [],
    adapter: 'flux',
    supportedModes: ['text-to-image', 'image-to-image', 'precise-edit'],
    supportsReferenceImages: true,
    maxReferenceImages: 4,
    supportsImageEditing: true,
    identityPreservationStrength: 'high',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Balanced between rendering fidelity and turnaround latency'
    ]
  },

  // Supplementary: Seedream 5.5 (Dedicated Precise Edit + Reference Image Editing Model)
  'bytedance-seed/seedream-5-5': {
    id: 'bytedance-seed/seedream-5-5',
    displayName: 'Seedream 5.5',
    aliases: [
      'bytedance-seed/seedream-5-5',
      'bytedance-seed/seedream-5.5',
      'Seedream 5.5',
      'seedream-5-5',
      'seedream-5.5'
    ],
    providerModelId: 'bytedance-seed/seedream-5-5',
    alternativeProviderIds: ['bytedance-seed/seedream-5.0-pro'],
    adapter: 'seedream',
    supportedModes: ['text-to-image', 'image-to-image', 'precise-edit'],
    supportsReferenceImages: true,
    maxReferenceImages: 10,
    supportsImageEditing: true,
    identityPreservationStrength: 'moderate',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' },
      { width: 1344, height: 768, ratio: '16:9' },
      { width: 768, height: 1344, ratio: '9:16' },
      { width: 1152, height: 864, ratio: '4:3' },
      { width: 864, height: 1152, ratio: '3:4' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Requires OpenRouter dedicated /api/v1/images endpoint',
      'Source image and reference images passed via input_references array'
    ]
  },

  // Deprecated: Krea K3 Edit (Replaced by FLUX.2 Flex due to upstream timeouts)
  'krea/k3-edit': {
    id: 'krea/k3-edit',
    displayName: 'Krea K3 Edit (Deprecated)',
    aliases: [
      'krea/k3-edit',
      'Krea K3 Edit',
      'k3-edit'
    ],
    providerModelId: 'krea/k3-edit',
    alternativeProviderIds: ['black-forest-labs/flux.2-flex'],
    adapter: 'flux',
    supportedModes: [],
    supportsReferenceImages: false,
    maxReferenceImages: 0,
    supportsImageEditing: false,
    identityPreservationStrength: 'none',
    deprecated: true,
    supportedAspectRatios: ['1:1'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' }
    ],
    outputFormat: 'b64_json',
    knownLimitations: [
      'Deprecated: Replaced by black-forest-labs/flux.2-flex'
    ]
  },

  // Supplementary: Recraft V3 (Vector Studio Model)
  'recraft/recraft-v3': {
    id: 'recraft/recraft-v3',
    displayName: 'Recraft V3',
    aliases: [
      'recraft/recraft-v3',
      'Recraft V3',
      'recraft-v3'
    ],
    providerModelId: 'recraft/recraft-v3',
    alternativeProviderIds: ['openai/gpt-image-2.5-sunburst'],
    adapter: 'textOnly',
    supportedModes: ['text-to-image'],
    supportsReferenceImages: true,
    maxReferenceImages: 1,
    supportsImageEditing: false,
    identityPreservationStrength: 'none',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    supportedResolutions: [
      { width: 1024, height: 1024, ratio: '1:1' }
    ],
    outputFormat: 'url',
    knownLimitations: [
      'Specialized in graphic vector assets'
    ]
  }
};

/**
 * Builds alias and lookup maps for O(1) resolution
 */
const ALIAS_LOOKUP_MAP = new Map();
const DISPLAY_NAME_TO_ID_MAP = {};
const ID_TO_DISPLAY_NAME_MAP = {};
const OPENROUTER_MODEL_MAP = {};

for (const [modelId, config] of Object.entries(IMAGE_MODEL_REGISTRY)) {
  ALIAS_LOOKUP_MAP.set(modelId.toLowerCase(), config);
  DISPLAY_NAME_TO_ID_MAP[config.displayName] = modelId;
  ID_TO_DISPLAY_NAME_MAP[modelId] = config.displayName;
  OPENROUTER_MODEL_MAP[modelId] = modelId;

  if (Array.isArray(config.aliases)) {
    for (const alias of config.aliases) {
      ALIAS_LOOKUP_MAP.set(alias.toLowerCase(), config);
      OPENROUTER_MODEL_MAP[alias] = modelId;
      if (!DISPLAY_NAME_TO_ID_MAP[alias]) {
        DISPLAY_NAME_TO_ID_MAP[alias] = modelId;
      }
    }
  }
}

// Backwards-compatible exports matching imageController.js
export const OPENROUTER_IMAGE_MODEL_MAP = OPENROUTER_MODEL_MAP;
export const MODEL_NAME_TO_ID = DISPLAY_NAME_TO_ID_MAP;
export const MODEL_ID_TO_DISPLAY_NAME = ID_TO_DISPLAY_NAME_MAP;

/**
 * Resolves any raw model identifier or display name into its canonical registry configuration.
 * If rawModel is missing or unknown, safely falls back to 'openai/gpt-image-2.5-sunburst'.
 */
export function getImageModelConfig(rawModel) {
  if (rawModel && typeof rawModel === 'object' && rawModel.id) {
    return rawModel;
  }
  if (!rawModel || typeof rawModel !== 'string') {
    return IMAGE_MODEL_REGISTRY['openai/gpt-image-2.5-sunburst'];
  }
  const clean = rawModel.trim();
  const lower = clean.toLowerCase();

  if (ALIAS_LOOKUP_MAP.has(lower)) {
    return ALIAS_LOOKUP_MAP.get(lower);
  }

  // Exact key match
  if (IMAGE_MODEL_REGISTRY[clean]) {
    return IMAGE_MODEL_REGISTRY[clean];
  }

  // If model contains provider slash, create a dynamic safe config
  if (clean.includes('/')) {
    return {
      id: clean,
      displayName: clean,
      aliases: [clean],
      providerModelId: clean,
      alternativeProviderIds: [],
      adapter: clean.startsWith('google/') ? 'gemini' : (clean.startsWith('black-forest-labs/') ? 'flux' : 'openai'),
      supportedModes: ['text-to-image', 'image-to-image'],
      supportsReferenceImages: true,
      maxReferenceImages: 2,
      supportsImageEditing: true,
      identityPreservationStrength: 'moderate',
      supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'],
      supportedResolutions: [{ width: 1024, height: 1024, ratio: '1:1' }],
      outputFormat: 'url',
      knownLimitations: []
    };
  }

  return IMAGE_MODEL_REGISTRY['openai/gpt-image-2.5-sunburst'];
}

/**
 * Resolves any incoming model identifier (ID, alias, or display name)
 * to an OpenRouter Dedicated Image Model ID.
 */
export function resolveOpenRouterImageModel(rawModel) {
  const config = getImageModelConfig(rawModel);
  return config.id;
}

/**
 * Resolves a model identifier to its display name for UI reporting.
 */
export function resolveModelDisplayName(rawModel) {
  const config = getImageModelConfig(rawModel);
  return config.displayName || config.id;
}

/**
 * Checks whether a given model natively supports multimodal reference/source images.
 */
export function isModelMultimodal(rawModel) {
  const config = getImageModelConfig(rawModel);
  return Boolean(config.supportsReferenceImages);
}

/**
 * Checks whether a given model natively supports image editing / precise edit.
 */
export function supportsPreciseEdit(rawModel) {
  const config = getImageModelConfig(rawModel);
  return Boolean(config.supportsImageEditing);
}

/**
 * Returns the adapter key for a given model ('gemini', 'openai', 'flux', 'seedream', 'textOnly')
 */
export function getAdapterNameForModel(rawModel) {
  const config = getImageModelConfig(rawModel);
  return config.adapter || 'openai';
}

/**
 * Returns list of verified reference-capable models from the registry.
 */
export function getReferenceCapableModels() {
  return Object.values(IMAGE_MODEL_REGISTRY)
    .filter(m => m.supportsReferenceImages)
    .map(m => ({
      id: m.id,
      displayName: m.displayName,
      identityStrength: m.identityPreservationStrength || 'moderate',
      maxReferences: m.maxReferenceImages || 1
    }));
}

export default {
  IMAGE_MODEL_REGISTRY,
  OPENROUTER_IMAGE_MODEL_MAP,
  MODEL_NAME_TO_ID,
  MODEL_ID_TO_DISPLAY_NAME,
  getImageModelConfig,
  resolveOpenRouterImageModel,
  resolveModelDisplayName,
  isModelMultimodal,
  supportsPreciseEdit,
  getAdapterNameForModel,
  getReferenceCapableModels
};
