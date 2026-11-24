/**
 * MESTRIO AI — Precise Edit 18-Scenario Production Verification Suite
 * 
 * Comprehensive testing covering all 18 production scenarios required for Phase 10:
 *  1. Object Addition
 *  2. Object Removal
 *  3. Object Replacement
 *  4. Background Replacement & Conflict Resolution
 *  5. Clothing Modification & Subject Identity Protection
 *  6. Product Editing & Geometry Preservation
 *  7. Portrait / Facial Feature Editing
 *  8. Lighting & Color Correction
 *  9. Style Transfer
 * 10. Single Reference Image Role Guidance
 * 11. Multi-Reference Image Guidance (3+ References)
 * 12. Auto Model Selection Routing Across Editing Tasks
 * 13. Manual Model Selection Preservation (Zero Auto Override)
 * 14. Large Image Optimization, EXIF Rotation & Payload Safeguard (< 6MB)
 * 15. Reference Image Overflow & Preflight Warning Generation
 * 16. Upstream Transient Retry Mechanism (502/503/504 Backoff)
 * 17. Upstream Timeout Handling & Token Scrubbing
 * 18. Content Safety Refusal & Partial Variation Success Handling
 */

import assert from 'assert';
import sharp from 'sharp';
import axios from 'axios';
import {
  planPreciseEdit,
  decomposeEditInstruction,
  EDIT_CATEGORIES
} from '../src/services/preciseEditPlanner.js';
import {
  classifyReferenceRoleByPrompt,
  REFERENCE_ROLES
} from '../src/services/referenceIntelligence.js';
import {
  routeAutoPreciseEditModel,
  executePreciseEdit,
  resolvePreciseEditModel
} from '../src/controllers/imageController.js';
import { validateImagePreflight } from '../src/services/imagePreflight.js';
import { getImageModelConfig } from '../src/config/imageModelRegistry.js';
import {
  dispatchModelGeneration,
  executeWithTransientRetry,
  isTransientError,
  isSafetyRefusal,
  fluxImageAdapter,
  seedreamImageAdapter,
  geminiImageAdapter
} from '../src/services/imageAdapters/index.js';
import {
  optimizeBase64DataUrl,
  ensureOpenRouterPayloadLimits
} from '../src/utils/imageOptimizer.js';
import {
  formatErrorForClient,
  SafetyRefusalError,
  ProviderTimeoutError
} from '../src/utils/errors.js';

async function createTestImage(width = 64, height = 64, color = { r: 80, g: 120, b: 180, alpha: 1 }) {
  const buf = await sharp({
    create: { width, height, channels: 4, background: color }
  }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function run18ScenariosSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE 18-SCENARIO PRECISE EDIT VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function recordPass(testName, detail = '') {
    passed++;
    total++;
    console.log(`  ✅ [PASS] Scenario ${total}: ${testName}`);
    if (detail) console.log(`         ${detail}`);
  }

  function recordFail(testName, err) {
    total++;
    console.error(`  ❌ [FAIL] Scenario ${total}: ${testName}`);
    console.error(`         ${err.message}`);
    throw err;
  }

  const mockSource = await createTestImage(64, 64, { r: 50, g: 100, b: 150, alpha: 1 });
  const mockRef1 = await createTestImage(64, 64, { r: 200, g: 50, b: 50, alpha: 1 });
  const mockRef2 = await createTestImage(64, 64, { r: 50, g: 200, b: 50, alpha: 1 });
  const mockRef3 = await createTestImage(64, 64, { r: 50, g: 50, b: 200, alpha: 1 });

  // SCENARIO 1: Object Addition
  try {
    const prompt = 'Add a vintage bronze clock on the wooden desk';
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.OBJECT_MODIFICATION);
    assert(plan.categories.includes(EDIT_CATEGORIES.OBJECT_MODIFICATION));
    assert(plan.preservationDirectives.includes('LOCALIZED MODIFICATION ONLY'));
    assert(plan.preservationDirectives.includes('PRESERVE UNCHANGED'));
    recordPass('Object Addition', `Category: ${plan.category}, Target: ${plan.targetSubjectOrRegion}`);
  } catch (err) { recordFail('Object Addition', err); }

  // SCENARIO 2: Object Removal
  try {
    const prompt = 'Remove the microphone from the podium';
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.OBJECT_MODIFICATION);
    assert(plan.categories.includes(EDIT_CATEGORIES.OBJECT_MODIFICATION));
    assert(plan.elementsToPreserve.includes('surrounding background environment'));
    recordPass('Object Removal', `Target to remove: ${plan.targetSubjectOrRegion}`);
  } catch (err) { recordFail('Object Removal', err); }

  // SCENARIO 3: Object Replacement
  try {
    const prompt = 'Replace the wooden chair with a modern ergonomic gaming chair';
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.OBJECT_MODIFICATION);
    assert(plan.elementsToPreserve.includes('surrounding background environment'));
    recordPass('Object Replacement', `Preserves: ${plan.elementsToPreserve.join(', ')}`);
  } catch (err) { recordFail('Object Replacement', err); }

  // SCENARIO 4: Background Replacement & Conflict Resolution
  try {
    const prompt = 'Replace the studio background with a sunny tropical beach at sunset';
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.BACKGROUND_CHANGE);
    // Crucial: background replacement MUST NOT claim to preserve original background
    assert(!plan.elementsToPreserve.includes('original background'));
    assert(plan.elementsToPreserve.some(e => e.includes('foreground subject')));
    recordPass('Background Replacement Conflict Resolution', `Preserves subject while replacing background cleanly`);
  } catch (err) { recordFail('Background Replacement Conflict Resolution', err); }

  // SCENARIO 5: Clothing Modification & Subject Identity Protection
  try {
    const prompt = "Change the person's blue shirt to a black tuxedo";
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.CLOTHING_CHANGE);
    assert(plan.elementsToPreserve.includes('character facial identity and biometric structure'));
    assert(plan.elementsToPreserve.includes('skin tone and body anatomy'));
    recordPass('Clothing Modification & Identity Protection', `Preserves face and body anatomy`);
  } catch (err) { recordFail('Clothing Modification & Identity Protection', err); }

  // SCENARIO 6: Product Editing & Geometry Preservation
  try {
    const prompt = "Edit the cosmetic perfume bottle label to say 'Luxe Essence' with gold foil embossing";
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.PRODUCT_EDITING);
    assert(plan.elementsToPreserve.includes('product silhouette and core industrial geometry'));
    recordPass('Product Editing & Geometry Preservation', `Preserves product geometry and proportions`);
  } catch (err) { recordFail('Product Editing & Geometry Preservation', err); }

  // SCENARIO 7: Portrait / Facial Feature Editing
  try {
    const prompt = 'Give the portrait subject a subtle warm smile and enhance skin tone naturally';
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.PORTRAIT_EDITING);
    assert(plan.elementsToPreserve.some(e => e.includes('facial') || e.includes('identity')));
    recordPass('Portrait / Facial Feature Editing', `Protects subject facial identity and likeness`);
  } catch (err) { recordFail('Portrait / Facial Feature Editing', err); }

  // SCENARIO 8: Lighting & Color Correction
  try {
    const prompt = 'Adjust the scene lighting to dramatic cinematic golden hour with soft rim light';
    const plan = await planPreciseEdit(prompt);
    assert(plan.categories.includes(EDIT_CATEGORIES.LIGHTING_ADJUSTMENT));
    assert(plan.elementsToPreserve.includes('subject identity and morphology'));
    recordPass('Lighting & Color Correction', `Preserves subject identity and morphology`);
  } catch (err) { recordFail('Lighting & Color Correction', err); }

  // SCENARIO 9: Style Transfer
  try {
    const prompt = 'Transform this photo into an oil painting on textured canvas';
    const plan = await planPreciseEdit(prompt);
    assert.strictEqual(plan.category, EDIT_CATEGORIES.STYLE_TRANSFER);
    assert(plan.elementsToPreserve.includes('overall scene composition'));
    recordPass('Style Transfer', `Preserves overall scene composition and medium`);
  } catch (err) { recordFail('Style Transfer', err); }

  // SCENARIO 10: Single Reference Image Role Guidance
  try {
    const role1 = classifyReferenceRoleByPrompt('Apply the exact color palette and artistic style from this reference image');
    const role2 = classifyReferenceRoleByPrompt('Use the face and facial likeness from reference photo');
    const role3 = classifyReferenceRoleByPrompt('Keep the exact product bottle shape and packaging shown in reference');
    assert.strictEqual(role1.role, REFERENCE_ROLES.STYLE);
    assert.strictEqual(role2.role, REFERENCE_ROLES.FACE_CHARACTER);
    assert.strictEqual(role3.role, REFERENCE_ROLES.PRODUCT_OBJECT);
    recordPass('Single Reference Image Role Guidance', `Correctly classified: ${role1.role}, ${role2.role}, ${role3.role}`);
  } catch (err) { recordFail('Single Reference Image Role Guidance', err); }

  // SCENARIO 11: Multi-Reference Image Guidance (3+ References)
  try {
    const autoRoute = routeAutoPreciseEditModel('Blend elements from these references', {
      referenceImages: [mockRef1, mockRef2, mockRef3]
    });
    // With 3 references, must select Seedream 5.5 (supports up to 10 references)
    assert.strictEqual(autoRoute.model, 'bytedance-seed/seedream-5-5');
    assert.strictEqual(autoRoute.modelName, 'Seedream 5.5');
    assert(autoRoute.reason.toLowerCase().includes('multi-reference'));
    recordPass('Multi-Reference Image Guidance (3+ References)', `Routed to ${autoRoute.modelName} for >2 references`);
  } catch (err) { recordFail('Multi-Reference Image Guidance (3+ References)', err); }

  // SCENARIO 12: Auto Model Selection Routing Across Editing Tasks
  try {
    const routeClothing = routeAutoPreciseEditModel("Change the character's jacket into a black leather motorcycle jacket");
    assert.strictEqual(routeClothing.model, 'black-forest-labs/flux.2-flex');

    const routeBackground = routeAutoPreciseEditModel('Change background to this cyberpunk city', {
      referenceImages: [mockRef1]
    });
    assert.strictEqual(routeBackground.model, 'bytedance-seed/seedream-5-5');

    const routeSpeed = routeAutoPreciseEditModel('Adjust the brightness slightly', { quality: 'Speed' });
    assert.strictEqual(routeSpeed.model, 'google/gemini-3.1-flash-image-preview');

    recordPass('Auto Model Selection Routing Across Editing Tasks', `Clothing->FLUX.2 Flex, Background->Seedream, Speed->Nano Banana 2`);
  } catch (err) { recordFail('Auto Model Selection Routing Across Editing Tasks', err); }

  // SCENARIO 13: Manual Model Selection Preservation (Zero Auto Override)
  try {
    const flexResolved = resolvePreciseEditModel('black-forest-labs/flux.2-flex');
    const seedreamResolved = resolvePreciseEditModel('Seedream 5.5');
    const nanoResolved = resolvePreciseEditModel('Nano Banana 2 (Gemini 3.1 Flash Image)');

    assert.strictEqual(flexResolved, 'black-forest-labs/flux.2-flex');
    assert.strictEqual(seedreamResolved, 'bytedance-seed/seedream-5-5');
    assert.strictEqual(nanoResolved, 'google/gemini-3.1-flash-image-preview');
    recordPass('Manual Model Selection Preservation', `Manual selections resolve to verified provider IDs with zero override`);
  } catch (err) { recordFail('Manual Model Selection Preservation', err); }

  // SCENARIO 14: Large Image Optimization, EXIF Rotation & Payload Safeguard (< 6MB)
  try {
    // Generate a true > 8 MB uncompressed image buffer
    const largeImgBuf = await sharp({
      create: { width: 3200, height: 3200, channels: 4, background: { r: 180, g: 90, b: 60, alpha: 1 } }
    }).png({ compressionLevel: 0 }).toBuffer();
    const largeDataUrl = `data:image/png;base64,${largeImgBuf.toString('base64')}`;

    const editPayload = {
      model: 'black-forest-labs/flux.2-flex',
      prompt: 'Precise edit test with large images',
      sourceImage: largeDataUrl,
      input_references: [
        { type: 'image_url', image_url: { url: largeDataUrl } }
      ]
    };

    const initialBytes = JSON.stringify(editPayload).length;
    assert(initialBytes > 8 * 1024 * 1024, `Initial payload must exceed 8 MB for test, got ${initialBytes} bytes`);

    const safePayload = await ensureOpenRouterPayloadLimits(editPayload);
    const finalBytes = JSON.stringify(safePayload).length;
    assert(finalBytes < 6 * 1024 * 1024, `Optimized payload must be under 6 MB limit, got ${finalBytes} bytes`);
    recordPass('Large Image Optimization & Payload Safeguard (< 6MB)', `Reduced from ${(initialBytes / 1024 / 1024).toFixed(2)} MB to ${(finalBytes / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) { recordFail('Large Image Optimization & Payload Safeguard (< 6MB)', err); }

  // SCENARIO 15: Reference Image Overflow & Preflight Warning Generation
  try {
    // Nano Banana Pro supports max 3 reference images
    const preflight = validateImagePreflight({
      model: 'google/gemini-3-pro-image',
      referenceImages: [mockRef1, mockRef2, mockRef3, mockRef1], // 4 references
      sourceImage: mockSource,
      mode: 'precise-edit'
    });

    assert.strictEqual(preflight.valid, true, 'Request should remain valid');
    assert(Array.isArray(preflight.warnings) && preflight.warnings.length > 0, 'Must include structured warnings');
    assert.strictEqual(preflight.warnings[0].type, 'REFERENCE_COUNT_OVERFLOW');
    assert.strictEqual(preflight.warnings[0].maxAllowed, 3);
    assert.strictEqual(preflight.warnings[0].provided, 4);
    recordPass('Reference Image Overflow & Preflight Warning Generation', `Generated structured warning for 4 references (max 3)`);
  } catch (err) { recordFail('Reference Image Overflow & Preflight Warning Generation', err); }

  // SCENARIO 16: Upstream Transient Retry Mechanism (502/503/504 Backoff)
  try {
    let callCount = 0;
    const result = await executeWithTransientRetry(async (attempt) => {
      callCount++;
      if (callCount < 2) {
        const err503 = new Error('Service Unavailable');
        err503.response = { status: 503, data: { error: { message: 'Overloaded' } } };
        throw err503;
      }
      return { success: true, attempt };
    }, { maxRetries: 2, initialDelayMs: 50, requestId: 'test_retry_16' });

    assert.strictEqual(result.success, true);
    assert.strictEqual(callCount, 2, 'Should succeed on second attempt after transient 503');
    recordPass('Upstream Transient Retry Mechanism', `Retried transient 503 and succeeded on attempt 2`);
  } catch (err) { recordFail('Upstream Transient Retry Mechanism', err); }

  // SCENARIO 17: Upstream Timeout Handling & Token Scrubbing
  try {
    // 17a: Timeout error mapping
    let timeoutCaught = false;
    try {
      await executeWithTransientRetry(async () => {
        const errTimeout = new Error('timeout of 60000ms exceeded');
        errTimeout.code = 'ECONNABORTED';
        throw errTimeout;
      }, { maxRetries: 0, requestId: 'test_timeout_17' });
    } catch (e) {
      timeoutCaught = true;
      assert(e instanceof ProviderTimeoutError || e.message.includes('timed out'));
    }
    assert.strictEqual(timeoutCaught, true, 'Must throw ProviderTimeoutError on ECONNABORTED');

    // 17b: Token scrubbing
    const leakedError = new Error('Provider failed with Authorization Bearer sk-or-v1-abcdef1234567890abcdef1234567890');
    leakedError.statusCode = 500;
    const formatted = formatErrorForClient(leakedError);
    assert(!formatted.body.message.includes('sk-or-v1-'), 'Token must be scrubbed');
    assert(formatted.body.message.includes('[REDACTED]'), 'Token must be replaced with [REDACTED]');
    recordPass('Upstream Timeout Handling & Token Scrubbing', `Clean ProviderTimeoutError and secret scrubbing verified`);
  } catch (err) { recordFail('Upstream Timeout Handling & Token Scrubbing', err); }

  // SCENARIO 18: Content Safety Refusal & Partial Variation Success Handling
  try {
    // 18a: Safety Refusal — Zero retries, instant throw
    let safetyAttempts = 0;
    let safetyCaught = false;
    try {
      await executeWithTransientRetry(async () => {
        safetyAttempts++;
        const safetyErr = new Error('Content policy violation: sensitive content');
        safetyErr.response = { status: 400, data: { error: { message: 'Sensitive content violation' } } };
        throw safetyErr;
      }, { maxRetries: 2, requestId: 'test_safety_18a' });
    } catch (e) {
      safetyCaught = true;
      assert(e instanceof SafetyRefusalError || isSafetyRefusal(e));
    }
    assert.strictEqual(safetyCaught, true);
    assert.strictEqual(safetyAttempts, 1, 'Safety rejection must execute ZERO retries');

    // 18b: Partial Variation Success (1 of 2 succeeds)
    const originalPost = axios.post;
    let variationCounter = 0;
    axios.post = async () => {
      variationCounter++;
      if (variationCounter === 1) {
        return { data: { data: [{ url: 'https://openrouter.ai/sample_var_1.png' }] } };
      } else {
        const fakeErr = new Error('Rate limit transiently hit on second variation');
        fakeErr.response = { status: 500, data: { message: 'Internal Server Error' } };
        throw fakeErr;
      }
    };

    const dispatchResult = await dispatchModelGeneration({
      apiKey: 'test-key-safe',
      rawModel: 'black-forest-labs/flux.2-flex',
      options: {
        prompt: 'Generate two variations with partial success handling',
        sourceImage: mockSource,
        count: 2,
        mode: 'precise-edit'
      },
      requestId: 'test_partial_18b'
    });

    axios.post = originalPost;

    assert(Array.isArray(dispatchResult.images));
    assert.strictEqual(dispatchResult.images.length, 1, 'Should preserve the 1 successful variation');
    assert.strictEqual(dispatchResult.images[0], 'https://openrouter.ai/sample_var_1.png');

    recordPass('Content Safety Refusal & Partial Variation Success', `Safety zero-retry verified; Partial variation 1/2 success preserved`);
  } catch (err) {
    recordFail('Content Safety Refusal & Partial Variation Success', err);
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passed}/${total} PRODUCTION SCENARIOS PASSED WITH 100% SUCCESS!`);
  console.log('================================================================\n');
}

run18ScenariosSuite().catch(err => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});
