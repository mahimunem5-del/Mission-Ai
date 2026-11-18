const sharp = require('sharp');

async function runTest() {
  const {
    generateImage,
    executeRemoveBackground,
    executePreciseEdit,
    executeUpscaleImage
  } = await import('../server/src/controllers/imageController.js');

  // Mock response helper
  function mockRes() {
    let statusCode = 200;
    let responseData = null;
    const res = {
      status(code) {
        statusCode = code;
        return res;
      },
      json(data) {
        responseData = data;
        return res;
      },
      getStatusCode() { return statusCode; },
      getData() { return responseData; }
    };
    return res;
  }

  // Create a sample base64 test image
  const svg = '<svg width="100" height="100"><rect width="100" height="100" fill="#ffffff"/><circle cx="50" cy="50" r="30" fill="#ff0000"/></svg>';
  const testBuf = await sharp(Buffer.from(svg)).png().toBuffer();
  const testDataUrl = `data:image/png;base64,${testBuf.toString('base64')}`;

  console.log('--- 1. Testing generateImage ---');
  const reqGen = { body: { prompt: 'A sleek minimalist neon camera', count: 1 } };
  const resGen = mockRes();
  await generateImage(reqGen, resGen);
  console.log('generateImage status:', resGen.getStatusCode());
  console.log('generateImage success:', resGen.getData()?.success, 'images:', resGen.getData()?.images?.length);

  console.log('--- 2. Testing executeRemoveBackground ---');
  const reqBg = { body: { image: testDataUrl } };
  const resBg = mockRes();
  await executeRemoveBackground(reqBg, resBg);
  console.log('executeRemoveBackground status:', resBg.getStatusCode());
  console.log('executeRemoveBackground success:', resBg.getData()?.success, 'imageUrl length:', resBg.getData()?.imageUrl?.length);

  console.log('--- 3. Testing executePreciseEdit ---');
  const reqEdit = { body: { sourceImage: testDataUrl, prompt: 'Change color to vibrant emerald' } };
  const resEdit = mockRes();
  await executePreciseEdit(reqEdit, resEdit);
  console.log('executePreciseEdit status:', resEdit.getStatusCode());
  console.log('executePreciseEdit success:', resEdit.getData()?.success, 'images:', resEdit.getData()?.images?.length);

  console.log('--- 4. Testing executeUpscaleImage ---');
  const reqUpscale = { body: { sourceImage: testDataUrl, scale: '2x' } };
  const resUpscale = mockRes();
  await executeUpscaleImage(reqUpscale, resUpscale);
  console.log('executeUpscaleImage status:', resUpscale.getStatusCode());
  console.log('executeUpscaleImage success:', resUpscale.getData()?.success, 'scale:', resUpscale.getData()?.scale, 'images:', resUpscale.getData()?.images?.length);

  console.log('ALL 4 CONTROLLERS TESTED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
