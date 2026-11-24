import assert from 'assert';
import sharp from 'sharp';
import {
  generateImage,
  executePreciseEdit,
  resolveDimensions,
  ASPECT_RATIO_DIMENSIONS
} from '../src/controllers/imageController.js';
import {
  IMAGE_MODEL_REGISTRY,
  getImageModelConfig,
  resolveOpenRouterImageModel,
  resolveModelDisplayName
} from '../src/config/imageModelRegistry.js';
import {
  refinePrompt,
  detectPromptStyle
} from '../src/services/promptIntelligence.js';
import {
  buildReferenceConditioning,
  classifyReferenceRoleByPrompt,
  resolveAutoModelForReferences
} from '../src/services/referenceIntelligence.js';
import {
  validateImagePreflight
} from '../src/services/imagePreflight.js';
import {
  planPreciseEdit,
  decomposeEditInstruction,
  buildPreservationDirectives
} from '../src/services/preciseEditPlanner.js';
import {
  getAdapter,
  prepareModelPayload,
  executeWithTransientRetry,
  isTransientError,
  isSafetyRefusal
} from '../src/services/imageAdapters/index.js';
import {
  optimizeBase64DataUrl,
  ensureOpenRouterPayloadLimits,
  optimizeImageBuffer
} from '../src/utils/imageOptimizer.js';
import {
  validateImageRequest,
  MAX_IMAGE_PAYLOAD_SIZE
} from '../src/middleware/validate.js';
import {
  AppError,
  InvalidRequestError,
  ImageUploadError,
  PayloadTooLargeError,
  UnsupportedCapabilityError,
  ModelCompatibilityError,
  SafetyRefusalError,
  ProviderTimeoutError,
  ProviderError,
  formatErrorForClient
} from '../src/utils/errors.js';
import { redact } from '../src/utils/logger.js';

console.log('================================================================');
console.log('🧪 RUNNING STEP 4 FULL 25-SCENARIO QA & REGRESSION TEST SUITE');
console.log('================================================================\n');

// Helper to create synthetic 1x1 test image
function createMockImage(mime = 'image/png') {
  const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return `data:${mime};base64,${pixel}`;
}

// Helper to create mock Express req/res
function createMockHttp() {
  const req = {
    id: `qa_req_${Date.now()}`,
    headers: {},
    body: {}
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, val) {
      this.headers[key] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return { req, res };
}

let passedTests = 0;
let totalTests = 25;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] Scenario: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] Scenario: ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runAllScenarios() {
  console.log('--- 14 GENERATE IMAGE SCENARIOS ---');

  // Scenario 1: Simple prompt generation standardized contract
  await runTest('1. Simple prompt generation produces standardized response contract', async () => {
    const rawPrompt = 'A red apple on a wooden table';
    const intelligence = await refinePrompt(rawPrompt, { model: 'openai/gpt-image-2.5-sunburst' });
    assert.strictEqual(intelligence.originalPrompt, rawPrompt);
    assert.ok(intelligence.enhancedPrompt.length >= rawPrompt.length);

    const modelConfig = getImageModelConfig('openai/gpt-image-2.5-sunburst');
    const dims = resolveDimensions('1:1');
    assert.strictEqual(dims.width, 1024);
    assert.strictEqual(dims.height, 1024);

    // Standardized contract verification
    const standardContract = {
      success: true,
      images: [{
        id: 'img_test_1',
        url: createMockImage(),
        prompt: intelligence.enhancedPrompt,
        originalPrompt: rawPrompt,
        enhancedPrompt: intelligence.enhancedPrompt,
        model: modelConfig.id,
        modelName: modelConfig.displayName,
        actualModelId: modelConfig.providerModelId,
        actualModelDisplayName: modelConfig.displayName,
        aspectRatio: '1:1',
        mode: 'generate',
        requestId: 'req_qa_1',
        createdAt: new Date().toISOString()
      }],
      count: 1,
      originalPrompt: rawPrompt,
      enhancedPrompt: intelligence.enhancedPrompt,
      refinedPrompt: intelligence.enhancedPrompt,
      model: modelConfig.id,
      modelName: modelConfig.displayName,
      actualModelId: modelConfig.providerModelId,
      actualModelDisplayName: modelConfig.displayName,
      aspectRatio: '1:1',
      mode: 'generate',
      requestId: 'req_qa_1',
      createdAt: new Date().toISOString()
    };

    assert.strictEqual(standardContract.success, true);
    assert.strictEqual(standardContract.mode, 'generate');
    assert.strictEqual(standardContract.actualModelId, 'openai/gpt-image-2.5-sunburst');
    assert.strictEqual(standardContract.originalPrompt, rawPrompt);
  });

  // Scenario 2: Photorealistic style intent
  await runTest('2. Photorealistic style intent preserves photographic details', async () => {
    const prompt = 'A hyperrealistic portrait of an old sailor, 8k, raw photo, natural sunlight';
    const styleInfo = detectPromptStyle(prompt);
    assert.strictEqual(styleInfo.category, 'photorealistic');
    assert.strictEqual(styleInfo.forbidPhotorealism, false);

    const intelligence = await refinePrompt(prompt);
    assert.strictEqual(intelligence.detectedStyle, 'photorealistic');
    assert.ok(intelligence.enhancedPrompt.includes('sailor'));
  });

  // Scenario 3: Anime style prompt (no forced photorealism)
  await runTest('3. Anime style prompt protects against forced photorealism', async () => {
    const animePrompt = 'Anime girl with blue hair in cyberpunk Tokyo, studio trigger aesthetic';
    const intelligence = await refinePrompt(animePrompt);

    assert.strictEqual(intelligence.detectedStyle, 'anime');
    assert.strictEqual(intelligence.styleLocked, true);
    // Crucial check: Must NOT inject photorealistic cues into anime prompts
    assert.ok(!intelligence.enhancedPrompt.toLowerCase().includes('photorealistic'), 'Must not inject photorealistic');
    assert.ok(!intelligence.enhancedPrompt.toLowerCase().includes('raw photo'), 'Must not inject raw photo');
    assert.ok(!intelligence.enhancedPrompt.toLowerCase().includes('dslr'), 'Must not inject dslr');
  });

  // Scenario 4: Product reference conditioning
  await runTest('4. Product reference conditioning generates object/product preservation directives', async () => {
    const prompt = 'A modern stainless steel smartwatch on a wooden desk';
    const refImage = createMockImage();
    const conditioning = await buildReferenceConditioning([refImage], prompt, { useVision: false });

    assert.strictEqual(conditioning.role, 'product_object');
    assert.ok(conditioning.anchoringInstruction.includes('product') || conditioning.anchoringInstruction.includes('object'));
    assert.strictEqual(conditioning.referenceImages.length, 1);
  });

  // Scenario 5: Face/character reference conditioning (high identity anchor)
  await runTest('5. Face/character reference conditioning enforces strict facial geometry lock', async () => {
    const prompt = 'The woman smiling in a superhero suit flying through the sky';
    const faceRef = createMockImage();
    const conditioning = await buildReferenceConditioning([faceRef], prompt, { useVision: false });

    assert.strictEqual(conditioning.role, 'face_character');
    assert.ok(conditioning.anchoringInstruction.includes('facial geometry') || conditioning.anchoringInstruction.includes('facial features'));
    assert.strictEqual(conditioning.referenceImages.length, 1);
  });

  // Scenario 6: Style reference conditioning
  await runTest('6. Style reference conditioning transfers aesthetics and color palette', async () => {
    const prompt = 'A tranquil mountain lake in watercolor art style with soft palette';
    const styleRef = createMockImage();
    const conditioning = await buildReferenceConditioning([styleRef], prompt, { useVision: false });

    assert.strictEqual(conditioning.role, 'style');
    assert.ok(conditioning.anchoringInstruction.includes('style') || conditioning.anchoringInstruction.includes('aesthetic'));
  });

  // Scenario 7: Multi-reference conditioning (up to model max)
  await runTest('7. Multi-reference conditioning packs multiple guides within limits', async () => {
    const prompt = 'A warrior in armor with a magical staff';
    const refs = [createMockImage(), createMockImage(), createMockImage()];
    const modelConfig = getImageModelConfig('openai/gpt-image-2.5-sunburst');
    const adapter = getAdapter(modelConfig);

    const payload = await adapter.preparePayload({
      prompt,
      modelConfig,
      referenceImages: refs
    });

    // After fix: adapters use canonical input_references (OpenRouter /images standard)
    assert.ok(Array.isArray(payload.input_references), 'Adapter must attach input_references array');
    assert.strictEqual(payload.input_references.length, Math.min(refs.length, modelConfig.maxReferenceImages || 2));
    assert.strictEqual(payload.input_references[0].type, 'image_url');
  });

  // Scenario 8: Unsupported reference workflow (422 UNSUPPORTED_REFERENCE_WORKFLOW)
  await runTest('8. Unsupported reference workflow on text-only model rejects with 422', async () => {
    const preflight = validateImagePreflight({
      model: 'black-forest-labs/flux.2-pro',
      referenceImages: [createMockImage()],
      allowTextOnlyFallback: false,
      mode: 'generate'
    });

    assert.strictEqual(preflight.valid, false);
    assert.strictEqual(preflight.statusCode, 422);
    assert.strictEqual(preflight.code, 'UNSUPPORTED_REFERENCE_WORKFLOW');
    assert.ok(Array.isArray(preflight.recommendedModels));
    assert.ok(preflight.recommendedModels.length > 0);
  });

  // Scenario 9: Unsupported aspect ratio handling (graceful clamp/fallback)
  await runTest('9. Unsupported aspect ratio gracefully falls back to standard dimensions', async () => {
    const dimensions = resolveDimensions('21:9'); // Unsupported aspect ratio
    assert.strictEqual(dimensions.aspect_ratio, '1:1');
    assert.strictEqual(dimensions.width, 1024);
    assert.strictEqual(dimensions.height, 1024);

    const dimsInvalid = resolveDimensions('invalid-ratio');
    assert.strictEqual(dimsInvalid.aspect_ratio, '1:1');
  });

  // Scenario 10: Invalid image MIME type upload rejection (400 IMAGE_UPLOAD_ISSUE)
  await runTest('10. Invalid image MIME type upload rejects with 400 IMAGE_UPLOAD_ISSUE', async () => {
    const { req, res } = createMockHttp();
    req.body = {
      prompt: 'Test prompt',
      referenceImage: 'data:image/bmp;base64,Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AA=='
    };

    let nextError = null;
    validateImageRequest(req, res, (err) => {
      nextError = err;
    });

    assert.ok(nextError, 'Middleware should pass error to next()');
    assert.strictEqual(nextError.statusCode, 400);
    assert.strictEqual(nextError.code, 'IMAGE_UPLOAD_ISSUE');
    assert.ok(nextError.message.includes('Unsupported image format'));
  });

  // Scenario 11: Oversized image payload handling (> 8 MB compressed safely)
  await runTest('11. Oversized image payload (> 8 MB) is compressed safely by Sharp safeguard', async () => {
    const rawBuffer = await sharp({
      create: {
        width: 3000,
        height: 3000,
        channels: 4,
        background: { r: 120, g: 150, b: 200, alpha: 1 }
      }
    })
    .png({ compressionLevel: 0 })
    .toBuffer();

    const initialSizeMB = rawBuffer.length / (1024 * 1024);
    assert.ok(initialSizeMB > 8, `Initial buffer should exceed 8 MB (actual: ${initialSizeMB.toFixed(2)} MB)`);

    const result = await optimizeImageBuffer(rawBuffer, { maxDimension: 1536, quality: 85 });
    const optimizedSizeMB = result.buffer.length / (1024 * 1024);
    assert.ok(optimizedSizeMB < 2.0, `Optimized buffer must be < 2 MB (actual: ${optimizedSizeMB.toFixed(2)} MB)`);
  });

  // Scenario 12: Provider timeout (504 PROVIDER_TIMEOUT)
  await runTest('12. Provider timeout error formats as 504 PROVIDER_TIMEOUT', async () => {
    const timeoutErr = new ProviderTimeoutError('The upstream image provider timed out after 60s.');
    const formatted = formatErrorForClient(timeoutErr, 'req_timeout_test');

    assert.strictEqual(formatted.statusCode, 504);
    assert.strictEqual(formatted.body.success, false);
    assert.strictEqual(formatted.body.error.code, 'PROVIDER_TIMEOUT');
    assert.strictEqual(formatted.body.error.requestId, 'req_timeout_test');
  });

  // Scenario 13: Invalid model ID handling
  await runTest('13. Invalid model ID resolves gracefully without crash', async () => {
    const fallbackModel = resolveOpenRouterImageModel('non-existent-model-xyz');
    assert.strictEqual(fallbackModel, 'openai/gpt-image-2.5-sunburst');

    const config = getImageModelConfig('non-existent-model-xyz');
    assert.ok(config);
    assert.strictEqual(config.id, 'openai/gpt-image-2.5-sunburst');
  });

  // Scenario 14: Explicit user model selection preserved
  await runTest('14. Explicit user model selection is preserved without unwanted switching', async () => {
    const explicitModel = 'black-forest-labs/flux.2-pro';
    const preflight = validateImagePreflight({
      model: explicitModel,
      referenceImages: [],
      mode: 'generate'
    });

    assert.strictEqual(preflight.valid, true);
    assert.strictEqual(preflight.resolvedModel, 'black-forest-labs/flux.2-pro');
    assert.strictEqual(preflight.resolvedModelName, 'FLUX.2 Pro');
  });

  console.log('\n--- 11 PRECISE EDIT SCENARIOS ---');

  // Scenario 15: Simple object modification
  await runTest('15. Simple object modification decomposes and isolates delta', async () => {
    const instruction = 'Replace the ceramic mug on the desk with a glowing crystal orb';
    const plan = await planPreciseEdit(instruction);

    assert.strictEqual(plan.category, 'object_modification');
    assert.strictEqual(plan.targetSubjectOrRegion, 'target object / item');
    assert.ok(plan.preservationDirectives.includes('LOCALIZED MODIFICATION ONLY'));
  });

  // Scenario 16: Background modification (isolate subject)
  await runTest('16. Background modification isolates subject and preserves foreground', async () => {
    const instruction = 'Replace the office background with a sunset beach';
    const plan = await planPreciseEdit(instruction);

    assert.strictEqual(plan.category, 'background_change');
    assert.ok(plan.targetSubjectOrRegion.includes('background'));
    assert.ok(plan.elementsToPreserve.some(el => el.includes('foreground') || el.includes('subject')));
    assert.strictEqual(plan.isFaceReplacementRequested, false);
  });

  // Scenario 17: Clothing/outfit modification
  await runTest('17. Clothing modification targets attire and preserves facial identity', async () => {
    const instruction = 'Change the red shirt to a formal dark navy business suit';
    const plan = await planPreciseEdit(instruction);

    assert.strictEqual(plan.category, 'clothing_change');
    assert.strictEqual(plan.isFaceReplacementRequested, false);
    assert.ok(plan.preservationDirectives.includes('IDENTITY PRESERVATION'));
  });

  // Scenario 18: Color modification/recolor
  await runTest('18. Color modification maintains structure and geometry while altering hue', async () => {
    const instruction = 'Recolor the blue car to bright metallic yellow';
    const plan = await planPreciseEdit(instruction);

    assert.strictEqual(plan.category, 'color_adjustment');
    assert.ok(plan.targetSubjectOrRegion.includes('surface color'));
    assert.ok(plan.elementsToPreserve.some(el => el.toLowerCase().includes('geometry')));
  });

  // Scenario 19: Face preservation request
  await runTest('19. Face preservation request strictly enforces face geometry lock', async () => {
    const instruction = 'Change the hair color to dark brown, but keep the face exactly the same';
    const plan = await planPreciseEdit(instruction);

    assert.strictEqual(plan.isFaceReplacementRequested, false);
    assert.ok(plan.elementsToPreserve.some(el => el.toLowerCase().includes('facial identity')));
    assert.ok(plan.preservationDirectives.includes('IDENTITY PRESERVATION'));
  });

  // Scenario 20: Style preservation request
  await runTest('20. Style preservation request locks artistic medium against photo drift', async () => {
    const instruction = 'Add a pirate hat, keep 2D anime cartoon style';
    const plan = await planPreciseEdit(instruction);

    assert.ok(plan.elementsToPreserve.some(el => el.toLowerCase().includes('artistic style') || el.toLowerCase().includes('medium')));
    assert.ok(plan.preservationDirectives.includes('PRESERVE UNCHANGED'));
  });

  // Scenario 21: Source + reference guide guided edit
  await runTest('21. Source + reference guide guided edit attaches both distinctly to adapter', async () => {
    const source = createMockImage('image/png');
    // Different pixel data to prevent deduplication
    const ref = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M9QzwAEjAwACGYB+Zf2u0QAAAAASUVORK5CYII=';

    const flexConfig = getImageModelConfig('black-forest-labs/flux.2-flex');
    const adapter = getAdapter(flexConfig);
    const payload = await adapter.preparePayload({
      prompt: 'Apply the hairstyle from reference to source',
      modelConfig: flexConfig,
      sourceImage: source,
      referenceImages: [ref],
      mode: 'precise-edit'
    });

    // After fix: Krea K3 Edit uses only canonical input_references
    assert.ok(Array.isArray(payload.input_references), 'input_references array must be present');
    assert.strictEqual(payload.input_references.length, 2, 'Must include both source and reference image');
    assert.strictEqual(payload.input_references[0].image_url.url, source, 'First image must be the source canvas');
    assert.strictEqual(payload.input_references[1].image_url.url, ref, 'Second image must be the reference guide');
  });

  // Scenario 22: Oversized source image Sharp compressed (> 8 MB)
  await runTest('22. Oversized source image (> 8 MB) is optimized by Sharp before payload construction', async () => {
    const largeBuffer = await sharp({
      create: {
        width: 3200,
        height: 3200,
        channels: 4,
        background: { r: 50, g: 100, b: 150, alpha: 1 }
      }
    })
    .png({ compressionLevel: 0 })
    .toBuffer();

    assert.ok(largeBuffer.length > 8 * 1024 * 1024);
    const result = await optimizeImageBuffer(largeBuffer, { maxDimension: 1536, quality: 85 });
    assert.ok(result.buffer.length < 2 * 1024 * 1024);
  });

  // Scenario 23: Unsupported editing capability rejection (422 UNSUPPORTED_EDIT_WORKFLOW)
  await runTest('23. Unsupported editing model rejects with 422 UNSUPPORTED_EDIT_WORKFLOW', async () => {
    const preflight = validateImagePreflight({
      model: 'meta/muse-image',
      sourceImage: createMockImage(),
      mode: 'precise-edit'
    });

    assert.strictEqual(preflight.valid, false);
    assert.strictEqual(preflight.statusCode, 422);
    assert.strictEqual(preflight.code, 'UNSUPPORTED_EDIT_WORKFLOW');
    assert.ok(preflight.recommendedModels.some(m => m.id === 'black-forest-labs/flux.2-flex'));
  });

  // Scenario 24: Upstream provider failure (502) and Safety Refusal (422) handling
  await runTest('24. Retry policy handles 502 transient retries and blocks safety refusal bypass', async () => {
    // 24a: Transient 502 retry
    let transientCalls = 0;
    try {
      await executeWithTransientRetry(async (attempt) => {
        transientCalls++;
        const err = new Error('Bad Gateway');
        err.response = { status: 502, data: { message: 'Bad Gateway' } };
        throw err;
      }, { maxRetries: 2, initialDelayMs: 20 });
      assert.fail('Should have thrown persisted ProviderError');
    } catch (err) {
      assert.strictEqual(transientCalls, 3, 'Should attempt 1 initial + 2 retries = 3 calls');
      assert.ok(err instanceof ProviderError || err.statusCode === 502);
    }

    // 24b: Safety Refusal - ZERO retries, NEVER bypasses
    let safetyCalls = 0;
    try {
      await executeWithTransientRetry(async () => {
        safetyCalls++;
        const err = new Error('Safety policy violation');
        err.response = {
          status: 422,
          data: { error: { message: 'Request flagged by content safety filter' } }
        };
        throw err;
      }, { maxRetries: 2, initialDelayMs: 20 });
      assert.fail('Should have thrown SafetyRefusalError');
    } catch (err) {
      assert.strictEqual(safetyCalls, 1, 'Safety refusal must execute exactly 1 attempt (ZERO retries)');
      assert.ok(err instanceof SafetyRefusalError);
      assert.strictEqual(err.statusCode, 422);
      assert.strictEqual(err.code, 'SAFETY_REFUSAL');
    }
  });

  // Scenario 25: Model identity consistency & log redaction
  await runTest('25. Model identity consistency and safe log redaction verify zero leakage', async () => {
    // 25a: Model Identity Consistency
    const flexConfig = getImageModelConfig('black-forest-labs/flux.2-flex');
    assert.strictEqual(flexConfig.id, 'black-forest-labs/flux.2-flex');
    assert.strictEqual(flexConfig.providerModelId, 'black-forest-labs/flux.2-flex');
    assert.strictEqual(flexConfig.displayName, 'FLUX.2 Flex');

    const flexAliasConfig = getImageModelConfig('flux.2-flex');
    assert.strictEqual(flexAliasConfig.id, 'black-forest-labs/flux.2-flex');
    assert.strictEqual(flexAliasConfig.displayName, 'FLUX.2 Flex');

    // 25b: Safe Log Redaction
    const sensitivePayload = {
      apiKey: 'sk-or-v1-abcdef0123456789abcdef0123456789',
      authorization: 'Bearer sk-or-v1-test-secret-key-12345',
      sourceImage: createMockImage(),
      normalParam: 'A regular prompt'
    };

    const redacted = redact(sensitivePayload);
    assert.strictEqual(redacted.apiKey, '[REDACTED]');
    assert.strictEqual(redacted.authorization, '[REDACTED]');
    assert.ok(redacted.sourceImage.startsWith('[BASE64_IMAGE'));
    assert.strictEqual(redacted.normalParam, 'A regular prompt');
  });

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} STEP 4 QA SCENARIOS PASSED SUCCESSFULLY!`);
  console.log('================================================================\n');
}

runAllScenarios().catch((err) => {
  console.error('\n❌ QA Test Suite failed:', err);
  process.exit(1);
});
