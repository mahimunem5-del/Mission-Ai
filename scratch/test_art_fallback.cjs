const sharp = require('sharp');

async function generateLocalArtFallback(prompt, width = 1024, height = 1024, style = 'Studio') {
  // Hash prompt to generate deterministic harmonious palette
  let hash = 0;
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
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="hsl(${hue2}, 85%, 65%)" stop-opacity="0.8" />
        <stop offset="60%" stop-color="hsl(${hue1}, 70%, 40%)" stop-opacity="0.2" />
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

async function run() {
  const dataUrl = await generateLocalArtFallback('A cute cat in a garden');
  console.log('Generated fallback image data URL length:', dataUrl.length);
}

run();
