/**
 * MESTRIO AI — Centralized Client-Side Image Preprocessing & Payload Safeguard
 * 
 * Unifies image upload preprocessing across:
 * - Generate Image (Reference Images)
 * - Precise Edit (Source Image & Reference Images)
 * - Upscale, Vectorize, and Remove Background
 * - Chat multimodal image attachments
 * 
 * Rules:
 * 1. Validates supported MIME types (image/jpeg, image/png, image/webp, image/gif)
 * 2. Avoids double-compressing already lightweight images (<= 1.8 MB and <= 2048px)
 * 3. Proportional resize/compress for oversized images (max 2048px longest edge, 0.90 quality, preserving PNG alpha)
 * 4. Payload size estimation (< 45 MB client safe ceiling below 50 MB server limit)
 */

export const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]);

export const MAX_RAW_IMAGE_SIZE_BYTES = 1.8 * 1024 * 1024; // 1.8 MB
export const MAX_IMAGE_DIMENSION_PX = 2048;
export const MAX_SAFE_PAYLOAD_BYTES = 45 * 1024 * 1024; // 45 MB client warning limit

export interface ProcessedImageResult {
  success: boolean;
  dataUrl?: string;
  name?: string;
  size?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  error?: string;
}

/**
 * Checks if a 2D canvas context has any semi-transparent or transparent pixels
 */
function hasAlphaChannel(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        return true;
      }
    }
  } catch (_) {
    // If security/CORS restriction, default to preserving format
  }
  return false;
}

/**
 * Validates and preprocesses an uploaded File or existing Data URL string
 */
export async function preprocessImageFile(
  fileOrDataUrl: File | Blob | string,
  fileName: string = 'image.png'
): Promise<ProcessedImageResult> {
  if (!fileOrDataUrl) {
    return { success: false, error: 'No image file or data provided.' };
  }

  // Case 1: String input (already a Data URL or HTTP URL)
  if (typeof fileOrDataUrl === 'string') {
    const trimmed = fileOrDataUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return { success: true, dataUrl: trimmed, name: fileName };
    }

    if (!trimmed.startsWith('data:image/')) {
      return { success: false, error: 'Invalid image format. Expected an image file or Data URL.' };
    }

    // Determine MIME
    const mimeMatch = trimmed.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1].toLowerCase() : 'image/jpeg';
    if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
      return { success: false, error: `Unsupported image format: ${mimeType}. Please use JPEG, PNG, WebP, or GIF.` };
    }

    // If small data URL (< 1.8 MB text length), inspect dimensions before deciding to resize
    if (trimmed.length <= MAX_RAW_IMAGE_SIZE_BYTES) {
      try {
        const dimensions = await getImageDimensions(trimmed);
        if (dimensions.width <= MAX_IMAGE_DIMENSION_PX && dimensions.height <= MAX_IMAGE_DIMENSION_PX) {
          return {
            success: true,
            dataUrl: trimmed,
            name: fileName,
            width: dimensions.width,
            height: dimensions.height,
            mimeType,
            size: Math.round(trimmed.length * 0.75)
          };
        }
      } catch (_) {
        // Fall through to canvas processing
      }
    }

    // Re-compress via Canvas if oversized
    return processImageViaCanvas(trimmed, mimeType, fileName);
  }

  // Case 2: File or Blob object
  const file = fileOrDataUrl as File;
  const mimeType = (file.type || '').toLowerCase();
  const name = file.name || fileName;

  if (mimeType && !ALLOWED_IMAGE_MIMES.has(mimeType)) {
    return {
      success: false,
      error: `Unsupported image format: "${mimeType || 'unknown'}". Please upload a PNG, JPEG, WebP, or GIF image.`
    };
  }

  // Read File as Data URL
  const rawDataUrl = await new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  if (!rawDataUrl) {
    return { success: false, error: 'Failed to read image file. Please try again.' };
  }

  // Check if already lightweight (<= 1.8 MB and <= 2048px)
  if (file.size <= MAX_RAW_IMAGE_SIZE_BYTES) {
    try {
      const dimensions = await getImageDimensions(rawDataUrl);
      if (dimensions.width <= MAX_IMAGE_DIMENSION_PX && dimensions.height <= MAX_IMAGE_DIMENSION_PX) {
        return {
          success: true,
          dataUrl: rawDataUrl,
          name,
          width: dimensions.width,
          height: dimensions.height,
          size: file.size,
          mimeType: mimeType || 'image/jpeg'
        };
      }
    } catch (_) {
      // Fall through to canvas processing
    }
  }

  // Oversized: resize/compress via Offscreen Canvas
  return processImageViaCanvas(rawDataUrl, mimeType || 'image/jpeg', name);
}

/**
 * Resizes and compresses an image via HTML Canvas
 */
function processImageViaCanvas(
  dataUrl: string,
  originalMime: string,
  name: string
): Promise<ProcessedImageResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale to max 2048px longest edge
        if (width > MAX_IMAGE_DIMENSION_PX || height > MAX_IMAGE_DIMENSION_PX) {
          if (width >= height) {
            height = Math.round((height * MAX_IMAGE_DIMENSION_PX) / width);
            width = MAX_IMAGE_DIMENSION_PX;
          } else {
            width = Math.round((width * MAX_IMAGE_DIMENSION_PX) / height);
            height = MAX_IMAGE_DIMENSION_PX;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          return resolve({ success: true, dataUrl, name, width, height });
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Check if alpha transparency is present
        const hasAlpha = (originalMime === 'image/png' || originalMime === 'image/webp') && hasAlphaChannel(ctx, width, height);

        let outputMime = 'image/jpeg';
        let quality = 0.90;

        if (hasAlpha) {
          outputMime = 'image/png';
        } else if (originalMime === 'image/webp') {
          outputMime = 'image/webp';
        }

        const optimizedDataUrl = outputMime === 'image/png'
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL(outputMime, quality);

        resolve({
          success: true,
          dataUrl: optimizedDataUrl,
          name,
          width,
          height,
          mimeType: outputMime,
          size: Math.round(optimizedDataUrl.length * 0.75)
        });
      } catch (canvasErr: any) {
        // Fallback to original data URL if canvas fails
        resolve({ success: true, dataUrl, name });
      }
    };

    img.onerror = () => {
      resolve({ success: false, error: 'Unable to decode image. Please ensure the file is not corrupted.' });
    };

    img.src = dataUrl;
  });
}

/**
 * Reads image dimensions from a Data URL
 */
function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Estimates total JSON payload size and returns error if approaching ceiling
 */
export function validatePayloadSize(payload: Record<string, any>): { valid: boolean; error?: string; sizeBytes: number } {
  try {
    const str = JSON.stringify(payload);
    const sizeBytes = str.length; // Approximate 1 char = 1 byte for ASCII / base64

    if (sizeBytes > MAX_SAFE_PAYLOAD_BYTES) {
      const sizeMb = Math.round(sizeBytes / (1024 * 1024));
      return {
        valid: false,
        sizeBytes,
        error: `Total payload size (${sizeMb} MB) is too large. Please use a smaller image to stay within server limits.`
      };
    }

    return { valid: true, sizeBytes };
  } catch (err: any) {
    return { valid: true, sizeBytes: 0 };
  }
}

export default {
  ALLOWED_IMAGE_MIMES,
  preprocessImageFile,
  validatePayloadSize
};
