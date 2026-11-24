import axios from 'axios';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { optimizeBase64DataUrl } from '../utils/imageOptimizer.js';
import { classifyReferenceRoleByPrompt, REFERENCE_ROLES } from './referenceIntelligence.js';

/**
 * MESTRIO AI — Precise Edit Planner & Preservation Engine (Production Grade)
 * 
 * Logically separates Precise Edit from Generate Image.
 * Decomposes user edit requests into:
 * 1. requestedModification (exact localized delta)
 * 2. targetSubjectOrRegion (what is allowed to change)
 * 3. elementsToPreserve (facial identity, anatomy, background, lighting, camera angle, style)
 * 4. categories (all detected categories with conflict resolution)
 * 5. referenceRole (role-guided reference conditioning)
 * 
 * Constructs structured editing directives constraining diffusion models to modify ONLY
 * the target elements while strictly preserving all other scene characteristics without contradictions.
 */

export const EDIT_CATEGORIES = {
  CLOTHING_CHANGE: 'clothing_change',
  BACKGROUND_CHANGE: 'background_change',
  OBJECT_MODIFICATION: 'object_modification',
  PRODUCT_EDITING: 'product_editing',
  PORTRAIT_EDITING: 'portrait_editing',
  COLOR_ADJUSTMENT: 'color_adjustment',
  LIGHTING_ADJUSTMENT: 'lighting_adjustment',
  STYLE_TRANSFER: 'style_transfer',
  GENERAL_EDIT: 'general_edit'
};

const CATEGORY_PATTERNS = [
  {
    category: EDIT_CATEGORIES.COLOR_ADJUSTMENT,
    regex: /\b(color|recolor|tint|dye|hair color|dress color|eye color|turn .* (red|blue|green|black|white|yellow|pink|purple|blonde)|change .* to (emerald|red|blue|green|black|white|yellow|pink|purple|blonde|crimson|golden)|make .* (red|blue|green|black|white|yellow|pink|purple|blonde))\b/i
  },
  {
    category: EDIT_CATEGORIES.BACKGROUND_CHANGE,
    regex: /\b(background|backdrop|setting|scenery|environment|behind|sky|room|office|beach|forest|street|city|mountains|studio background|place in|move to|transport to|replace background|change background)\b/i
  },
  {
    category: EDIT_CATEGORIES.CLOTHING_CHANGE,
    regex: /\b(wear|wearing|jacket|coat|shirt|t-shirt|suit|dress|pants|trousers|jeans|skirt|shoes|boots|sneakers|hat|cap|tie|scarf|glasses|sunglasses|outfit|attire|costume|clothes|clothing|uniform|hoodie|sweater|blazer|put on|change clothes)\b/i
  },
  {
    category: EDIT_CATEGORIES.LIGHTING_ADJUSTMENT,
    regex: /\b(lighting|light|illumination|shadows?|golden hour|neon glow|cinematic lighting|studio light|spotlight|sunlight|dramatic shadows|backlit|ambient)\b/i
  },
  {
    category: EDIT_CATEGORIES.PRODUCT_EDITING,
    regex: /\b(product|bottle|can|label|packaging|box|brand|logo|device|cosmetic|perfume|commercial|mockup|beverage|gadget|industrial|merchandise)\b/i
  },
  {
    category: EDIT_CATEGORIES.PORTRAIT_EDITING,
    regex: /\b(smile|smiling|expression|retouch|skin smooth|blemish|wrinkles?|makeup|lipstick|eyeshadow|teeth|eyebrows?|haircut|hairstyle|beard|mustache|eyes?|gaze|facial feature)\b/i
  },
  {
    category: EDIT_CATEGORIES.OBJECT_MODIFICATION,
    regex: /\b(replace|swap|add|remove|delete|eliminate|take off|take away|hold|holding|carry|carrying|put|insert|substitute|cup|mug|bottle|phone|watch|bag|backpack|car|laptop|guitar|weapon)\b/i
  },
  {
    category: EDIT_CATEGORIES.STYLE_TRANSFER,
    regex: /\b(turn into|convert to|make it look like|anime style|cartoon style|oil painting|3d render|watercolor|sketch)\b/i
  }
];

/**
 * Checks if the user explicitly requested a face or character identity change.
 */
export function isFaceReplacementRequested(prompt = '') {
  const lower = (prompt || '').toLowerCase();
  const faceSwapRegex = /\b(change face|swap face|different face|replace face|different person|change person|new person|replace person|different man|different woman|new face|change character)\b/i;
  return faceSwapRegex.test(lower);
}

/**
 * Decomposes an edit instruction prompt into structured components:
 * - category (primary category)
 * - categories (all detected categories for multi-intent instructions)
 * - requestedModification
 * - targetSubjectOrRegion
 * - elementsToPreserve (conflict-resolved)
 * - isFaceReplacementRequested
 * - referenceRole (classified role if reference guides present)
 */
export function decomposeEditInstruction(instructionPrompt = '', options = {}) {
  const trimmed = (instructionPrompt || '').trim();
  const lower = trimmed.toLowerCase();

  // 1. Identify all matching categories to support multi-instruction edits
  const isBackgroundOnly = /\b(background|backdrop|setting|scenery|environment|behind|sky|room|office|beach|forest|street|city|mountains|studio background)\b/i.test(lower);
  const matchedCategories = [];
  for (const { category: cat, regex } of CATEGORY_PATTERNS) {
    if (regex.test(lower)) {
      // Disambiguation: "replace background" should not trigger object modification unless a real object is also mentioned
      if (cat === EDIT_CATEGORIES.OBJECT_MODIFICATION && isBackgroundOnly && !/\b(cup|mug|bottle|phone|watch|bag|backpack|car|laptop|guitar|weapon)\b/i.test(lower)) {
        continue;
      }
      // Disambiguation: "keep ... style" is style preservation, not style transfer
      if (cat === EDIT_CATEGORIES.STYLE_TRANSFER && /\b(keep|preserve|maintain|retain)\b.*\b(style|medium|cartoon|anime|painting|illustration)\b/i.test(lower)) {
        continue;
      }
      if (!matchedCategories.includes(cat)) {
        matchedCategories.push(cat);
      }
    }
  }

  if (matchedCategories.length === 0) {
    matchedCategories.push(EDIT_CATEGORIES.GENERAL_EDIT);
  }

  const primaryCategory = matchedCategories[0];

  // 2. Determine if facial identity replacement is explicitly requested
  const faceReplacement = isFaceReplacementRequested(trimmed);

  // 3. Extract target subject/region based on primary category
  let targetRegion = 'specified localized region';
  switch (primaryCategory) {
    case EDIT_CATEGORIES.CLOTHING_CHANGE:
      targetRegion = 'attire / clothing';
      break;
    case EDIT_CATEGORIES.BACKGROUND_CHANGE:
      targetRegion = 'background setting / environment';
      break;
    case EDIT_CATEGORIES.COLOR_ADJUSTMENT:
      targetRegion = 'specified surface color / palette';
      break;
    case EDIT_CATEGORIES.OBJECT_MODIFICATION:
      targetRegion = 'target object / item';
      break;
    case EDIT_CATEGORIES.PRODUCT_EDITING:
      targetRegion = 'product item / packaging / branding';
      break;
    case EDIT_CATEGORIES.PORTRAIT_EDITING:
      targetRegion = 'facial expression / portrait retouching';
      break;
    case EDIT_CATEGORIES.LIGHTING_ADJUSTMENT:
      targetRegion = 'scene illumination and shadows';
      break;
    case EDIT_CATEGORIES.STYLE_TRANSFER:
      targetRegion = 'artistic style and rendering medium';
      break;
    default:
      targetRegion = 'specified localized region';
      break;
  }

  // 4. Construct conflict-free elementsToPreserve
  let elementsToPreserve = [
    'overall scene composition',
    'camera angle and perspective'
  ];

  // Only preserve lighting if lighting adjustment wasn't requested
  if (!matchedCategories.includes(EDIT_CATEGORIES.LIGHTING_ADJUSTMENT)) {
    elementsToPreserve.push('ambient lighting direction and shadows');
  }

  // Only preserve style if style transfer wasn't requested
  if (!matchedCategories.includes(EDIT_CATEGORIES.STYLE_TRANSFER)) {
    elementsToPreserve.push('existing artistic style and medium');
  }

  // Category-specific preservation elements
  if (primaryCategory === EDIT_CATEGORIES.BACKGROUND_CHANGE || matchedCategories.includes(EDIT_CATEGORIES.BACKGROUND_CHANGE)) {
    elementsToPreserve.push(
      'foreground subjects and characters',
      'facial likeness and identity',
      'clothing and accessories',
      'subject proportions and positioning'
    );
  }

  if (primaryCategory === EDIT_CATEGORIES.CLOTHING_CHANGE || matchedCategories.includes(EDIT_CATEGORIES.CLOTHING_CHANGE)) {
    elementsToPreserve.push(
      'character facial identity and biometric structure',
      'hairstyle and facial hair',
      'skin tone and body anatomy'
    );
    if (!matchedCategories.includes(EDIT_CATEGORIES.BACKGROUND_CHANGE)) {
      elementsToPreserve.push('background environment');
    }
  }

  if (primaryCategory === EDIT_CATEGORIES.OBJECT_MODIFICATION || matchedCategories.includes(EDIT_CATEGORIES.OBJECT_MODIFICATION)) {
    elementsToPreserve.push(
      'character facial identity and likeness',
      'body posture and anatomy'
    );
    if (!matchedCategories.includes(EDIT_CATEGORIES.BACKGROUND_CHANGE)) {
      elementsToPreserve.push('surrounding background environment');
    }
  }

  if (primaryCategory === EDIT_CATEGORIES.COLOR_ADJUSTMENT || matchedCategories.includes(EDIT_CATEGORIES.COLOR_ADJUSTMENT)) {
    elementsToPreserve.push(
      'underlying object geometry and texture',
      'subject facial identity',
      'scene composition and lighting structure'
    );
  }

  if (primaryCategory === EDIT_CATEGORIES.LIGHTING_ADJUSTMENT || matchedCategories.includes(EDIT_CATEGORIES.LIGHTING_ADJUSTMENT)) {
    elementsToPreserve.push(
      'subject identity and morphology',
      'clothing design',
      'spatial composition'
    );
  }

  if (primaryCategory === EDIT_CATEGORIES.PRODUCT_EDITING || matchedCategories.includes(EDIT_CATEGORIES.PRODUCT_EDITING)) {
    elementsToPreserve.push(
      'product silhouette and core industrial geometry',
      'scene composition'
    );
  }

  if (primaryCategory === EDIT_CATEGORIES.PORTRAIT_EDITING || matchedCategories.includes(EDIT_CATEGORIES.PORTRAIT_EDITING)) {
    elementsToPreserve.push(
      'subject bone structure and personal identity',
      'natural facial likeness and expression balance',
      'clothing and background setting'
    );
  }

  if (primaryCategory === EDIT_CATEGORIES.GENERAL_EDIT && !faceReplacement) {
    elementsToPreserve.push('subject facial identity and recognizable characteristics');
  }

  // Remove duplicates while maintaining order
  elementsToPreserve = Array.from(new Set(elementsToPreserve));

  // Filter out identity terms if face replacement was requested
  if (faceReplacement) {
    elementsToPreserve = elementsToPreserve.filter(
      e => !e.includes('facial identity') && !e.includes('facial likeness') && !e.includes('biometric')
    );
  }

  // 5. Classify reference guide role if present
  let referenceRole = null;
  const hasReferenceGuides = Boolean(options.hasReferenceGuides || (options.referenceImages && options.referenceImages.length > 0));
  if (hasReferenceGuides) {
    try {
      const roleResult = classifyReferenceRoleByPrompt(trimmed);
      referenceRole = roleResult?.role || REFERENCE_ROLES.STYLE;
    } catch (_) {
      referenceRole = REFERENCE_ROLES.STYLE;
    }
  }

  return {
    category: primaryCategory,
    categories: matchedCategories,
    requestedModification: trimmed,
    targetSubjectOrRegion: targetRegion,
    elementsToPreserve,
    isFaceReplacementRequested: faceReplacement,
    hasReferenceGuides,
    referenceRole
  };
}

/**
 * Builds structured preservation directives for diffusion inpainting.
 */
export function buildPreservationDirectives(decomposition, options = {}) {
  const {
    category,
    categories = [],
    requestedModification,
    targetSubjectOrRegion,
    elementsToPreserve,
    isFaceReplacementRequested: faceReplacement,
    hasReferenceGuides,
    referenceRole
  } = decomposition;

  let directives = [];

  // Directive 1: Localized Edit Constraint
  directives.push(`LOCALIZED MODIFICATION ONLY: Apply the requested change exclusively to the ${targetSubjectOrRegion} ("${requestedModification}").`);

  // Directive 2: Identity Lock
  if (!faceReplacement) {
    directives.push('IDENTITY PRESERVATION: Strictly preserve the exact facial structure, eyes, nose, lips, jawline, skin tone, and biometric likeness of the person in the source image.');
  }

  // Directive 3: Compositional Integrity
  directives.push(`PRESERVE UNCHANGED: Keep ${elementsToPreserve.slice(0, 4).join(', ')} visually identical to the source canvas.`);

  // Directive 4: Role-guided reference integration if present
  if (hasReferenceGuides) {
    if (referenceRole === REFERENCE_ROLES.CLOTHING_MATERIAL) {
      directives.push('REFERENCE IMAGE GUIDANCE: Use attached reference image(s) exclusively as garment cut, fabric texture, and clothing styling cues; do not copy reference faces or replace the source subject.');
    } else if (referenceRole === REFERENCE_ROLES.PRODUCT_OBJECT) {
      directives.push('REFERENCE IMAGE GUIDANCE: Extract exact product shape, branding, and packaging details from the reference image(s); seamlessly integrate into the source scene.');
    } else if (referenceRole === REFERENCE_ROLES.ENVIRONMENT) {
      directives.push('REFERENCE IMAGE GUIDANCE: Use attached reference image(s) as the environmental and architectural background guide for the replacement.');
    } else {
      directives.push('REFERENCE IMAGE GUIDANCE: Use attached reference image(s) exclusively as style/asset cues for the modification; do not copy reference faces or replace the source subject.');
    }
  }

  return {
    directivesText: directives.join(' '),
    directivesList: directives,
    capabilityNotes: 'High-fidelity localized inpainting. Note: Probabilistic diffusion models may exhibit subtle micro-variations outside the modified region.'
  };
}

/**
 * High-level Precise Edit Planner.
 * Coordinates instruction decomposition, preservation planning, and synthesis prompt generation.
 */
export async function planPreciseEdit(instructionPrompt, options = {}) {
  const trimmedInstruction = (instructionPrompt || '').trim();
  const rawRefs = options.referenceImages || [];
  const hasReferenceGuides = Array.isArray(rawRefs) && rawRefs.length > 0;

  // 1. Decompose instruction
  const decomposition = decomposeEditInstruction(trimmedInstruction, {
    hasReferenceGuides,
    referenceImages: rawRefs
  });

  // 2. Build preservation directives
  const preservation = buildPreservationDirectives(decomposition, {
    quality: options.quality || 'Medium'
  });

  // 3. Formulate synthesis prompt combining user intent and preservation directives
  let synthesisPrompt = `${trimmedInstruction}. ${preservation.directivesText}`;

  logger.info('Precise Edit Planner generated preservation plan', {
    category: decomposition.category,
    categories: decomposition.categories,
    targetRegion: decomposition.targetSubjectOrRegion,
    facePreserved: !decomposition.isFaceReplacementRequested,
    hasReferences: hasReferenceGuides,
    referenceRole: decomposition.referenceRole
  });

  return {
    originalInstruction: trimmedInstruction,
    synthesisPrompt: synthesisPrompt.trim(),
    category: decomposition.category,
    categories: decomposition.categories,
    targetSubjectOrRegion: decomposition.targetSubjectOrRegion,
    elementsToPreserve: decomposition.elementsToPreserve,
    isFaceReplacementRequested: decomposition.isFaceReplacementRequested,
    preservationDirectives: preservation.directivesText,
    referenceRole: decomposition.referenceRole,
    capabilityNotes: preservation.capabilityNotes
  };
}

export default {
  EDIT_CATEGORIES,
  isFaceReplacementRequested,
  decomposeEditInstruction,
  buildPreservationDirectives,
  planPreciseEdit
};
