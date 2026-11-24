import sharp from 'sharp';
import logger from './logger.js';

/**
 * MESTRIO AI — Server-Side Sharp Image Optimization Safeguard
 * 
 * Protects against upstream OpenRouter / Provider payload rejection ("The total text input size exceeds 8 MB").
 * Safely compresses and resizes oversized Base64 data URIs while preserving facial details,
 * micro-contrast, and transparency channels.
 */

const MAX_IMAGE_RAW_SIZE_BYTES = 1.8 * 1024 * 1024; // 1.8 MB
const MAX_DIMENSION_PX = 2048;
const OPENROUTER_SAFE_PAYLOAD_LIMIT_BYTES = 6 * 1024 * 1024; // 6 MB safe ceiling (below 8 MB OpenRouter limit)

/**
 * Parses a Data URI string into { mime, buffer }
 */
export function parseDataUri(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const trimmed = dataUrl.trim();

  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    try {
      const buffer = Buffer.from(match[2], 'base64');
      return { mime: match[1].toLowerCase(), buffer, base64: match[2] };
    } catch (_) {
      return null;
    }
  }

  // Bare base64 string
  if (trimmed.length > 50 && !trimmed.includes(' ') && !trimmed.includes('\n')) {
    try {
      const buffer = Buffer.from(trimmed, 'base64');
      let mime = 'image/jpeg';
      if (trimmed.startsWith('iVBOR')) mime = 'image/png';
      else if (trimmed.startsWith('R0lGOD')) mime = 'image/gif';
      else if (trimmed.startsWith('UklGR')) mime = 'image/webp';
      return { mime, buffer, base64: trimmed };
    } catch (_) {
      return null;
    }
  }

  return null;
}

/**
 * Optimizes an image buffer with sharp:
 * - Resizes if max dimension exceeds targetMaxDimension
 * - Preserves PNG alpha transparency if present
 * - Encodes with high quality to retain facial details and micro-contrast
 */
export async function optimizeImageBuffer(buffer, options = {}) {
  const {
    maxDimension = MAX_DIMENSION_PX,
    forceFormat = null
  } = options;

  const rawQuality = options.quality;
  let quality = 90;
  if (typeof rawQuality === 'number' && rawQuality > 0 && rawQuality <= 100) {
    quality = Math.round(rawQuality);
  } else if (typeof rawQuality === 'string') {
    const qLower = rawQuality.toLowerCase().trim();
    if (qLower === 'high') quality = 95;
    else if (qLower === 'speed' || qLower === 'low') quality = 82;
    else quality = 90;
  }

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { buffer, mime: 'image/jpeg', optimized: false };
  }

  try {
    // EXIF auto-rotation: ensures mobile portraits and photos with orientation tags never rotate sideways
    const image = sharp(buffer, { failOnError: false }).rotate();
    const metadata = await image.metadata();

    const origWidth = metadata.width || 1024;
    const origHeight = metadata.height || 1024;
    const hasAlpha = Boolean(metadata.hasAlpha);
    const origFormat = metadata.format || 'jpeg';

    const longestEdge = Math.max(origWidth, origHeight);
    const needsResize = longestEdge > maxDimension;
    const isAlreadyLightweight = buffer.length <= MAX_IMAGE_RAW_SIZE_BYTES && !needsResize;

    // Skip re-encoding if already lightweight, correct orientation, and within dimensions
    if (isAlreadyLightweight && !forceFormat && (!metadata.orientation || metadata.orientation === 1)) {
      let mime = `image/${origFormat === 'jpg' ? 'jpeg' : origFormat}`;
      return { buffer, mime, width: origWidth, height: origHeight, optimized: false };
    }

    // Proportional resize preserving aspect ratio and high sharpness
    let pipeline = image;
    if (needsResize) {
      pipeline = pipeline.resize(
        origWidth >= origHeight ? maxDimension : null,
        origHeight > origWidth ? maxDimension : null,
        {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3
        }
      );
    }

    let outputMime = 'image/jpeg';
    if (hasAlpha && (origFormat === 'png' || origFormat === 'webp')) {
      // Preserve alpha transparency
      if (forceFormat === 'webp' || origFormat === 'webp') {
        outputMime = 'image/webp';
        pipeline = pipeline.webp({ quality: Math.max(quality, 85), alphaQuality: 95 });
      } else {
        outputMime = 'image/png';
        pipeline = pipeline.png({ compressionLevel: 8, adaptiveFiltering: true });
      }
    } else {
      // Photographic content: high-fidelity JPEG with mozjpeg optimization
      outputMime = 'image/jpeg';
      pipeline = pipeline.jpeg({
        quality: quality,
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true
      });
    }

    const optimizedBuffer = await pipeline.toBuffer();
    const finalMeta = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      mime: outputMime,
      width: finalMeta.width || origWidth,
      height: finalMeta.height || origHeight,
      optimized: true
    };
  } catch (err) {
    logger.warn('Server-side sharp optimization error, returning original buffer', { error: err.message });
    return { buffer, mime: 'image/jpeg', optimized: false };
  }
}

/**
 * Optimizes a Base64 data URL string or web URL.
 * If already lightweight and small, passes through untouched.
 * Otherwise sharp compresses it and returns a valid data URI.
 */
export async function optimizeBase64DataUrl(dataUrlOrString, options = {}) {
  if (!dataUrlOrString || typeof dataUrlOrString !== 'string') return dataUrlOrString;

  // Web URLs don't bloat text JSON payloads
  if (dataUrlOrString.startsWith('http://') || dataUrlOrString.startsWith('https://')) {
    return dataUrlOrString;
  }

  const parsed = parseDataUri(dataUrlOrString);
  if (!parsed) return dataUrlOrString;

  // If already under 1.8 MB Base64 string length (~1.3 MB binary) and not forced, check quick pass
  if (dataUrlOrString.length < 1.8 * 1024 * 1024 && !options.force) {
    // Check dimensions without decoding full image if possible
    try {
      const meta = await sharp(parsed.buffer).metadata();
      if ((meta.width || 0) <= MAX_DIMENSION_PX && (meta.height || 0) <= MAX_DIMENSION_PX) {
        return dataUrlOrString;
      }
    } catch (_) {
      return dataUrlOrString;
    }
  }

  const result = await optimizeImageBuffer(parsed.buffer, options);
  return `data:${result.mime};base64,${result.buffer.toString('base64')}`;
}

/**
 * Recursively traverses any payload object or array and compresses all data:image/ strings
 */
async function optimizeAllDataUrlsInObject(obj, profile) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string' && obj[i].startsWith('data:image/')) {
        obj[i] = await optimizeBase64DataUrl(obj[i], { ...profile, force: true });
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        await optimizeAllDataUrlsInObject(obj[i], profile);
      }
    }
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      obj[key] = await optimizeBase64DataUrl(value, { ...profile, force: true });
    } else if (typeof value === 'object' && value !== null) {
      await optimizeAllDataUrlsInObject(value, profile);
    }
  }
}

/**
 * Safeguards an entire OpenRouter request payload.
 * Calculates total JSON string size: if > 6 MB, recursively compresses all attached image Base64 strings
 * until the payload is safely below OpenRouter's 8 MB limit.
 */
export async function ensureOpenRouterPayloadLimits(payload, maxTotalBytes = OPENROUTER_SAFE_PAYLOAD_LIMIT_BYTES) {
  if (!payload || typeof payload !== 'object') return payload;

  const serialized = JSON.stringify(payload);
  if (serialized.length <= maxTotalBytes) {
    return payload;
  }

  logger.info('Outgoing OpenRouter payload exceeds safe 6 MB threshold, initiating sharp compression safeguard', {
    originalPayloadSizeChars: serialized.length
  });

  const cloned = JSON.parse(serialized);

  // Progressive compression levels
  const targetProfiles = [
    { maxDimension: 1536, quality: 85 },
    { maxDimension: 1280, quality: 80 },
    { maxDimension: 1024, quality: 75 }
  ];

  for (const profile of targetProfiles) {
    await optimizeAllDataUrlsInObject(cloned, profile);

    const newSize = JSON.stringify(cloned).length;
    if (newSize <= maxTotalBytes) {
      logger.info('Payload successfully compressed below OpenRouter limit', {
        newSizeChars: newSize,
        profile
      });
      return cloned;
    }
  }

  return cloned;
}

export default {
  parseDataUri,
  optimizeImageBuffer,
  optimizeBase64DataUrl,
  ensureOpenRouterPayloadLimits
};
