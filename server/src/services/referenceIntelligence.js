import axios from 'axios';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import {
  IMAGE_MODEL_REGISTRY,
  getImageModelConfig,
  getReferenceCapableModels
} from '../config/imageModelRegistry.js';
import { optimizeBase64DataUrl } from '../utils/imageOptimizer.js';

/**
 * MESTRIO AI — Reference Image Intelligence & Identity Conditioning (Stages B & C)
 * 
 * 1. Hybrid Reference Role Classification (face_character, product_object, style, composition, clothing, environment).
 * 2. Multimodal Conditioning with explicit identity/fidelity anchors.
 * 3. Smart routing for 'Auto' mode when reference images are attached.
 */

export const REFERENCE_ROLES = {
  FACE_CHARACTER: 'face_character',
  PRODUCT_OBJECT: 'product_object',
  STYLE: 'style',
  COMPOSITION: 'composition',
  CLOTHING_MATERIAL: 'clothing_material',
  ENVIRONMENT: 'environment'
};

export const REFERENCE_ROLE_CONFIGS = {
  [REFERENCE_ROLES.FACE_CHARACTER]: {
    label: 'Face / Character Reference',
    mustPreserve: 'Exact facial structure, facial geometry, facial features, eyes, nose, lips, jawline, skin tone, hairstyle, facial hair, and biometric likeness',
    canChange: 'Clothing, posture, lighting atmosphere, background setting, camera perspective',
    anchoringInstruction: 'IDENTITY & PHOTOMETRIC INTEGRATION: Extract ONLY the facial identity from the reference image — the exact facial geometry, facial features, bone structure, eye shape, nose structure, lips, jawline, skin tone, hair style and color, and biometric likeness. DISCARD the reference photo\'s original lighting, color cast, indoor/outdoor ambiance, flash, shadows, and background entirely. The subject\'s face, neck, and all exposed skin must be naturally RELIT to match the target scene\'s environment: match the key light direction, color temperature (warm/cool/neutral), rim light, ambient fill, specular highlights on skin, and contact shadows so that the face and body appear to be illuminated by the same single unified light source. Achieve seamless head-to-body integration with consistent skin tone across face, neck, shoulders, and hands. Maintain proportional head-to-body scale and a natural neck-to-collar transition. Place this exact person into the requested scene.'
  },
  [REFERENCE_ROLES.PRODUCT_OBJECT]: {
    label: 'Product / Object Reference',
    mustPreserve: 'Exact product shape, silhouette, proportions, branding, label text, and industrial geometry',
    canChange: 'Surrounding environment, placement surface, lighting setup, camera angle',
    anchoringInstruction: 'PRODUCT FIDELITY & PHOTOMETRIC INTEGRATION: Extract the exact product shape, silhouette, proportions, industrial geometry, branding, label text, and material finish from the reference image. DISCARD the reference photo\'s original lighting, studio setup, background, and color cast. Relight the product naturally within the requested environment: match surface reflections, specular highlights, material sheen, shadow direction, and ambient color temperature to the new scene lighting. Preserve product geometry and design integrity while achieving photorealistic integration with the target environment.'
  },
  [REFERENCE_ROLES.STYLE]: {
    label: 'Style / Palette Reference',
    mustPreserve: 'Artistic medium, color palette, lighting mood, brushwork, and rendering texture',
    canChange: 'Subject matter, scene composition, individual elements',
    anchoringInstruction: 'STYLE & PALETTE TRANSFER: Emulate the artistic style, color grading, lighting atmosphere, and visual rendering technique of the reference image without copying its literal subject.'
  },
  [REFERENCE_ROLES.COMPOSITION]: {
    label: 'Composition / Pose Reference',
    mustPreserve: 'Camera angle, perspective framing, spatial layout, and character pose',
    canChange: 'Subject identity, colors, textures, details',
    anchoringInstruction: 'COMPOSITION & POSE MATCH: Adopt the exact camera framing, perspective, spatial arrangement, and pose established in the reference image.'
  },
  [REFERENCE_ROLES.CLOTHING_MATERIAL]: {
    label: 'Clothing / Material Reference',
    mustPreserve: 'Garment cut, fabric weave, pattern, and material finish',
    canChange: 'Person wearing it, setting, pose',
    anchoringInstruction: 'MATERIAL & ATTIRE PRESERVATION: Extract the exact fabric texture, weave pattern, garment cut, drape, and material finish from the reference image. DISCARD the reference photo\'s original lighting and color cast. When placed on a subject in the new scene, the garment must be naturally relit to match the scene\'s lighting direction and color temperature, showing accurate fabric sheen, shadow folds, and specular response appropriate to the material type (matte, silk, leather, denim, etc.).'
  },
  [REFERENCE_ROLES.ENVIRONMENT]: {
    label: 'Environment / Background Reference',
    mustPreserve: 'Architectural elements, spatial environment, and background landscape',
    canChange: 'Foreground characters, dynamic lighting, weather elements',
    anchoringInstruction: 'ENVIRONMENTAL CONSISTENCY: Set the scene within the architectural setting and background environment established by the reference image.'
  }
};

const ROLE_PROMPT_KEYWORDS = {
  [REFERENCE_ROLES.FACE_CHARACTER]: [
    'face', 'person', 'character', 'man', 'woman', 'girl', 'boy', 'guy',
    'lady', 'model', 'me', 'myself', 'him', 'her', 'portrait', 'headshot',
    'selfie', 'actor', 'cosplay', 'avatar', 'same person', 'this person',
    'identical face', 'look like', 'resemble', 'likeness'
  ],
  [REFERENCE_ROLES.PRODUCT_OBJECT]: [
    'product', 'bottle', 'can', 'sneakers', 'shoe', 'shoes', 'watch', 'smartwatch',
    'phone', 'laptop', 'car', 'vehicle', 'package', 'box', 'mug', 'cup',
    'gadget', 'chair', 'furniture', 'item', 'merchandise', 'cosmetic',
    'perfume', 'beverage', 'device', 'bag', 'backpack'
  ],
  [REFERENCE_ROLES.STYLE]: [
    'style', 'aesthetic', 'palette', 'mood', 'vibe', 'artistic style',
    'look', 'artstyle', 'like this', 'inspired by', 'lighting style',
    'color scheme', 'same style', 'visual tone'
  ],
  [REFERENCE_ROLES.COMPOSITION]: [
    'pose', 'composition', 'framing', 'camera angle', 'perspective',
    'wide shot', 'close up', 'layout', 'arrangement', 'same angle',
    'dynamic pose', 'viewpoint'
  ],
  [REFERENCE_ROLES.CLOTHING_MATERIAL]: [
    'dress', 'suit', 'jacket', 'outfit', 'shirt', 'pants', 'fabric',
    'material', 'wearing', 'clothes', 'garment', 'leather', 'silk',
    'denim', 'attire', 'costume'
  ],
  [REFERENCE_ROLES.ENVIRONMENT]: [
    'room', 'background', 'landscape', 'interior', 'building', 'street',
    'mountain', 'office', 'house', 'forest', 'city', 'setting', 'scenery',
    'place', 'location', 'backdrop', 'scenic', 'architecture'
  ]
};

/**
 * Fast intent heuristic classifier that analyzes the user's prompt
 * to determine the primary role of the attached reference image(s).
 */
export function classifyReferenceRoleByPrompt(prompt = '') {
  const text = (prompt || '').toLowerCase();

  // 1. Check face / character cues first (highest sensitivity for identity lock)
  for (const kw of ROLE_PROMPT_KEYWORDS[REFERENCE_ROLES.FACE_CHARACTER]) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      return {
        role: REFERENCE_ROLES.FACE_CHARACTER,
        confidence: 0.88,
        source: 'prompt_heuristics',
        config: REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.FACE_CHARACTER]
      };
    }
  }

  // 2. Check product / object cues
  for (const kw of ROLE_PROMPT_KEYWORDS[REFERENCE_ROLES.PRODUCT_OBJECT]) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      return {
        role: REFERENCE_ROLES.PRODUCT_OBJECT,
        confidence: 0.85,
        source: 'prompt_heuristics',
        config: REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.PRODUCT_OBJECT]
      };
    }
  }

  // 3. Check style / palette cues
  for (const kw of ROLE_PROMPT_KEYWORDS[REFERENCE_ROLES.STYLE]) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      return {
        role: REFERENCE_ROLES.STYLE,
        confidence: 0.82,
        source: 'prompt_heuristics',
        config: REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.STYLE]
      };
    }
  }

  // 4. Check clothing / material
  for (const kw of ROLE_PROMPT_KEYWORDS[REFERENCE_ROLES.CLOTHING_MATERIAL]) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      return {
        role: REFERENCE_ROLES.CLOTHING_MATERIAL,
        confidence: 0.80,
        source: 'prompt_heuristics',
        config: REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.CLOTHING_MATERIAL]
      };
    }
  }

  // 5. Check composition / pose
  for (const kw of ROLE_PROMPT_KEYWORDS[REFERENCE_ROLES.COMPOSITION]) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      return {
        role: REFERENCE_ROLES.COMPOSITION,
        confidence: 0.78,
        source: 'prompt_heuristics',
        config: REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.COMPOSITION]
      };
    }
  }

  // 6. Check environment
  for (const kw of ROLE_PROMPT_KEYWORDS[REFERENCE_ROLES.ENVIRONMENT]) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      return {
        role: REFERENCE_ROLES.ENVIRONMENT,
        confidence: 0.75,
        source: 'prompt_heuristics',
        config: REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.ENVIRONMENT]
      };
    }
  }

  // Default fallback if ambiguous: Treat as face/character if prompt mentions people or portrait, else style
  return {
    role: REFERENCE_ROLES.STYLE,
    confidence: 0.65,
    source: 'prompt_heuristics_default',
    config: REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.STYLE]
  };
}

/**
 * Ultra-fast low-cost vision classifier via OpenRouter (gemini-2.5-flash-lite)
 * for ambiguous reference conditioning. Falls back cleanly if offline.
 */
export async function classifyReferenceImageWithVision(referenceImageUrl, prompt = '', options = {}) {
  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || config.openrouter?.apiKey;
  const requestId = options.requestId || 'ref_vision';

  if (!apiKey || !referenceImageUrl || options.mock || options.offline) {
    return classifyReferenceRoleByPrompt(prompt);
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a high-speed computer vision classifier. Analyze the attached reference image and user prompt. Classify the primary role of this reference image into exactly one category:
- face_character: if the image contains a person or character face that should maintain identity
- product_object: if the image contains a distinct product, vehicle, or manufactured item
- style: if the image primarily serves as a visual style, color palette, or artistic mood guide
- composition: if the image serves as a camera framing or pose reference
- clothing_material: if the image focuses on an outfit, fabric, or texture
- environment: if the image is a landscape, room, or setting

Also classify the reference photo's predominant lighting condition as one of: "indoor_flat", "outdoor_natural", "studio_lit", "backlit", "unknown".

Return ONLY a valid JSON object matching this schema:
{"role":"face_character"|"product_object"|"style"|"composition"|"clothing_material"|"environment","confidence":0.95,"reference_lighting":"indoor_flat"}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `User Prompt: "${prompt}"` },
              { type: 'image_url', image_url: { url: referenceImageUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.openrouter?.siteUrl || 'http://localhost:5001',
          'X-Title': config.openrouter?.siteName || 'Mestrio AI'
        },
        timeout: 5000 // 5s ultra-fast timeout safeguard
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content?.trim();
    if (rawContent) {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const detectedRole = parsed.role;
        if (REFERENCE_ROLE_CONFIGS[detectedRole]) {
          logger.info('Reference vision classifier determined role', {
            requestId,
            role: detectedRole,
            confidence: parsed.confidence || 0.9
          });
          return {
            role: detectedRole,
            confidence: parsed.confidence || 0.9,
            source: 'vision_classifier',
            referenceLighting: parsed.reference_lighting || 'unknown',
            config: REFERENCE_ROLE_CONFIGS[detectedRole]
          };
        }
      }
    }
  } catch (err) {
    logger.debug('Vision classifier failed or timed out, using prompt heuristic', {
      requestId,
      error: err.message
    });
  }

  return classifyReferenceRoleByPrompt(prompt);
}

/**
 * Prompt-aware Smart Routing for Auto Mode with Reference Images.
 * Instead of always routing to a single hardcoded model, this selects
 * the best identity-capable model based on the prompt's style signal.
 */
export function resolveAutoModelForReferences(prompt = '', referenceImages = [], options = {}) {
  const hasRefs = Array.isArray(referenceImages) && referenceImages.length > 0;

  if (!hasRefs) {
    // Fall back to text-only auto routing
    return null;
  }

  const text = (prompt || '').toLowerCase();

  // Anime / cartoon with reference → GPT Image 2.5 (better stylized identity)
  const cartoonAnimeRegex = /\b(anime|manga|cartoon|chibi|pixar|disney|comic|illustration|animated|drawing|sketch|ghibli|vector\s*art)\b/i;
  if (cartoonAnimeRegex.test(text)) {
    const cfg = getImageModelConfig('openai/gpt-image-2.5-sunburst');
    return {
      model: cfg.id,
      modelName: cfg.displayName,
      modelConfig: cfg,
      isAuto: true,
      routedReason: 'Stylized identity conditioning for anime/cartoon with reference',
      identityPreservationStrength: cfg.identityPreservationStrength || 'moderate'
    };
  }

  // Photorealistic / DSLR / fashion / editorial with reference → Seedream 5.0 Pro
  const photoRegex = /\b(photo|photography|photorealistic|hyperrealistic|realistic|dslr|raw\s*photo|candid|cinematic|film\s*grain|35mm|fashion|editorial|outdoor|indoor|studio\s*shoot)\b/i;
  if (photoRegex.test(text)) {
    const cfg = getImageModelConfig('bytedance-seed/seedream-5.0-pro');
    return {
      model: cfg.id,
      modelName: cfg.displayName,
      modelConfig: cfg,
      isAuto: true,
      routedReason: 'Photorealistic identity conditioning with reference',
      identityPreservationStrength: cfg.identityPreservationStrength || 'moderate'
    };
  }

  // Default with reference → Gemini 3 Pro Image (high identity, multimodal)
  const targetModelConfig = getImageModelConfig('google/gemini-3-pro-image');
  return {
    model: targetModelConfig.id,
    modelName: targetModelConfig.displayName,
    modelConfig: targetModelConfig,
    isAuto: true,
    routedReason: 'High-identity multimodal conditioning for reference images',
    identityPreservationStrength: targetModelConfig.identityPreservationStrength || 'high'
  };
}

/**
 * Builds multimodal conditioning instructions and packages reference images.
 * Returns anchoring instructions, role classification, and verified reference images.
 */
export async function buildReferenceConditioning(rawReferenceImages = [], prompt = '', options = {}) {
  const refs = Array.isArray(rawReferenceImages)
    ? rawReferenceImages.filter(Boolean)
    : (rawReferenceImages ? [rawReferenceImages] : []);

  if (refs.length === 0) {
    return {
      hasReferences: false,
      role: null,
      anchoringInstruction: '',
      referenceImages: [],
      mustPreserve: '',
      canChange: ''
    };
  }

  // 1. Classify primary role
  const firstRef = refs[0];
  let roleClassification;

  if (options.useVision && typeof firstRef === 'string' && firstRef.startsWith('data:image/')) {
    roleClassification = await classifyReferenceImageWithVision(firstRef, prompt, options);
  } else {
    roleClassification = classifyReferenceRoleByPrompt(prompt);
  }

  const roleConfig = roleClassification.config || REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.STYLE];

  logger.info('Reference intelligence analyzed conditioning', {
    role: roleClassification.role,
    confidence: roleClassification.confidence,
    source: roleClassification.source,
    referenceCount: refs.length
  });

  return {
    hasReferences: true,
    role: roleClassification.role,
    roleLabel: roleConfig.label,
    confidence: roleClassification.confidence,
    source: roleClassification.source,
    anchoringInstruction: roleConfig.anchoringInstruction,
    mustPreserve: roleConfig.mustPreserve,
    canChange: roleConfig.canChange,
    referenceImages: refs,
    referenceLighting: roleClassification.referenceLighting || 'unknown'
  };
}

export default {
  REFERENCE_ROLES,
  REFERENCE_ROLE_CONFIGS,
  classifyReferenceRoleByPrompt,
  classifyReferenceImageWithVision,
  resolveAutoModelForReferences,
  buildReferenceConditioning
};
