const sharp = require('../server/node_modules/sharp');

async function testAll() {
  console.log('Testing Sharp helper functions...');

  // 1. Generate Local Art Fallback
  async function generateLocalArt(prompt, width = 1024, height = 1024, seedOffset = 0) {
    let hash = seedOffset;
    for (let i = 0; i < prompt.length; i++) {
      hash = (hash << 5) - hash + prompt.charCodeAt(i);
      hash |= 0;
    }
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 45 + (Math.abs(hash >> 3) % 60)) % 360;
    const hue3 = (hue2 + 60) % 360;

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue1}, 70%, 18%)" />
          <stop offset="50%" stop-color="hsl(${hue2}, 65%, 28%)" />
          <stop offset="100%" stop-color="hsl(${hue3}, 75%, 12%)" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="hsl(${hue2}, 85%, 65%)" stop-opacity="0.8" />
          <stop offset="60%" stop-color="hsl(${hue1}, 70%, 40%)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="transparent" stop-opacity="0" />
        </radialGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <circle cx="${width * 0.5}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.35}" fill="url(#glow)" filter="url(#blur)" />
      <circle cx="${width * 0.7}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.2}" fill="hsl(${hue3}, 90%, 60%)" opacity="0.4" filter="url(#blur)" />
    </svg>
    `;

    const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  }

  const artUrl = await generateLocalArt('a futuristic cyber city');
  console.log('1. Art Fallback OK, length:', artUrl.length);

  // 2. Remove Background with Sharp
  async function removeBgWithSharp(inputBuffer) {
    const img = sharp(inputBuffer).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;

    // Sample corner pixels to find dominant background color
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];
    let sumR = 0, sumG = 0, sumB = 0;
    for (const [cx, cy] of corners) {
      const idx = (cy * width + cx) * 4;
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
    }
    const bgR = Math.round(sumR / 4);
    const bgG = Math.round(sumG / 4);
    const bgB = Math.round(sumB / 4);

    const threshold = 38;
    const feather = 18;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dist = Math.hypot(r - bgR, g - bgG, b - bgB);

      if (dist < threshold) {
        data[i + 3] = 0; // Completely transparent
      } else if (dist < threshold + feather) {
        const factor = (dist - threshold) / feather;
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
    }

    const pngBuffer = await sharp(data, {
      raw: { width, height, channels: 4 }
    }).png().toBuffer();

    return {
      dataUrl: `data:image/png;base64,${pngBuffer.toString('base64')}`,
      width,
      height
    };
  }

  // Create a white image with red circle
  const testSvg = '<svg width="200" height="200"><rect width="200" height="200" fill="#ffffff"/><circle cx="100" cy="100" r="50" fill="#ff0000"/></svg>';
  const testBuf = await sharp(Buffer.from(testSvg)).png().toBuffer();
  const cutoutResult = await removeBgWithSharp(testBuf);
  console.log('2. Remove Background OK, size:', cutoutResult.width, 'x', cutoutResult.height, 'length:', cutoutResult.dataUrl.length);

  // 3. Upscale with Sharp Lanczos3
  async function upscaleWithSharp(inputBuffer, scale = '2x') {
    const meta = await sharp(inputBuffer).metadata();
    const factor = String(scale).includes('4') ? 4 : 2;
    const targetW = (meta.width || 512) * factor;
    const targetH = (meta.height || 512) * factor;

    const upscaledBuf = await sharp(inputBuffer)
      .resize(targetW, targetH, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 1.0, m1: 1.5, m2: 0.7 })
      .png({ quality: 100 })
      .toBuffer();

    return {
      dataUrl: `data:image/png;base64,${upscaledBuf.toString('base64')}`,
      width: targetW,
      height: targetH,
      scale: `${factor}x`
    };
  }

  const upscaleResult = await upscaleWithSharp(testBuf, '2x');
  console.log('3. Upscale OK, target size:', upscaleResult.width, 'x', upscaleResult.height, 'length:', upscaleResult.dataUrl.length);

  console.log('All Sharp helper functions passed successfully!');
}

testAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
