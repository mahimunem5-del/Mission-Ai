/**
 * Unit & Integration Tests: Step 2 Professional Image Engine Upgrade
 * 
 * Verifies:
 * 1. Prompt Intelligence (Stage A): Short & stylized prompt refinement keeping both originalPrompt
 *    and enhancedPrompt without forcing photorealism on anime/vector/3D styles.
 * 2. Hybrid Reference Role Detection (Stage B): Classifies face_character, product_object, style, etc.
 * 3. Identity Conditioning & Multimodal Payload Construction (Stage C): Passes original reference
 *    images directly through adapter with role-tailored anchoring instructions.
 * 4. Auto Mode Smart Routing: Automatically picks high-identity multimodal model when references are attached.
 * 5. Honest Preflight Validation (Stage E & G): Returns HTTP 422 UNSUPPORTED_REFERENCE_WORKFLOW
 *    with recommended models when text-only models are selected with reference images (zero silent stripping).
 */

import assert from 'assert';
import {
  refinePrompt,
  detectPromptStyle,
  applyHeuristicEnrichment,
  STYLE_CATEGORIES
} from '../src/services/promptIntelligence.js';

import {
  REFERENCE_ROLES,
  REFERENCE_ROLE_CONFIGS,
  classifyReferenceRoleByPrompt,
  resolveAutoModelForReferences,
  buildReferenceConditioning
} from '../src/services/referenceIntelligence.js';

import {
  validateImagePreflight
} from '../src/services/imagePreflight.js';

import {
  IMAGE_MODEL_REGISTRY,
  getImageModelConfig,
  getReferenceCapableModels
} from '../src/config/imageModelRegistry.js';

import {
  geminiImageAdapter
} from '../src/services/imageAdapters/index.js';

async function runStep2Tests() {
  console.log('================================================================');
  console.log('🧪 RUNNING STEP 2 PROMPT & REFERENCE INTELLIGENCE VERIFICATION TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      throw err;
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      throw err;
    }
  }

  // ============================================================================
  // 1. PROMPT INTELLIGENCE TESTS (STAGE A)
  // ============================================================================
  console.log('--- 1. Prompt Intelligence Tests (Stage A) ---');

  await testAsync('Anime prompt refinement preserves originalPrompt and does NOT force photorealism', async () => {
    const raw = 'anime girl with blue hair in rain';
    const result = await refinePrompt(raw, { mock: true });

    assert.strictEqual(result.originalPrompt, raw, 'originalPrompt must remain strictly untouched');
    assert.strictEqual(result.detectedStyle, STYLE_CATEGORIES.ANIME, 'Must detect anime style');
    assert.strictEqual(result.styleLocked, true, 'Style must be locked for anime');

    const enhanced = result.enhancedPrompt.toLowerCase();
    // Must NOT contain photorealistic terms
    assert(!enhanced.includes('photorealistic'), 'Anime prompt must NOT include "photorealistic"');
    assert(!enhanced.includes('raw photo'), 'Anime prompt must NOT include "raw photo"');
    assert(!enhanced.includes('dslr'), 'Anime prompt must NOT include "dslr"');
    assert(!enhanced.includes('35mm'), 'Anime prompt must NOT include "35mm"');

    // Must include anime aesthetic cues
    assert(enhanced.includes('anime') || enhanced.includes('line art') || enhanced.includes('cel-shad'), 'Must contain anime aesthetic cues');
  });

  await testAsync('Vector illustration prompt refinement preserves vector aesthetic without photo cues', async () => {
    const raw = 'flat 2D vector logo of a coffee cup';
    const result = await refinePrompt(raw, { mock: true });

    assert.strictEqual(result.originalPrompt, raw, 'originalPrompt must be preserved');
    assert.strictEqual(result.detectedStyle, STYLE_CATEGORIES.VECTOR, 'Must detect vector style');

    const enhanced = result.enhancedPrompt.toLowerCase();
    assert(!enhanced.includes('photorealistic'), 'Vector prompt must NOT include "photorealistic"');
    assert(!enhanced.includes('camera'), 'Vector prompt must NOT include "camera"');
    assert(enhanced.includes('vector') || enhanced.includes('flat'), 'Must contain vector cues');
  });

  await testAsync('Short general prompt is enriched with environment and composition details', async () => {
    const raw = 'red sports car';
    const result = await refinePrompt(raw, { mock: true });

    assert.strictEqual(result.originalPrompt, raw, 'originalPrompt must be preserved');
    assert(result.enhancedPrompt.length > raw.length, 'Enhanced prompt should be richer than raw prompt');
    assert(result.enhancedPrompt.includes(raw), 'Enhanced prompt must contain the original subject');
  });

  await testAsync('Multilingual prompt retains user subject and meaning', async () => {
    const raw = 'chica anime con pelo rosa en un jardín japonés';
    const result = await refinePrompt(raw, { mock: true });

    assert.strictEqual(result.originalPrompt, raw, 'originalPrompt must be preserved exactly for multilingual prompts');
    assert.strictEqual(result.detectedStyle, STYLE_CATEGORIES.ANIME, 'Must detect anime in multilingual prompt');
  });

  // ============================================================================
  // 2. REFERENCE ROLE CLASSIFICATION & CONDITIONING TESTS (STAGE B)
  // ============================================================================
  console.log('\n--- 2. Reference Role Classification Tests (Stage B) ---');

  const mockRefUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  test('Classifies Face / Character reference role from prompt intent', () => {
    const prompt = 'Place this person in a cyberpunk neon alley at night';
    const result = classifyReferenceRoleByPrompt(prompt);

    assert.strictEqual(result.role, REFERENCE_ROLES.FACE_CHARACTER);
    assert(result.config.mustPreserve.includes('facial structure') || result.config.mustPreserve.includes('likeness'));
    assert(result.config.canChange.includes('clothing') || result.config.canChange.includes('background'));
    assert(result.config.anchoringInstruction.includes('IDENTITY') && result.config.anchoringInstruction.includes('PHOTOMETRIC'));
  });

  test('Classifies Product / Object reference role from prompt intent', () => {
    const prompt = 'Show this perfume bottle on a marble pedestal with soft morning light';
    const result = classifyReferenceRoleByPrompt(prompt);

    assert.strictEqual(result.role, REFERENCE_ROLES.PRODUCT_OBJECT);
    assert(result.config.mustPreserve.includes('product shape') || result.config.mustPreserve.includes('branding'));
    assert(result.config.anchoringInstruction.includes('PRODUCT FIDELITY'));
  });

  test('Classifies Style / Palette reference role from prompt intent', () => {
    const prompt = 'Create a mountain landscape in the style and color palette of this image';
    const result = classifyReferenceRoleByPrompt(prompt);

    assert.strictEqual(result.role, REFERENCE_ROLES.STYLE);
    assert(result.config.anchoringInstruction.includes('STYLE & PALETTE TRANSFER'));
  });

  await testAsync('buildReferenceConditioning generates role-tailored anchors and preserves images', async () => {
    const prompt = 'A close-up portrait of this woman looking at the camera';
    const conditioning = await buildReferenceConditioning([mockRefUrl], prompt, { mock: true });

    assert.strictEqual(conditioning.hasReferences, true);
    assert.strictEqual(conditioning.role, REFERENCE_ROLES.FACE_CHARACTER);
    assert.strictEqual(conditioning.referenceImages.length, 1);
    assert.strictEqual(conditioning.referenceImages[0], mockRefUrl);
    assert(conditioning.anchoringInstruction.includes('IDENTITY') && conditioning.anchoringInstruction.includes('PHOTOMETRIC'));
    assert(conditioning.mustPreserve.length > 0);
  });

  // ============================================================================
  // 3. AUTO MODE SMART ROUTING TESTS (STAGE C)
  // ============================================================================
  console.log('\n--- 3. Auto Mode Smart Routing Tests (Stage C) ---');

  test('Auto mode with reference images dynamically routes to high-identity multimodal model', () => {
    const prompt = 'A portrait of this man in an ancient Roman toga';
    const autoRouting = resolveAutoModelForReferences(prompt, [mockRefUrl]);

    assert(autoRouting, 'Auto routing should provide a model configuration');
    assert.strictEqual(autoRouting.model, 'google/gemini-3-pro-image');
    assert.strictEqual(autoRouting.modelName, 'Nano Banana Pro (Gemini 3 Pro Image)');
    assert.strictEqual(autoRouting.identityPreservationStrength, 'high');
    assert.strictEqual(autoRouting.isAuto, true);

    // Verify model in registry supports reference images
    const config = getImageModelConfig(autoRouting.model);
    assert.strictEqual(config.supportsReferenceImages, true, 'Resolved Auto model must support reference images');
  });

  test('Auto mode without reference images returns null to allow text-only routing', () => {
    const autoRouting = resolveAutoModelForReferences('A majestic snow leopard', []);
    assert.strictEqual(autoRouting, null);
  });

  // ============================================================================
  // 4. HONEST PREFLIGHT VALIDATION & REJECTION TESTS (STAGE E & G)
  // ============================================================================
  console.log('\n--- 4. Honest Preflight Validation & 422 Rejection Tests (Stage E & G) ---');

  test('Explicit selection of FLUX.2 Pro with reference images rejects with 422 UNSUPPORTED_REFERENCE_WORKFLOW', () => {
    const preflight = validateImagePreflight({
      model: 'black-forest-labs/flux.2-pro',
      referenceImages: [mockRefUrl],
      allowTextOnlyFallback: false
    });

    assert.strictEqual(preflight.valid, false, 'Preflight must fail when reference images are given to FLUX.2 Pro');
    assert.strictEqual(preflight.statusCode, 422);
    assert.strictEqual(preflight.code, 'UNSUPPORTED_REFERENCE_WORKFLOW');
    assert(preflight.message.includes('does not support reference images'));
    
    // Recommended models must be non-empty and support reference images
    assert(Array.isArray(preflight.recommendedModels) && preflight.recommendedModels.length > 0);
    const recIds = preflight.recommendedModels.map(m => m.id);
    assert(recIds.includes('google/gemini-3-pro-image'), 'Should recommend Nano Banana Pro');
    assert(recIds.includes('openai/gpt-image-2.5-sunburst'), 'Should recommend GPT Image 2.5 Sunburst');
  });

  test('Explicit selection of Meta: Muse Image with reference images rejects with 422', () => {
    const preflight = validateImagePreflight({
      model: 'meta/muse-image',
      referenceImages: [mockRefUrl],
      allowTextOnlyFallback: false
    });

    assert.strictEqual(preflight.valid, false);
    assert.strictEqual(preflight.statusCode, 422);
    assert.strictEqual(preflight.code, 'UNSUPPORTED_REFERENCE_WORKFLOW');
  });

  test('Text-only model with reference images passes ONLY when allowTextOnlyFallback is explicitly true', () => {
    const preflight = validateImagePreflight({
      model: 'black-forest-labs/flux.2-pro',
      referenceImages: [mockRefUrl],
      allowTextOnlyFallback: true // User approved text-only fallback
    });

    assert.strictEqual(preflight.valid, true, 'Must pass when user explicitly allows fallback');
  });

  test('Reference-capable model passes preflight validation', () => {
    const preflight = validateImagePreflight({
      model: 'google/gemini-3-pro-image',
      referenceImages: [mockRefUrl],
      allowTextOnlyFallback: false
    });

    assert.strictEqual(preflight.valid, true);
    assert.strictEqual(preflight.resolvedModel, 'google/gemini-3-pro-image');
  });

  test('Auto mode always passes preflight validation', () => {
    const preflight = validateImagePreflight({
      model: 'auto',
      referenceImages: [mockRefUrl]
    });

    assert.strictEqual(preflight.valid, true);
    assert.strictEqual(preflight.isAuto, true);
  });

  // ============================================================================
  // 5. TRUE MULTIMODAL CONDITIONING INTEGRATION TEST
  // ============================================================================
  console.log('\n--- 5. True Multimodal Conditioning Integration Test ---');

  await testAsync('Multimodal adapter passes reference image and identity anchor through payload', async () => {
    const config = getImageModelConfig('google/gemini-3-pro-image');
    const conditioning = await buildReferenceConditioning([mockRefUrl], 'Portrait of this man', { mock: true });
    
    const enrichedPrompt = `A detailed portrait, ${conditioning.anchoringInstruction}`;

    const payload = await geminiImageAdapter.preparePayload({
      prompt: 'Portrait of this man',
      finalPrompt: enrichedPrompt,
      referenceImages: [mockRefUrl],
      dimensions: { width: 1024, height: 1024, aspect_ratio: '1:1' },
      modelConfig: config
    });

    assert.strictEqual(payload.model, 'google/gemini-3-pro-image');
    // After fix: adapter uses canonical OpenRouter input_references
    assert(Array.isArray(payload.input_references), 'input_references must be passed to adapter');
    assert.strictEqual(payload.input_references.length, 1);
    assert.strictEqual(payload.input_references[0].type, 'image_url');
    assert.strictEqual(payload.input_references[0].image_url.url, mockRefUrl);
    assert(payload.prompt.includes('IDENTITY') && payload.prompt.includes('PHOTOMETRIC'), 'Prompt must carry identity anchoring');
  });

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} STEP 2 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  console.log('================================================================\n');
}

runStep2Tests().catch((err) => {
  console.error('Fatal Step 2 test error:', err);
  process.exit(1);
});
