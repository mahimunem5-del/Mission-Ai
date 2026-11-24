/**
 * Runtime Verification: Precise Edit Controller Execution & Upstream Dispatch
 *
 * Verifies the actual executePreciseEdit controller with all 8 scenarios:
 * 1. Auto + clothing edit -> routes to black-forest-labs/flux.2-flex
 * 2. Auto + style transfer -> routes to bytedance-seed/seedream-5-5
 * 3. Auto + lighting adjustment -> routes to google/gemini-3.1-flash-image-preview
 * 4. Auto + background replacement -> routes to bytedance-seed/seedream-5-5
 * 5. Auto + multiple reference images (>2 refs) -> routes to bytedance-seed/seedream-5-5
 * 6. Manual FLUX.2 Flex selection -> strictly black-forest-labs/flux.2-flex
 * 7. Manual Seedream selection -> strictly bytedance-seed/seedream-5-5
 * 8. Manual Nano Banana 2 selection -> strictly google/gemini-3.1-flash-image-preview
 *
 * Verifies:
 * - Concrete model ID reaching OpenRouter upstream payload is NEVER "auto".
 * - Upstream payload contains sanitized source and reference images.
 * - Returned response contains actualModelDisplayName, actualModelId, model, modelName.
 * - Result format produces "Precise Edit · [Actual Model Name] · Just now".
 */

import assert from 'assert';
import sharp from 'sharp';
import axios from 'axios';
import { executePreciseEdit } from '../src/controllers/imageController.js';

async function createValidTestImage(width = 64, height = 64, color = { r: 100, g: 150, b: 200, alpha: 1 }) {
  const buf = await sharp({
    create: { width, height, channels: 4, background: color }
  }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function runControllerRoutingTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING PRECISE EDIT CONTROLLER & DISPATCH VERIFICATION TESTS');
  console.log('================================================================\n');

  const sourceImage = await createValidTestImage(64, 64, { r: 50, g: 100, b: 150, alpha: 1 });
  const refImage1 = await createValidTestImage(64, 64, { r: 200, g: 50, b: 50, alpha: 1 });
  const refImage2 = await createValidTestImage(64, 64, { r: 50, g: 200, b: 50, alpha: 1 });
  const refImage3 = await createValidTestImage(64, 64, { r: 50, g: 50, b: 200, alpha: 1 });

  let passed = 0;
  let total = 0;

  // Intercept axios.post to inspect actual OpenRouter payload
  let lastDispatchedPayload = null;
  let lastDispatchedUrl = null;
  const originalAxiosPost = axios.post;

  axios.post = async function (url, payload, options) {
    // If it's an image generation call via chat/completions (e.g. Gemini 3.1 Flash Image)
    if (url.includes('/chat/completions') && Array.isArray(payload?.modalities) && payload.modalities.includes('image')) {
      lastDispatchedUrl = url;
      lastDispatchedPayload = payload;
      return {
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                images: [
                  {
                    type: 'image_url',
                    image_url: { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
                  }
                ]
              }
            }
          ]
        }
      };
    }

    // If it's the Mahi Engine prompt enhancement call to openrouter chat/completions
    if (url.includes('/chat/completions')) {
      return {
        data: {
          choices: [
            {
              message: {
                content: payload.messages?.[1]?.content?.[0]?.text || 'Enhanced detailed prompt'
              }
            }
          ]
        }
      };
    }

    // Image generation dispatch to /images
    lastDispatchedUrl = url;
    lastDispatchedPayload = payload;
    return {
      data: {
        created: Date.now(),
        data: [
          {
            b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          }
        ]
      }
    };
  };

  async function testScenario({ name, prompt, model, referenceImages = [], expectedModelId, expectedModelName, isAuto }) {
    total++;
    lastDispatchedPayload = null;
    lastDispatchedUrl = null;

    let responseStatusCode = 200;
    let responseData = null;

    const req = {
      id: `test_req_${Date.now()}`,
      body: {
        sourceImage,
        referenceImages,
        prompt,
        instructionPrompt: prompt,
        model,
        count: 1,
        variations: 1,
        aspectRatio: '1:1',
        isPreciseEdit: true,
        workflowTool: 'precise-edit'
      }
    };

    const res = {
      status(code) {
        responseStatusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    try {
      await executePreciseEdit(req, res);

      assert.strictEqual(responseStatusCode, 200, `Expected HTTP 200, got ${responseStatusCode}`);
      assert.ok(responseData, 'Expected response JSON data');
      assert.strictEqual(responseData.success, true, 'Expected response.success to be true');

      // 1. Verify concrete model dispatched upstream (NEVER "auto")
      assert.ok(lastDispatchedPayload, 'Expected upstream payload to be captured');
      assert.notStrictEqual(lastDispatchedPayload.model, 'auto', 'Dispatched model ID must NEVER be "auto"');
      assert.notStrictEqual(lastDispatchedPayload.model, 'Auto', 'Dispatched model ID must NEVER be "Auto"');
      assert.strictEqual(
        lastDispatchedPayload.model,
        expectedModelId,
        `Dispatched model should be ${expectedModelId}, got ${lastDispatchedPayload.model}`
      );

      // 2. Verify response metadata
      assert.strictEqual(responseData.model, expectedModelId);
      assert.strictEqual(responseData.modelName, expectedModelName);
      assert.strictEqual(responseData.actualModelId, expectedModelId);
      assert.strictEqual(responseData.actualModelDisplayName, expectedModelName);

      if (isAuto) {
        assert.strictEqual(responseData.routedBy, 'Auto');
        assert.ok(responseData.autoRoutingReason, 'Auto routing should provide a routing reason');
      } else {
        assert.strictEqual(responseData.routedBy, undefined, 'Manual selection should not have routedBy');
      }

      // 3. Verify Result Gallery format produces "Precise Edit · [Actual Model Name] · Just now"
      const galleryMetadataFormat = `Precise Edit · ${responseData.actualModelDisplayName} · Just now`;
      assert.strictEqual(
        galleryMetadataFormat,
        `Precise Edit · ${expectedModelName} · Just now`
      );
      assert(!galleryMetadataFormat.includes('Auto'), 'Result metadata must not display "Auto"');

      // 4. Verify input_references contains source and references
      assert.ok(Array.isArray(lastDispatchedPayload.input_references), 'input_references must be an array');
      assert(lastDispatchedPayload.input_references.length >= 1, 'input_references must contain at least sourceImage');
      const expectedRefsCount = Math.min(referenceImages.length, expectedModelId.includes('seedream') ? 10 : (expectedModelId.includes('flux') || expectedModelId.includes('krea') ? 4 : 2));
      assert.strictEqual(
        lastDispatchedPayload.input_references.length,
        1 + expectedRefsCount,
        `input_references length must equal 1 sourceImage + supported referenceImages (${1 + expectedRefsCount})`
      );

      console.log(`  ✅ [PASS] ${name}`);
      console.log(`         Dispatched Model: ${lastDispatchedPayload.model} (${expectedModelName})`);
      console.log(`         Metadata Format:  "${galleryMetadataFormat}"`);
      console.log(`         Payload Refs:     ${lastDispatchedPayload.input_references.length} item(s) (1 source + ${referenceImages.length} refs)\n`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`         Error: ${err.message}\n`);
      throw err;
    }
  }

  // --- 1. Auto + Clothing Edit ---
  await testScenario({
    name: '1. Auto + Clothing edit routes to FLUX.2 Flex',
    prompt: 'Change jacket into a sleek black leather biker jacket',
    model: 'auto',
    expectedModelId: 'black-forest-labs/flux.2-flex',
    expectedModelName: 'FLUX.2 Flex',
    isAuto: true
  });

  // --- 2. Auto + Style Transfer ---
  await testScenario({
    name: '2. Auto + Style transfer routes to Seedream 5.5',
    prompt: 'Transform into Japanese anime manga style illustration with bold cel shading',
    model: 'auto',
    expectedModelId: 'bytedance-seed/seedream-5-5',
    expectedModelName: 'Seedream 5.5',
    isAuto: true
  });

  // --- 3. Auto + Lighting Adjustment ---
  await testScenario({
    name: '3. Auto + Lighting adjustment routes to Nano Banana 2',
    prompt: 'Change the lighting to warm golden hour sunset illumination with soft ambient glow',
    model: 'auto',
    expectedModelId: 'google/gemini-3.1-flash-image-preview',
    expectedModelName: 'Nano Banana 2',
    isAuto: true
  });

  // --- 4. Auto + Background Replacement ---
  await testScenario({
    name: '4. Auto + Reference-guided background replacement routes to Seedream 5.5',
    prompt: 'Replace the background setting with this tropical beach backdrop',
    model: 'auto',
    referenceImages: [refImage1],
    expectedModelId: 'bytedance-seed/seedream-5-5',
    expectedModelName: 'Seedream 5.5',
    isAuto: true
  });

  // --- 5. Auto + Multiple Reference Images (>2 refs) ---
  await testScenario({
    name: '5. Auto + Multiple reference images (>2 refs) routes to Seedream 5.5',
    prompt: 'Add these elements and harmonize the style',
    model: 'auto',
    referenceImages: [refImage1, refImage2, refImage3],
    expectedModelId: 'bytedance-seed/seedream-5-5',
    expectedModelName: 'Seedream 5.5',
    isAuto: true
  });

  // --- 6. Manual FLUX.2 Flex Selection ---
  await testScenario({
    name: '6. Manual FLUX.2 Flex selection is strictly respected (never overridden)',
    prompt: 'Transform into watercolor style with sunset lighting', // prompt suggests seedream/gemini
    model: 'black-forest-labs/flux.2-flex',
    expectedModelId: 'black-forest-labs/flux.2-flex',
    expectedModelName: 'FLUX.2 Flex',
    isAuto: false
  });

  // --- 7. Manual Seedream Selection ---
  await testScenario({
    name: '7. Manual Seedream 5.5 selection is strictly respected (never overridden)',
    prompt: 'Change the jacket into a red leather coat', // prompt suggests krea
    model: 'bytedance-seed/seedream-5-5',
    expectedModelId: 'bytedance-seed/seedream-5-5',
    expectedModelName: 'Seedream 5.5',
    isAuto: false
  });

  // --- 8. Manual Nano Banana 2 Selection ---
  await testScenario({
    name: '8. Manual Nano Banana 2 selection is strictly respected (never overridden)',
    prompt: 'Change the character attire and replace background with 3 references', // prompt suggests krea/seedream
    model: 'google/gemini-3.1-flash-image-preview',
    referenceImages: [refImage1, refImage2, refImage3],
    expectedModelId: 'google/gemini-3.1-flash-image-preview',
    expectedModelName: 'Nano Banana 2',
    isAuto: false
  });

  // Restore original axios.post
  axios.post = originalAxiosPost;

  console.log('================================================================');
  console.log(`🎉 ALL ${passed}/${total} CONTROLLER ROUTING & DISPATCH TESTS PASSED!`);
  console.log('================================================================\n');
}

runControllerRoutingTests().catch(err => {
  console.error('Fatal error in controller routing tests:', err);
  process.exit(1);
});
