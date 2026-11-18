const sharp = require('sharp');

async function testSharp() {
  const svg = '<svg width="100" height="100"><rect width="100" height="100" fill="white"/><circle cx="50" cy="50" r="30" fill="red"/></svg>';
  const inputBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  
  // 1. Test upscale 2x
  const upscaled = await sharp(inputBuffer)
    .resize(200, 200, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 1.0 })
    .png()
    .toBuffer();
  console.log('Upscaled size:', upscaled.length, 'bytes');

  // 2. Test remove background
  const { data, info } = await sharp(inputBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r > 240 && g > 240 && b > 240) {
      data[i+3] = 0; // Transparent
    }
  }
  const cutout = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  console.log('Cutout size:', cutout.length, 'bytes');
  console.log('Sharp operations tested successfully!');
}

testSharp();
