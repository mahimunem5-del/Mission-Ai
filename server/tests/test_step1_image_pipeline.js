/**
 * Unit & Integration Tests: Step 1 Professional Image Engine Upgrade
 * 
 * Verifies:
 * 1. Model Capability Registry lookup for all 6 existing frontend models + aliases.
 * 2. Server-side Sharp optimizer safeguard on oversized (> 8 MB) image payloads.
 * 3. Model-specific adapter payload construction (Gemini, Flux, OpenAI, Seedream, Text-only).
 */

import assert from 'assert';
import sharp from 'sharp';
import {
  IMAGE_MODEL_REGISTRY,
  getImageModelConfig,
  resolveOpenRouterImageModel,
  resolveModelDisplayName,
  isModelMultimodal,
  supportsPreciseEdit,
  getAdapterNameForModel
} from '../src/config/imageModelRegistry.js';

import {
  optimizeImageBuffer,
  optimizeBase64DataUrl,
  ensureOpenRouterPayloadLimits,
  parseDataUri
} from '../src/utils/imageOptimizer.js';

import {
  geminiImageAdapter,
  openaiImageAdapter,
  fluxImageAdapter,
  seedreamImageAdapter,
  textOnlyImageAdapter,
  dispatchModelGeneration
} from '../src/services/imageAdapters/index.js';

async function runStep1Tests() {
  console.log('================================================================');
  console.log('🧪 RUNNING STEP 1 VERIFICATION TESTS');
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
  // 1. MODEL CAPABILITY REGISTRY TESTS
  // ============================================================================
  console.log('--- 1. Model Capability Registry Tests ---');

  const EXPECTED_6_MODELS = [
    { key: 'openai/gpt-image-2.5-sunburst', displayName: 'GPT Image 2.5 Sunburst', multimodal: true },
    { key: 'google/gemini-3-pro-image', displayName: 'Nano Banana Pro (Gemini 3 Pro Image)', multimodal: true },
    { key: 'black-forest-labs/flux.2-pro', displayName: 'FLUX.2 Pro', multimodal: false },
    { key: 'bytedance-seed/seedream-5.0-pro', displayName: 'Seedream 5.0 Pro', multimodal: true },
    { key: 'meta/muse-image', displayName: 'Meta: Muse Image', multimodal: false },
    { key: 'google/gemini-3.1-flash-image-preview', displayName: 'Nano Banana 2 (Gemini 3.1 Flash Image)', multimodal: true }
  ];

  test('Registry contains all 6 required frontend models', () => {
    for (const m of EXPECTED_6_MODELS) {
      const config = getImageModelConfig(m.key);
      assert(config, `Model ${m.key} must exist in registry`);
      assert.strictEqual(config.displayName, m.displayName, `Display name mismatch for ${m.key}`);
    }
  });

  test('Registry resolves models by display names and aliases', () => {
    // Canonical ID resolution
    assert.strictEqual(resolveOpenRouterImageModel('GPT Image 2.5 Sunburst'), 'openai/gpt-image-2.5-sunburst');
    assert.strictEqual(resolveOpenRouterImageModel('Nano Banana Pro'), 'google/gemini-3-pro-image');
    assert.strictEqual(resolveOpenRouterImageModel('FLUX.2 Pro'), 'black-forest-labs/flux.2-pro');
    assert.strictEqual(resolveOpenRouterImageModel('Seedream 5.0 Pro'), 'bytedance-seed/seedream-5.0-pro');
    assert.strictEqual(resolveOpenRouterImageModel('Meta: Muse Image'), 'meta/muse-image');
    assert.strictEqual(resolveOpenRouterImageModel('Nano Banana 2'), 'google/gemini-3.1-flash-image-preview');

    // Upstream OpenRouter provider model IDs
    assert.strictEqual(getImageModelConfig('GPT Image 2.5 Sunburst').providerModelId, 'openai/gpt-image-2.5-sunburst');
    assert.strictEqual(getImageModelConfig('Nano Banana Pro').providerModelId, 'google/gemini-3-pro-image');
    assert.strictEqual(getImageModelConfig('FLUX.2 Pro').providerModelId, 'black-forest-labs/flux.2-pro');
    assert.strictEqual(getImageModelConfig('Seedream 5.0 Pro').providerModelId, 'bytedance-seed/seedream-5.0-pro');
    assert.strictEqual(getImageModelConfig('Meta: Muse Image').providerModelId, 'meta/muse-image');
    assert.strictEqual(getImageModelConfig('Nano Banana 2').providerModelId, 'google/gemini-3.1-flash-image-preview');

    // Auto resolution defaults to Nano Banana Pro (Gemini 3 Pro)
    assert.strictEqual(resolveOpenRouterImageModel('auto'), 'google/gemini-3-pro-image');
  });

  test('Multimodal capability resolution is accurate', () => {
    assert.strictEqual(isModelMultimodal('google/gemini-3-pro-image'), true);
    assert.strictEqual(isModelMultimodal('openai/gpt-image-2.5-sunburst'), true);
    assert.strictEqual(isModelMultimodal('black-forest-labs/flux.2-pro'), false);
    assert.strictEqual(isModelMultimodal('meta/muse-image'), false);
  });

  test('Precise Edit capability resolution', () => {
    assert.strictEqual(supportsPreciseEdit('black-forest-labs/flux.2-flex'), true);
    assert.strictEqual(supportsPreciseEdit('bytedance-seed/seedream-5-5'), true);
    assert.strictEqual(supportsPreciseEdit('meta/muse-image'), false);
  });

  test('Adapter routing for each model type', () => {
    assert.strictEqual(getAdapterNameForModel('google/gemini-3-pro-image'), 'gemini');
    assert.strictEqual(getAdapterNameForModel('openai/gpt-image-2.5-sunburst'), 'openai');
    assert.strictEqual(getAdapterNameForModel('black-forest-labs/flux.2-pro'), 'flux');
    assert.strictEqual(getAdapterNameForModel('bytedance-seed/seedream-5.0-pro'), 'seedream');
    assert.strictEqual(getAdapterNameForModel('meta/muse-image'), 'textOnly');
  });

  // ============================================================================
  // 2. SHARP OPTIMIZER & OVERSIZED (> 8 MB) PAYLOAD SAFEGUARD TESTS
  // ============================================================================
  console.log('\n--- 2. Sharp Optimizer & Oversized Payload Safeguard Tests ---');

  // Generate a large synthetic PNG image buffer (> 8.5 MB)
  console.log('  Generating synthetic 3500x3500 uncompressed test image buffer (> 8 MB)...');
  const largeBuffer = await sharp({
    create: {
      width: 3500,
      height: 3500,
      channels: 4,
      background: { r: 120, g: 180, b: 240, alpha: 1 }
    }
  })
  .png({ compressionLevel: 0 }) // uncompressed to make it large
  .toBuffer();

  const bufferSizeMb = (largeBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`  Created test image buffer: ${bufferSizeMb} MB`);
  assert(largeBuffer.length > 8 * 1024 * 1024, `Test buffer should be > 8 MB, got ${bufferSizeMb} MB`);

  const largeDataUrl = `data:image/png;base64,${largeBuffer.toString('base64')}`;
  const dataUrlSizeMb = (largeDataUrl.length / (1024 * 1024)).toFixed(2);
  console.log(`  Created test Data URL: ${dataUrlSizeMb} MB`);

  await testAsync('Sharp optimizes oversized image buffer to < 2 MB while preserving aspect ratio', async () => {
    const optimized = await optimizeImageBuffer(largeBuffer, { maxDimension: 2048, quality: 85 });
    const optMb = (optimized.buffer.length / (1024 * 1024)).toFixed(2);
    console.log(`    Optimized buffer size: ${optMb} MB (${optimized.width}x${optimized.height})`);

    assert(optimized.buffer.length < 2 * 1024 * 1024, `Optimized buffer must be < 2 MB, got ${optMb} MB`);
    assert(optimized.width <= 2048 && optimized.height <= 2048, 'Dimensions must be constrained to <= 2048px');
    assert.strictEqual(optimized.width, optimized.height, 'Square aspect ratio must be preserved');
  });

  await testAsync('Sharp optimizeBase64DataUrl compresses Data URL safely', async () => {
    const optimizedUrl = await optimizeBase64DataUrl(largeDataUrl, { maxDimension: 2048, quality: 85 });
    const optUrlMb = (optimizedUrl.length / (1024 * 1024)).toFixed(2);
    console.log(`    Optimized Data URL size: ${optUrlMb} MB`);

    assert(optimizedUrl.length < 3 * 1024 * 1024, `Optimized Data URL must be < 3 MB, got ${optUrlMb} MB`);
    assert(optimizedUrl.startsWith('data:image/'), 'Must produce a valid data:image URI');
  });

  await testAsync('ensureOpenRouterPayloadLimits dynamically compresses payload to < 6 MB', async () => {
    // Construct payload that would normally exceed OpenRouter 8 MB limit
    const oversizedPayload = {
      model: 'google/gemini-3-pro-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Generate an edit based on this image' },
            { type: 'image_url', image_url: { url: largeDataUrl } }
          ]
        }
      ],
      sourceImage: largeDataUrl
    };

    const initialJsonLength = JSON.stringify(oversizedPayload).length;
    const initialMb = (initialJsonLength / (1024 * 1024)).toFixed(2);
    console.log(`    Initial oversized payload size: ${initialMb} MB`);
    assert(initialJsonLength > 8 * 1024 * 1024, 'Initial payload must be > 8 MB');

    const safePayload = await ensureOpenRouterPayloadLimits(oversizedPayload);
    const finalJsonLength = JSON.stringify(safePayload).length;
    const finalMb = (finalJsonLength / (1024 * 1024)).toFixed(2);
    console.log(`    Guaranteed safe payload size: ${finalMb} MB`);

    assert(finalJsonLength < 6 * 1024 * 1024, `Guaranteed payload must be < 6 MB, got ${finalMb} MB`);
    assert(safePayload.sourceImage.startsWith('data:image/'), 'sourceImage must remain a valid Data URL');
    assert.strictEqual(safePayload.messages[0].content[0].text, 'Generate an edit based on this image');
  });

  // ============================================================================
  // 3. MODEL-SPECIFIC ADAPTER PAYLOAD CONSTRUCTION TESTS
  // ============================================================================
  console.log('\n--- 3. Model-Specific Adapter Construction Tests ---');

  // Small mock Data URLs for adapter testing
  const mockRefUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const mockRefUrl2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M9QzwAEjAwACDAD/4iVz9sAAAAASUVORK5CYII=';

  await testAsync('Gemini Adapter builds multimodal payload with aspect_ratio and reference images', async () => {
    const config = getImageModelConfig('google/gemini-3-pro-image');
    const payload = await geminiImageAdapter.preparePayload({
      prompt: 'A futuristic city at sunset',
      dimensions: { width: 1344, height: 768, aspect_ratio: '16:9' },
      referenceImages: [mockRefUrl],
      modelConfig: config
    });

    assert.strictEqual(payload.model, 'google/gemini-3-pro-image');
    assert.strictEqual(payload.aspect_ratio, '16:9');
    assert.strictEqual(payload.width, 1344);
    assert.strictEqual(payload.height, 768);
    assert.strictEqual(payload.prompt, 'A futuristic city at sunset');
    // After fix: adapters use canonical OpenRouter input_references format
    assert(Array.isArray(payload.input_references) && payload.input_references.length === 1);
    assert.strictEqual(payload.input_references[0].type, 'image_url');
    assert.strictEqual(payload.input_references[0].image_url.url, mockRefUrl);
  });

  await testAsync('Flux Adapter strips image_url for flux.2-pro (pure text model)', async () => {
    const config = getImageModelConfig('black-forest-labs/flux.2-pro');
    const payload = await fluxImageAdapter.preparePayload({
      prompt: 'A ceramic vase on wood table',
      dimensions: { width: 1152, height: 864, aspect_ratio: '4:3' },
      referenceImages: [mockRefUrl], // Accidental reference image
      modelConfig: config
    });

    assert.strictEqual(payload.model, 'black-forest-labs/flux.2-pro');
    assert.strictEqual(payload.aspect_ratio, '4:3');
    // Ensure flux.2-pro has NO input_references (supportsReferenceImages=false → refs must be stripped)
    assert.strictEqual(payload.input_references, undefined);
    assert.strictEqual(payload.image_url, undefined);
  });

  await testAsync('Flux Adapter attaches source and reference images for black-forest-labs/flux.2-flex', async () => {
    const config = getImageModelConfig('black-forest-labs/flux.2-flex');
    const payload = await fluxImageAdapter.preparePayload({
      prompt: 'Change dress to crimson velvet',
      sourceImage: mockRefUrl,
      referenceImages: [mockRefUrl2],
      mode: 'precise-edit',
      modelConfig: config
    });

    assert.strictEqual(payload.model, 'black-forest-labs/flux.2-flex');
    // After fix: Krea K3 Edit uses only canonical input_references (no legacy image_references)
    assert(Array.isArray(payload.input_references), 'Must have input_references');
    assert.strictEqual(payload.input_references.length, 2);
    assert.strictEqual(payload.input_references[0].type, 'image_url');
    assert.strictEqual(payload.input_references[1].type, 'image_url');
  });

  await testAsync('OpenAI Adapter formats payload and strips unsupported quality param', async () => {
    const config = getImageModelConfig('openai/gpt-image-2.5-sunburst');
    const payload = await openaiImageAdapter.preparePayload({
      prompt: 'A majestic snow leopard',
      dimensions: { width: 1024, height: 1024, aspect_ratio: '1:1' },
      quality: 'hd',
      referenceImages: [mockRefUrl],
      modelConfig: config
    });

    assert.strictEqual(payload.model, 'openai/gpt-image-2.5-sunburst');
    assert.strictEqual(payload.quality, undefined, 'Invalid quality parameter must be stripped');
    // After fix: OpenAI adapter uses canonical input_references
    assert(Array.isArray(payload.input_references) && payload.input_references.length === 1);
    assert.strictEqual(payload.input_references[0].type, 'image_url');
    assert.strictEqual(payload.size, '1024x1024');
  });

  await testAsync('Seedream Adapter formats prompt and model identifier correctly', async () => {
    const config = getImageModelConfig('bytedance-seed/seedream-5.0-pro');
    const payload = await seedreamImageAdapter.preparePayload({
      prompt: 'Studio portrait with dramatic neon lighting',
      dimensions: { width: 768, height: 1344, aspect_ratio: '9:16' },
      referenceImages: [mockRefUrl],
      modelConfig: config
    });

    assert.strictEqual(payload.model, 'bytedance-seed/seedream-5.0-pro');
    assert.strictEqual(payload.aspect_ratio, '9:16');
    // After fix: Seedream adapter uses canonical input_references
    assert(Array.isArray(payload.input_references) && payload.input_references.length === 1);
    assert.strictEqual(payload.input_references[0].type, 'image_url');
  });

  await testAsync('Text-Only Adapter strips all reference images for meta/muse-image', async () => {
    const config = getImageModelConfig('meta/muse-image');
    const payload = await textOnlyImageAdapter.preparePayload({
      prompt: 'Abstract geometric oil painting',
      dimensions: { width: 1024, height: 1024, aspect_ratio: '1:1' },
      referenceImages: [mockRefUrl, mockRefUrl], // Accidental references
      modelConfig: config
    });

    assert.strictEqual(payload.model, 'meta/muse-image');
    assert.strictEqual(payload.image_url, undefined);
    assert.strictEqual(payload.reference_images, undefined);
    assert.strictEqual(payload.source_image, undefined);
    assert.strictEqual(payload.input_references, undefined, 'Text-only adapter must strip all image fields including input_references');
    assert.strictEqual(payload.prompt, 'Abstract geometric oil painting');
  });

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} STEP 1 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  console.log('================================================================\n');
}

runStep1Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
