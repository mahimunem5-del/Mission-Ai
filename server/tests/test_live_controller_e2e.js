import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { executePreciseEdit } from '../src/controllers/imageController.js';

dotenv.config();

async function testLiveControllerE2E() {
  console.log('================================================================');
  console.log('🧪 LIVE CONTROLLER END-TO-END VERIFICATION: executePreciseEdit');
  console.log('================================================================');

  const imagePath = fs.existsSync('public/templates/editorial-portrait.jpg')
    ? 'public/templates/editorial-portrait.jpg'
    : path.resolve('public/templates/editorial-portrait.jpg');

  const imgBuf = fs.readFileSync(imagePath);
  const sourceImage = `data:image/jpeg;base64,${imgBuf.toString('base64')}`;

  const req = {
    id: `live_e2e_${Date.now()}`,
    headers: {},
    body: {
      sourceImage,
      instructionPrompt: 'Change the jacket to a navy blue formal blazer, keep face and background identical',
      prompt: 'Change the jacket to a navy blue formal blazer, keep face and background identical',
      model: 'auto', // Testing Auto mode in live controller
      variations: 1,
      aspectRatio: '1:1',
      quality: 'Medium'
    }
  };

  let statusCode = 200;
  let jsonResult = null;

  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResult = data;
      return res;
    }
  };

  const startTime = Date.now();
  console.log('Invoking executePreciseEdit with Auto mode + clothing prompt...');
  await executePreciseEdit(req, res);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`Controller Execution Status: ${statusCode} in ${duration}s`);
  if (jsonResult) {
    console.log('Response Success:', jsonResult.success);
    console.log('Selected Model:', jsonResult.model);
    console.log('Model Name:', jsonResult.modelName);
    console.log('Actual Model ID:', jsonResult.actualModelId);
    console.log('Actual Display Name:', jsonResult.actualModelDisplayName);
    console.log('Routed By:', jsonResult.routedBy);
    console.log('Image Count:', jsonResult.images?.length);
    if (jsonResult.images?.[0]) {
      console.log('First Image Model:', jsonResult.images[0].model);
      console.log('First Image Model Name:', jsonResult.images[0].modelName);
      console.log('Sample Image Data:', jsonResult.images[0].url?.slice(0, 50) + '...');
    }
  }

  console.log('\n================================================================');
  console.log('🎉 CONTROLLER END-TO-END EXECUTION COMPLETE');
  console.log('================================================================');
}

testLiveControllerE2E().catch(err => {
  console.error('Controller E2E Test Error:', err);
  process.exit(1);
});
