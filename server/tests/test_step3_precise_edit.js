/**
 * Unit & Integration Tests: Step 3 Professional Image Engine Upgrade
 * 
 * Verifies:
 * 1. Edit instruction decomposition & preservation planning for clothing, background, object, and color edits.
 * 2. Facial identity preservation vs explicit face replacement detection.
 * 3. Source image vs reference image isolation (preventing cross-contamination).
 * 4. Oversized (> 8 MB) source image optimization without mutating the original reference.
 * 5. Preflight rejection (HTTP 422 UNSUPPORTED_EDIT_WORKFLOW) for non-editing models.
 * 6. Model identity consistency in response metadata.
 */

import assert from 'assert';
import sharp from 'sharp';
import {
  EDIT_CATEGORIES,
  isFaceReplacementRequested,
  decomposeEditInstruction,
  buildPreservationDirectives,
  planPreciseEdit
} from '../src/services/preciseEditPlanner.js';

import {
  validateImagePreflight
} from '../src/services/imagePreflight.js';

import {
  IMAGE_MODEL_REGISTRY,
  getImageModelConfig,
  supportsPreciseEdit
} from '../src/config/imageModelRegistry.js';

import {
  optimizeImageBuffer,
  optimizeBase64DataUrl,
  ensureOpenRouterPayloadLimits
} from '../src/utils/imageOptimizer.js';

import {
  fluxImageAdapter
} from '../src/services/imageAdapters/index.js';

async function runStep3Tests() {
  console.log('================================================================');
  console.log('🧪 RUNNING STEP 3 PRECISE EDIT & PRESERVATION PLANNER TESTS');
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
  // 1. EDIT INSTRUCTION DECOMPOSITION & PRESERVATION PLANNING TESTS
  // ============================================================================
  console.log('--- 1. Edit Instruction Decomposition & Preservation Planning Tests ---');

  test('Decomposes clothing edit and enforces facial identity preservation', () => {
    const prompt = 'Change jacket to a sleek red leather biker jacket';
    const plan = decomposeEditInstruction(prompt);

    assert.strictEqual(plan.category, EDIT_CATEGORIES.CLOTHING_CHANGE);
    assert.strictEqual(plan.targetSubjectOrRegion, 'attire / clothing');
    assert.strictEqual(plan.isFaceReplacementRequested, false);
    
    // Elements to preserve must include facial identity and hairstyle
    const preservedStr = plan.elementsToPreserve.join(' ').toLowerCase();
    assert(preservedStr.includes('facial identity'), 'Clothing edit must preserve facial identity');
    assert(preservedStr.includes('hairstyle') || preservedStr.includes('anatomy'), 'Must preserve anatomy/hair');

    const directives = buildPreservationDirectives(plan);
    assert(directives.directivesText.includes('IDENTITY PRESERVATION'), 'Must include identity lock directive');
    assert(directives.directivesText.includes('LOCALIZED MODIFICATION ONLY'), 'Must constrain edit to localized region');
  });

  test('Decomposes background replacement and preserves foreground subjects', () => {
    const prompt = 'Replace background with a sunlit tropical beach with palm trees';
    const plan = decomposeEditInstruction(prompt);

    assert.strictEqual(plan.category, EDIT_CATEGORIES.BACKGROUND_CHANGE);
    assert.strictEqual(plan.targetSubjectOrRegion, 'background setting / environment');
    assert.strictEqual(plan.isFaceReplacementRequested, false);

    const preservedStr = plan.elementsToPreserve.join(' ').toLowerCase();
    assert(preservedStr.includes('foreground subjects'), 'Must preserve foreground subjects');
    assert(preservedStr.includes('facial likeness'), 'Must preserve facial likeness');
  });

  test('Decomposes object modification and isolates delta', () => {
    const prompt = 'Replace the ceramic mug in his hand with a sleek metal thermos';
    const plan = decomposeEditInstruction(prompt);

    assert.strictEqual(plan.category, EDIT_CATEGORIES.OBJECT_MODIFICATION);
    assert.strictEqual(plan.targetSubjectOrRegion, 'target object / item');
    assert.strictEqual(plan.isFaceReplacementRequested, false);
  });

  test('Decomposes color adjustment and maintains geometry', () => {
    const prompt = 'Change dress color to vibrant emerald green';
    const plan = decomposeEditInstruction(prompt);

    assert.strictEqual(plan.category, EDIT_CATEGORIES.COLOR_ADJUSTMENT);
    assert.strictEqual(plan.targetSubjectOrRegion, 'specified surface color / palette');
    assert.strictEqual(plan.isFaceReplacementRequested, false);
  });

  test('Correctly identifies explicit face replacement request vs accessory change', () => {
    // Face replacement requested
    assert.strictEqual(isFaceReplacementRequested('Swap face with a different person'), true);
    assert.strictEqual(isFaceReplacementRequested('Change face to a new face'), true);

    // Accessory addition (NOT face replacement)
    assert.strictEqual(isFaceReplacementRequested('Add sunglasses to the person'), false);
    assert.strictEqual(isFaceReplacementRequested('Add a gold necklace'), false);
    assert.strictEqual(isFaceReplacementRequested('Change jacket color'), false);
  });

  await testAsync('planPreciseEdit produces integrated inpainting synthesis prompt', async () => {
    const prompt = 'Change the shirt to a blue flannel shirt';
    const plan = await planPreciseEdit(prompt, { quality: 'High' });

    assert.strictEqual(plan.originalInstruction, prompt);
    assert(plan.synthesisPrompt.startsWith(prompt), 'Synthesis prompt should begin with user prompt');
    assert(plan.synthesisPrompt.includes('LOCALIZED MODIFICATION ONLY'));
    assert(plan.synthesisPrompt.includes('IDENTITY PRESERVATION'));
    assert(plan.capabilityNotes.length > 0);
  });

  // ============================================================================
  // 2. SOURCE IMAGE VS REFERENCE IMAGE ISOLATION TESTS
  // ============================================================================
  console.log('\n--- 2. Source Image vs Reference Image Isolation Tests ---');

  const mockSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNk+M9QzwAEjAwMDAwAFAAC/4fGzEAAAAAASUVORK5CYII=';
  const mockRef = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  await testAsync('Adapter isolates sourceImage from referenceImages and prevents deduplication errors', async () => {
    const config = getImageModelConfig('black-forest-labs/flux.2-flex');

    // Case 1: Distinct source and reference
    const payloadDistinct = await fluxImageAdapter.preparePayload({
      prompt: 'Change coat to leather',
      sourceImage: mockSource,
      referenceImages: [mockRef],
      mode: 'precise-edit',
      modelConfig: config
    });

    // After fix: Krea K3 Edit adapter uses only canonical input_references
    assert(Array.isArray(payloadDistinct.input_references));
    assert.strictEqual(payloadDistinct.input_references.length, 2, 'Must include both source and distinct reference');
    assert.strictEqual(payloadDistinct.input_references[0].image_url.url, mockSource, 'First image must be primary source');
    assert.strictEqual(payloadDistinct.input_references[1].image_url.url, mockRef, 'Second image must be reference guide');

    // Case 2: Reference identical to source (must be deduplicated to avoid sending duplicates)
    const payloadDuplicate = await fluxImageAdapter.preparePayload({
      prompt: 'Change coat to leather',
      sourceImage: mockSource,
      referenceImages: [mockSource], // Duplicate of source
      mode: 'precise-edit',
      modelConfig: config
    });

    assert.strictEqual(payloadDuplicate.input_references.length, 1, 'Duplicate reference of source image must be deduplicated');
    assert.strictEqual(payloadDuplicate.input_references[0].image_url.url, mockSource);
  });

  // ============================================================================
  // 3. OVERSIZED (> 8 MB) SOURCE IMAGE OPTIMIZATION TEST
  // ============================================================================
  console.log('\n--- 3. Oversized Source Image Optimization Tests ---');

  console.log('  Generating synthetic 3200x3200 uncompressed source image buffer (> 8 MB)...');
  const largeBuffer = await sharp({
    create: {
      width: 3200,
      height: 3200,
      channels: 4,
      background: { r: 180, g: 90, b: 60, alpha: 1 }
    }
  })
  .png({ compressionLevel: 0 })
  .toBuffer();

  const bufferMb = (largeBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`  Source image buffer size: ${bufferMb} MB`);
  assert(largeBuffer.length > 8 * 1024 * 1024, 'Source buffer must be > 8 MB');

  const largeDataUrl = `data:image/png;base64,${largeBuffer.toString('base64')}`;

  await testAsync('Optimizes oversized source image while keeping original string variable intact', async () => {
    const originalLengthBefore = largeDataUrl.length;
    const optimized = await optimizeBase64DataUrl(largeDataUrl, { maxDimension: 2048, quality: 85 });
    
    // Original input variable must not be mutated
    assert.strictEqual(largeDataUrl.length, originalLengthBefore, 'Original variable must remain untouched');
    
    const optMb = (optimized.length / (1024 * 1024)).toFixed(2);
    console.log(`    Optimized source image size: ${optMb} MB`);
    assert(optimized.length < 3 * 1024 * 1024, `Optimized data URL must be < 3 MB, got ${optMb} MB`);
    assert(optimized.startsWith('data:image/'));
  });

  await testAsync('ensureOpenRouterPayloadLimits guarantees total edit payload is < 6 MB', async () => {
    const editPayload = {
      model: 'black-forest-labs/flux.2-flex',
      prompt: 'Change background to cityscape',
      sourceImage: largeDataUrl,
      image_references: [largeDataUrl]
    };

    const initialSize = JSON.stringify(editPayload).length;
    assert(initialSize > 8 * 1024 * 1024, 'Initial edit payload must be > 8 MB');

    const safePayload = await ensureOpenRouterPayloadLimits(editPayload);
    const finalSize = JSON.stringify(safePayload).length;
    const finalMb = (finalSize / (1024 * 1024)).toFixed(2);
    console.log(`    Optimized total edit payload size: ${finalMb} MB`);

    assert(finalSize < 6 * 1024 * 1024, `Safe edit payload must be < 6 MB, got ${finalMb} MB`);
  });

  // ============================================================================
  // 4. PREFLIGHT REJECTION ON NON-EDITING MODELS & MODEL IDENTITY CONSISTENCY
  // ============================================================================
  console.log('\n--- 4. Preflight Rejection & Model Identity Consistency Tests ---');

  test('Rejects non-editing model (FLUX.2 Pro) with 422 UNSUPPORTED_EDIT_WORKFLOW', () => {
    const preflight = validateImagePreflight({
      model: 'black-forest-labs/flux.2-pro',
      sourceImage: mockSource,
      mode: 'precise-edit'
    });

    assert.strictEqual(preflight.valid, false);
    assert.strictEqual(preflight.statusCode, 422);
    assert.strictEqual(preflight.code, 'UNSUPPORTED_EDIT_WORKFLOW');
    assert(preflight.message.includes('does not support image editing'));
    
    // Must recommend compatible editing models
    assert(Array.isArray(preflight.recommendedModels) && preflight.recommendedModels.length > 0);
    const recIds = preflight.recommendedModels.map(m => m.id);
    assert(recIds.includes('krea/k3-edit') || recIds.includes('black-forest-labs/flux.2-flex'));
  });

  test('Rejects text-only model (Meta: Muse Image) with 422 UNSUPPORTED_EDIT_WORKFLOW', () => {
    const preflight = validateImagePreflight({
      model: 'meta/muse-image',
      sourceImage: mockSource,
      mode: 'precise-edit'
    });

    assert.strictEqual(preflight.valid, false);
    assert.strictEqual(preflight.statusCode, 422);
    assert.strictEqual(preflight.code, 'UNSUPPORTED_EDIT_WORKFLOW');
  });

  test('Approves dedicated editing models (FLUX.2 Flex & Seedream 5.5)', () => {
    const preflightFlex = validateImagePreflight({
      model: 'black-forest-labs/flux.2-flex',
      sourceImage: mockSource,
      mode: 'precise-edit'
    });
    assert.strictEqual(preflightFlex.valid, true);
    assert.strictEqual(preflightFlex.resolvedModel, 'black-forest-labs/flux.2-flex');

    const preflightSeedream = validateImagePreflight({
      model: 'bytedance-seed/seedream-5-5',
      sourceImage: mockSource,
      mode: 'precise-edit'
    });
    assert.strictEqual(preflightSeedream.valid, true);
    assert.strictEqual(preflightSeedream.resolvedModel, 'bytedance-seed/seedream-5-5');
  });

  test('Model identity consistency maps correctly from registry to provider IDs', () => {
    const flexConfig = getImageModelConfig('black-forest-labs/flux.2-flex');
    assert.strictEqual(flexConfig.id, 'black-forest-labs/flux.2-flex');
    assert.strictEqual(flexConfig.displayName, 'FLUX.2 Flex');
    assert.strictEqual(flexConfig.providerModelId, 'black-forest-labs/flux.2-flex');

    const seedreamConfig = getImageModelConfig('bytedance-seed/seedream-5-5');
    assert.strictEqual(seedreamConfig.id, 'bytedance-seed/seedream-5-5');
    assert.strictEqual(seedreamConfig.displayName, 'Seedream 5.5');
    assert.strictEqual(seedreamConfig.providerModelId, 'bytedance-seed/seedream-5-5');
  });

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} STEP 3 PRECISE EDIT TESTS PASSED SUCCESSFULLY!`);
  console.log('================================================================\n');
}

runStep3Tests().catch((err) => {
  console.error('Fatal Step 3 test error:', err);
  process.exit(1);
});
