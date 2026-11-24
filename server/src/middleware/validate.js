import {
  ValidationError,
  InvalidRequestError,
  ImageUploadError,
  PayloadTooLargeError
} from '../utils/errors.js';

const ALLOWED_SEARCH_MODES = new Set(['none', 'web-search', 'deep-research']);
const ALLOWED_ROLES = new Set(['user', 'assistant', 'system']);

/**
 * Validates chat request body
 */
export function validateChatRequest(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return next(new ValidationError('Request body must be a valid JSON object'));
  }

  const { messages, model, searchMode, projectId, projectInstructions, systemPrompt } = body;

  if (messages !== undefined) {
    if (!Array.isArray(messages)) {
      return next(new ValidationError('Field "messages" must be an array'));
    }

    if (messages.length > 100) {
      return next(new ValidationError('Message history exceeds maximum limit of 100 messages'));
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || typeof msg !== 'object') {
        return next(new ValidationError(`Message at index ${i} must be an object`));
      }

      if (msg.role && !ALLOWED_ROLES.has(String(msg.role).toLowerCase())) {
        return next(new ValidationError(`Invalid role "${msg.role}" at message index ${i}`));
      }

      const content = msg.content;
      if (content !== undefined && content !== null) {
        const isMultimodal = Array.isArray(content) || (typeof content === 'string' && content.includes('data:image/'));
        const text = typeof content === 'string' ? content : JSON.stringify(content);
        const maxAllowed = isMultimodal ? 50000000 : 500000;
        if (text.length > maxAllowed) {
          return next(new ValidationError(`Message at index ${i} exceeds maximum length of ${maxAllowed.toLocaleString()} characters`));
        }
      }
    }
  }

  if (model !== undefined) {
    if (typeof model !== 'string' || model.length > 120 || !/^[a-zA-Z0-9_\-\.\:\/ ]+$/.test(model)) {
      return next(new ValidationError('Field "model" must be a valid identifier under 120 characters'));
    }
  }

  if (searchMode !== undefined) {
    if (!ALLOWED_SEARCH_MODES.has(String(searchMode).toLowerCase())) {
      return next(new ValidationError('Field "searchMode" must be one of: "none", "web-search", "deep-research"'));
    }
  }

  if (projectId !== undefined && projectId !== null) {
    if (typeof projectId !== 'string' || projectId.length > 100) {
      return next(new ValidationError('Field "projectId" must be a string under 100 characters'));
    }
  }

  if (projectInstructions !== undefined && projectInstructions !== null) {
    if (typeof projectInstructions !== 'string' || projectInstructions.length > 15000) {
      return next(new ValidationError('Field "projectInstructions" exceeds maximum length of 15,000 characters'));
    }
  }

  if (systemPrompt !== undefined && systemPrompt !== null) {
    if (typeof systemPrompt !== 'string' || systemPrompt.length > 15000) {
      return next(new ValidationError('Field "systemPrompt" exceeds maximum length of 15,000 characters'));
    }
  }

  next();
}

/**
 * Validates multi-model compare request body
 */
export function validateCompareRequest(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return next(new ValidationError('Request body must be a valid JSON object'));
  }

  const { messages, models } = body;

  if (messages !== undefined && !Array.isArray(messages)) {
    return next(new ValidationError('Field "messages" must be an array'));
  }

  if (models !== undefined) {
    if (!Array.isArray(models)) {
      return next(new ValidationError('Field "models" must be an array of model identifiers'));
    }

    if (models.length === 0) {
      return next(new ValidationError('Field "models" must contain at least one model'));
    }

    if (models.length > 4) {
      return next(new ValidationError('Compare mode supports a maximum of 4 concurrent models to prevent quota exhaustion'));
    }

    for (let i = 0; i < models.length; i++) {
      if (typeof models[i] !== 'string' || models[i].trim().length === 0 || models[i].length > 120 || !/^[a-zA-Z0-9_\-\.\:\/ ]+$/.test(models[i])) {
        return next(new ValidationError(`Invalid model string at index ${i}`));
      }
    }
  }

  next();
}

/**
 * Validates history conversation ID param
 */
export function validateHistoryId(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.length > 128 || !/^[a-zA-Z0-9_\-]+$/.test(id)) {
    return next(new ValidationError('Invalid conversation ID'));
  }
  next();
}

/**
 * Validates conversation creation payload
 */
export function validateCreateConversation(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return next(new ValidationError('Request body must be a valid JSON object'));
  }

  const { id, title, model_id, modelId, mode, project_id, projectId } = body;

  if (id !== undefined && (typeof id !== 'string' || id.length > 128 || !/^[a-zA-Z0-9_\-]+$/.test(id))) {
    return next(new ValidationError('Invalid custom ID format'));
  }

  if (title !== undefined && (typeof title !== 'string' || title.length > 200)) {
    return next(new ValidationError('Field "title" must be a string under 200 characters'));
  }

  const chosenModel = model_id || modelId;
  if (chosenModel !== undefined && (typeof chosenModel !== 'string' || chosenModel.length > 120)) {
    return next(new ValidationError('Field "model_id" must be a string under 120 characters'));
  }

  if (mode !== undefined && (typeof mode !== 'string' || mode.length > 50)) {
    return next(new ValidationError('Field "mode" must be a string under 50 characters'));
  }

  const chosenProject = project_id || projectId;
  if (chosenProject !== undefined && chosenProject !== null && (typeof chosenProject !== 'string' || chosenProject.length > 100)) {
    return next(new ValidationError('Field "project_id" must be a string under 100 characters'));
  }

  next();
}

/**
 * Validates message insertion payload
 */
export function validateAddMessage(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return next(new ValidationError('Request body must be a valid JSON object'));
  }

  const { id, role, content, type, metadata } = body;

  if (id !== undefined && (typeof id !== 'string' || id.length > 128 || !/^[a-zA-Z0-9_\-]+$/.test(id))) {
    return next(new ValidationError('Invalid custom message ID format'));
  }

  if (role !== undefined && !ALLOWED_ROLES.has(String(role).toLowerCase())) {
    return next(new ValidationError(`Invalid role "${role}". Allowed roles: user, assistant, system`));
  }

  if (content !== undefined && content !== null) {
    const isMultimodal = Array.isArray(content) || (typeof content === 'string' && content.includes('data:image/'));
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    const maxAllowed = isMultimodal ? 50000000 : 500000;
    if (text.length > maxAllowed) {
      return next(new ValidationError(`Message content exceeds maximum length of ${maxAllowed.toLocaleString()} characters`));
    }
  }

  if (type !== undefined && (typeof type !== 'string' || type.length > 50)) {
    return next(new ValidationError('Field "type" must be a string under 50 characters'));
  }

  if (metadata !== undefined && (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata))) {
    return next(new ValidationError('Field "metadata" must be a JSON object'));
  }

  next();
}

export const MAX_IMAGE_PAYLOAD_SIZE = 50 * 1024 * 1024; // 50 MB internal limit
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]);

/**
 * Validates image generation and edit request payloads
 * Enforces up to 50 MB payload limit for high-resolution base64 data URIs
 * and validates MIME types and image data formats.
 */
export function validateImageRequest(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return next(new InvalidRequestError('Request body must be a valid JSON object'));
  }

  // Calculate approximate body size in bytes
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > MAX_IMAGE_PAYLOAD_SIZE) {
    return next(new PayloadTooLargeError(`Total image request size (${Math.round(contentLength / (1024 * 1024))} MB) exceeds maximum allowed limit of 50 MB`));
  }

  // Check prompt length if provided
  const prompt = body.prompt || body.instructionPrompt;
  if (prompt !== undefined && prompt !== null) {
    if (typeof prompt !== 'string') {
      return next(new InvalidRequestError('Prompt must be a string'));
    }
    if (prompt.length > 20000) {
      return next(new InvalidRequestError('Prompt exceeds maximum length of 20,000 characters'));
    }
  }

  // Check image MIME types in payload
  const imageCandidates = [];
  if (body.sourceImage) imageCandidates.push(body.sourceImage);
  if (body.image) imageCandidates.push(body.image);
  if (body.referenceImage) imageCandidates.push(body.referenceImage);
  if (Array.isArray(body.referenceImages)) {
    for (const item of body.referenceImages) {
      if (typeof item === 'string') imageCandidates.push(item);
      else if (item && typeof item === 'object') {
        if (item.dataUrl) imageCandidates.push(item.dataUrl);
        else if (item.url) imageCandidates.push(item.url);
      }
    }
  }

  for (const img of imageCandidates) {
    if (typeof img === 'string' && img.startsWith('data:')) {
      const match = img.match(/^data:([^;]+);base64,/i);
      if (!match) {
        return next(new ImageUploadError('Malformed data URI. Must be in the format "data:<mime-type>;base64,<data>".'));
      }
      const mime = match[1].toLowerCase().trim();
      if (!ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
        return next(new ImageUploadError(`Unsupported image format "${mime}". Allowed formats: JPEG, PNG, WebP, GIF.`, {
          unsupportedMime: mime,
          allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        }));
      }
      // Check for valid base64 payload characters
      const b64Part = img.substring(match[0].length);
      if (b64Part.length === 0 || !/^[A-Za-z0-9+/=\s]+$/.test(b64Part)) {
        return next(new ImageUploadError('Invalid Base64 character encoding in image data URI.'));
      }
    }
  }

  next();
}

export default {
  validateChatRequest,
  validateCompareRequest,
  validateHistoryId,
  validateCreateConversation,
  validateAddMessage,
  validateImageRequest,
  MAX_IMAGE_PAYLOAD_SIZE
};
