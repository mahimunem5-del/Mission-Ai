import axios from 'axios';
import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * MESTRIO AI — Prompt Intelligence Engine (Stage A)
 * 
 * Upgrades image prompts by understanding intent, composition, lighting, materials, and colors
 * without hallucinating unwanted subjects.
 * 
 * STRICT COMPLIANCE RULES:
 * 1. NEVER forces photorealism when the user requests anime, vector, 3D, typography, illustration, or painting.
 * 2. Handles short, complex, and multilingual prompts cleanly.
 * 3. ALWAYS preserves `originalPrompt` untouched alongside `enhancedPrompt`.
 */

export const STYLE_CATEGORIES = {
  ANIME: 'anime',
  VECTOR: 'vector_illustration',
  RENDER_3D: '3d_render',
  TYPOGRAPHY: 'typography',
  PAINTERLY: 'painterly',
  PIXEL_ART: 'pixel_art',
  PHOTOREALISTIC: 'photorealistic',
  GENERAL: 'general'
};

const STYLE_KEYWORDS = {
  [STYLE_CATEGORIES.ANIME]: [
    'anime', 'manga', 'ghibli', 'makoto shinkai', 'chibi', 'cel-shaded',
    'cel shading', 'visual novel', 'anime aesthetic', 'kyoto animation',
    'shonen', 'shoujo', 'otaku', 'mecha anime', 'kawaii anime'
  ],
  [STYLE_CATEGORIES.VECTOR]: [
    'vector', 'flat 2d', 'svg', 'sticker', 'sticker-cut', 'icon',
    'graphic design', 'minimalist vector', 'line art', 'clipart',
    'monoline', 'silhouette', 'flat illustration', 'vector graphic'
  ],
  [STYLE_CATEGORIES.RENDER_3D]: [
    '3d', '3d render', 'cgi', 'pixar', 'disney 3d', 'claymation',
    'blender 3d', 'octane render', 'unreal engine', 'isometric 3d',
    'subsurface scattering', '3d model', 'low poly 3d', 'cinema 4d'
  ],
  [STYLE_CATEGORIES.TYPOGRAPHY]: [
    'typography', 'lettering', 'font', 'words', 'text', 'quote',
    'calligraphy', 'monogram', 'logotype', 'wordmark', 'typeface',
    'poster headline', 'signage text', 'bold letters'
  ],
  [STYLE_CATEGORIES.PAINTERLY]: [
    'oil painting', 'watercolor', 'acrylic', 'gouache', 'impasto',
    'canvas painting', 'pastel drawing', 'charcoal sketch', 'brushstrokes',
    'ink wash', 'sumi-e', 'palette knife', 'fine art'
  ],
  [STYLE_CATEGORIES.PIXEL_ART]: [
    'pixel art', '8-bit', '16-bit', 'retro game', 'pixelated', 'pixel sprite'
  ],
  [STYLE_CATEGORIES.PHOTOREALISTIC]: [
    'photo', 'photography', 'dslr', 'portrait photo', 'candid', 'cinematic photo',
    '35mm', 'realistic photo', 'raw photo', 'street photography', 'macro photography',
    'film grain', 'kodak', 'fujifilm', 'polaroid'
  ]
};

/**
 * Detects the visual style category requested by the user.
 */
export function detectPromptStyle(prompt = '', explicitStyle = '') {
  const combined = `${prompt} ${explicitStyle}`.toLowerCase();

  for (const [category, keywords] of Object.entries(STYLE_KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i');
      if (regex.test(combined)) {
        return {
          category,
          keywordMatched: kw,
          styleLocked: category !== STYLE_CATEGORIES.PHOTOREALISTIC && category !== STYLE_CATEGORIES.GENERAL,
          forbidPhotorealism: category !== STYLE_CATEGORIES.PHOTOREALISTIC && category !== STYLE_CATEGORIES.GENERAL
        };
      }
    }
  }

  return {
    category: STYLE_CATEGORIES.GENERAL,
    keywordMatched: null,
    styleLocked: false,
    forbidPhotorealism: false
  };
}

/**
 * Deterministic heuristic prompt enrichment for offline testing or fallback.
 * Strictly honors detected artistic style without forcing photorealism on non-photo styles.
 */
export function applyHeuristicEnrichment(rawPrompt, styleInfo, options = {}) {
  const trimmed = rawPrompt.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);

  let enhancements = [];

  switch (styleInfo.category) {
    case STYLE_CATEGORIES.ANIME:
      if (!lower.includes('cel-shad') && !lower.includes('line art')) {
        enhancements.push('vibrant anime color grading, clean expressive line art, anime key visual aesthetic');
      }
      if (!lower.includes('lighting') && !lower.includes('lit')) {
        enhancements.push('dramatic cinematic anime lighting');
      }
      break;

    case STYLE_CATEGORIES.VECTOR:
      if (!lower.includes('clean sharp') && !lower.includes('flat')) {
        enhancements.push('clean sharp vector lines, isolated graphic subject, modern flat illustration palette');
      }
      break;

    case STYLE_CATEGORIES.RENDER_3D:
      if (!lower.includes('render') && !lower.includes('depth')) {
        enhancements.push('smooth 3D render, ambient occlusion, subtle subsurface scattering, volumetric soft lighting');
      }
      break;

    case STYLE_CATEGORIES.TYPOGRAPHY:
      if (!lower.includes('kerning') && !lower.includes('legible')) {
        enhancements.push('crisp legible typography, balanced visual hierarchy, sharp vector edge definition');
      }
      break;

    case STYLE_CATEGORIES.PAINTERLY:
      if (!lower.includes('brushstroke') && !lower.includes('texture')) {
        enhancements.push('rich tactile brushstroke textures, painterly pigment blending, authentic fine art medium');
      }
      break;

    case STYLE_CATEGORIES.PIXEL_ART:
      if (!lower.includes('palette') && !lower.includes('crisp')) {
        enhancements.push('crisp pixel grid definition, carefully curated retro color palette, nostalgic game art aesthetic');
      }
      break;

    case STYLE_CATEGORIES.PHOTOREALISTIC:
      if (!lower.includes('lighting') && !lower.includes('depth of field')) {
        enhancements.push('authentic surface textures, natural depth of field, balanced realistic exposure');
      }
      break;

    default:
      // General prompts: if short (< 6 words), provide composition and depth without restricting style
      if (words.length <= 5) {
        enhancements.push('detailed composition, atmospheric lighting, coherent background setting');
      }
      break;
  }

  // Handle explicit reference context (e.g. character, product, or style anchors)
  // IDENTITY-CRITICAL: Prepend face/character anchors BEFORE enhancements so the model
  // weights identity preservation highest. Append style/product/environment anchors at end.
  if (options.referenceAnchorPrompt) {
    const anchorText = options.referenceAnchorPrompt;
    const isFaceAnchor = anchorText.includes('IDENTITY') || anchorText.includes('facial identity') || anchorText.includes('PHOTOMETRIC');
    if (isFaceAnchor) {
      // Prepend for face/character: identity anchor leads the prompt, then inject relighting bridge
      const relightingBridge = 'naturally relit to match scene lighting with consistent skin tone across face, neck, and body, proportional head-to-body scale, seamless neck-to-collar transition';
      return `${anchorText} ${trimmed}${enhancements.length > 0 ? ', ' + enhancements.join(', ') : ''}, ${relightingBridge}`;
    } else {
      enhancements.push(anchorText);
    }
  }

  if (enhancements.length === 0) {
    return trimmed;
  }

  return `${trimmed}, ${enhancements.join(', ')}`;
}

/**
 * Builds the LLM system prompt for intelligent visual prompt enrichment.
 */
function buildIntelligenceSystemPrompt(styleInfo) {
  let styleConstraintClause = '';

  if (styleInfo.forbidPhotorealism) {
    styleConstraintClause = `
CRITICAL STYLE INTEGRITY:
The user has requested a NON-PHOTOREALISTIC style (${styleInfo.category}).
- You MUST NOT append photographic terms (such as "photorealistic", "raw photo", "dslr", "35mm camera", "hyperrealistic", "unreal engine realism", or "film grain").
- Enrich the prompt using native terminology for ${styleInfo.category} (e.g., cel-shading, vibrant digital palette, and anime key visual cues for Anime; bezier curves, clean fills, and isolated graphic design for Vector; ambient occlusion and subsurface scattering for 3D).`;
  } else if (styleInfo.category === STYLE_CATEGORIES.PHOTOREALISTIC) {
    styleConstraintClause = `
STYLE FOCUS:
The user has requested photorealism. Enrich with realistic lighting, depth of field, and natural textures.`;
  } else {
    styleConstraintClause = `
STYLE FOCUS:
Preserve the user's intended artistic mood. If style is unspecified, enhance visual depth, composition, and atmosphere naturally without imposing an unnatural aesthetic.`;
  }

  return `You are the Mestrio AI Prompt Intelligence Engine. Your mission is to take an image generation prompt and enhance it into a clear, visually rich, and coherent description ready for modern image diffusion models.

CORE RULES:
1. PRESERVE INTENT & SUBJECT: Never replace or delete the user's primary subject, action, or concept.
2. ZERO HALLUCINATIONS: Do not add random extra objects, people, or clutter that the user did not request.
3. VISUAL CLARITY: Clarify environment/setting, lighting mood, camera perspective, materials, colors, and spatial composition.
4. TEXT & TYPOGRAPHY: If the user includes requested text or words in quotes, keep the exact words in quotes intact.
5. MULTILINGUAL SUPPORT: If the user prompt is in another language, understand its visual meaning, preserve cultural and named concepts, and output the enhanced description in clean English while retaining original names.
${styleConstraintClause}

PHOTOMETRIC INTEGRATION RULE:
If the prompt references a person from a reference image, the subject's facial lighting MUST be synthesized to match the target scene's environment lighting. Do NOT replicate the reference photo's indoor flat light, flash, or color cast. The subject's face, neck, and skin must appear naturally lit by the same light source as the rest of the scene — unified key light direction, matching color temperature, consistent rim light, and seamless ambient fill. Describe this unified lighting setup explicitly in your enhanced prompt.

OUTPUT FORMAT:
Return ONLY the final enhanced prompt text. Never include conversational greetings ("Here is your prompt:"), preamble, markdown wrappers, or trailing commentary.`;
}

/**
 * Primary Prompt Intelligence Interface.
 * Enriches the prompt while strictly preserving both originalPrompt and enhancedPrompt.
 */
export async function refinePrompt(rawPrompt, options = {}) {
  const trimmed = typeof rawPrompt === 'string' ? rawPrompt.trim() : '';
  if (!trimmed) {
    return {
      originalPrompt: '',
      enhancedPrompt: '',
      detectedStyle: STYLE_CATEGORIES.GENERAL,
      styleLocked: false,
      appliedTechnique: 'none'
    };
  }

  const apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || config.openrouter?.apiKey;
  const requestId = options.requestId || 'prompt_intel';
  const explicitStyle = options.style || options.templateStyle || '';

  // 1. Detect prompt style and restrictions
  const styleInfo = detectPromptStyle(trimmed, explicitStyle);

  // If no API key or in offline test mode, apply deterministic heuristic enrichment
  if (!apiKey || options.mock || options.offline) {
    const heuristicPrompt = applyHeuristicEnrichment(trimmed, styleInfo, options);
    return {
      originalPrompt: trimmed,
      enhancedPrompt: heuristicPrompt,
      detectedStyle: styleInfo.category,
      styleLocked: styleInfo.styleLocked,
      appliedTechnique: 'heuristic'
    };
  }

  // 2. Call low-cost fast LLM via OpenRouter for advanced refinement
  try {
    const systemPrompt = buildIntelligenceSystemPrompt(styleInfo);
    let userPromptText = `Original Prompt: "${trimmed}"`;

    if (options.referenceAnchorPrompt) {
      userPromptText += `\nReference Guidance to integrate: ${options.referenceAnchorPrompt}`;
      // Explicit relighting instruction for face+body integration — no extra API call, just directive
      userPromptText += `\nCRITICAL: In your enhanced prompt, explicitly describe a unified scene lighting setup that naturally illuminates both the subject's face and body from the same direction and color temperature. Do NOT describe or replicate the reference photo's original lighting conditions (e.g. flat indoor light, flash, warm color cast). Synthesize new lighting that fits the requested scene environment.`;
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptText }
        ],
        temperature: 0.6,
        max_tokens: 450
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.openrouter?.siteUrl || 'http://localhost:5001',
          'X-Title': config.openrouter?.siteName || 'Mestrio AI'
        },
        timeout: 10000 // 10s fast timeout safeguard
      }
    );

    const generatedText = response.data?.choices?.[0]?.message?.content?.trim();
    if (generatedText && generatedText.length > 0) {
      const cleaned = generatedText.replace(/^["'`]+|["'`]+$/g, '').trim();

      // Guard against model accidentally adding photorealism buzzwords to non-photo styles
      let finalEnhanced = cleaned;
      if (styleInfo.forbidPhotorealism) {
        finalEnhanced = finalEnhanced
          .replace(/\b(photorealistic|hyperrealistic|raw photo|dslr photo|35mm photography|kodak portra)\b/gi, '')
          .replace(/,\s*,/g, ',')
          .trim();
      }

      logger.info('Prompt Intelligence enriched prompt successfully via LLM', {
        requestId,
        originalLength: trimmed.length,
        enhancedLength: finalEnhanced.length,
        style: styleInfo.category
      });

      return {
        originalPrompt: trimmed,
        enhancedPrompt: finalEnhanced,
        detectedStyle: styleInfo.category,
        styleLocked: styleInfo.styleLocked,
        appliedTechnique: 'llm'
      };
    }
  } catch (err) {
    logger.warn('Prompt Intelligence LLM call failed or timed out, applying heuristic enrichment', {
      requestId,
      error: err.response?.data?.error?.message || err.message
    });
  }

  // Fallback to deterministic heuristic enrichment
  const fallbackEnhanced = applyHeuristicEnrichment(trimmed, styleInfo, options);
  return {
    originalPrompt: trimmed,
    enhancedPrompt: fallbackEnhanced,
    detectedStyle: styleInfo.category,
    styleLocked: styleInfo.styleLocked,
    appliedTechnique: 'heuristic'
  };
}

export default {
  STYLE_CATEGORIES,
  detectPromptStyle,
  applyHeuristicEnrichment,
  refinePrompt
};
