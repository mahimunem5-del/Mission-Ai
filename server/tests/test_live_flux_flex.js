import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  routeAutoPreciseEditModel,
  resolvePreciseEditModel,
  resolvePreciseEditDisplayName
} from '../src/controllers/imageController.js';
import { getImageModelConfig } from '../src/config/imageModelRegistry.js';
import { getAdapter } from '../src/services/imageAdapters/index.js';

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

async function runLiveFluxFlexTest() {
  console.log('================================================================');
  console.log('🧪 LIVE FLUX.2 FLEX VERIFICATION TEST');
  console.log('================================================================');

  // 1. Verify Auto Routing
  const autoDecision = routeAutoPreciseEditModel('Change the jacket into a red biker jacket');
  console.log('1. Auto Routing Check (Clothing):', {
    model: autoDecision.model,
    modelName: autoDecision.modelName,
    reason: autoDecision.reason
  });
  if (autoDecision.model !== 'black-forest-labs/flux.2-flex') {
    throw new Error(`Auto routing failed: expected black-forest-labs/flux.2-flex, got ${autoDecision.model}`);
  }

  // 2. Verify Manual Resolution
  const manualModel = resolvePreciseEditModel('FLUX.2 Flex');
  const manualName = resolvePreciseEditDisplayName(manualModel);
  console.log('2. Manual Resolution Check:', { manualModel, manualName });
  if (manualModel !== 'black-forest-labs/flux.2-flex') {
    throw new Error(`Manual resolution failed: expected black-forest-labs/flux.2-flex, got ${manualModel}`);
  }

  // 3. Prepare Image Payload
  const imagePath = fs.existsSync('public/templates/editorial-portrait.jpg') 
    ? 'public/templates/editorial-portrait.jpg' 
    : path.resolve('public/templates/editorial-portrait.jpg');
  const imgBuf = fs.readFileSync(imagePath);
  const dataUrl = `data:image/jpeg;base64,${imgBuf.toString('base64')}`;

  const config = getImageModelConfig('black-forest-labs/flux.2-flex');
  const adapter = getAdapter(config);

  const payload = await adapter.preparePayload({
    prompt: 'Change attire into a sleek navy blue blazer, preserve identical subject identity and background',
    finalPrompt: 'Change attire into a sleek navy blue blazer, preserve identical subject identity and background',
    sourceImage: dataUrl,
    mode: 'precise-edit',
    modelConfig: config,
    dimensions: { width: 1024, height: 1024, aspect_ratio: '1:1' }
  });

  console.log('3. Constructed Payload Summary:');
  console.log('   Model:', payload.model);
  console.log('   Aspect Ratio:', payload.aspect_ratio);
  console.log('   Input References Count:', payload.input_references?.length);
  console.log('   First Ref Type:', payload.input_references?.[0]?.type);

  // 4. Live Call to OpenRouter /api/v1/images
  console.log('\n4. Executing live call to OpenRouter https://openrouter.ai/api/v1/images ...');
  const startTime = Date.now();

  const response = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ai-platform.studio',
      'X-Title': 'Precise Edit Studio'
    },
    body: JSON.stringify(payload)
  });

  const durationMs = Date.now() - startTime;
  console.log(`   Response Status: ${response.status} ${response.statusText} (${(durationMs / 1000).toFixed(2)}s)`);

  const responseData = await response.json();
  if (!response.ok) {
    console.error('   API Error Response:', JSON.stringify(responseData, null, 2));
    throw new Error(`OpenRouter API error ${response.status}: ${JSON.stringify(responseData)}`);
  }

  const images = adapter.parseResponse(responseData);
  console.log('5. Response Parse:');
  console.log('   Image Count:', images.length);
  if (images.length > 0) {
    const preview = images[0].startsWith('data:') ? images[0].slice(0, 60) + '...' : images[0];
    console.log('   Image Output (sample):', preview);
  }

  console.log('\n================================================================');
  console.log('🎉 LIVE FLUX.2 FLEX VERIFICATION SUCCESSFUL!');
  console.log('================================================================');
}

runLiveFluxFlexTest().catch(err => {
  console.error('\n❌ Live FLUX.2 Flex verification failed:', err.message);
  process.exit(1);
});
