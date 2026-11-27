import express from 'express';
import { generateImage, executePreciseEdit, executeUpscaleImage, executeRemoveBackground } from '../controllers/imageController.js';
import { validateImageRequest } from '../middleware/validate.js';
import { imageRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply route-level rate limiting
router.use(imageRateLimiter);

/**
 * POST /api/generate-image
 * Also mounted at /api/images/generate
 */
router.post('/', validateImageRequest, generateImage);
router.post('/generate', validateImageRequest, generateImage);
router.post('/precise-edit', validateImageRequest, executePreciseEdit);
router.post('/edit', validateImageRequest, executePreciseEdit);
router.post('/smart-edit', validateImageRequest, executePreciseEdit);
router.post('/upscale', validateImageRequest, executeUpscaleImage);
router.post('/remove-background', validateImageRequest, executeRemoveBackground);
router.post('/remove-bg', validateImageRequest, executeRemoveBackground);

export default router;
