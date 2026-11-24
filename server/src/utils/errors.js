export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class InvalidRequestError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'INVALID_REQUEST', details);
  }
}

export class ImageUploadError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'IMAGE_UPLOAD_ISSUE', details);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Payload exceeds maximum allowed size of 50 MB', details = null) {
    super(message, 413, 'PAYLOAD_TOO_LARGE', details);
  }
}

export class UnsupportedCapabilityError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'UNSUPPORTED_CAPABILITY', details);
  }
}

export class ModelCompatibilityError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'MODEL_COMPATIBILITY_ISSUE', details);
  }
}

export class SafetyRefusalError extends AppError {
  constructor(message = 'The prompt or image was flagged by upstream content safety filters.', details = null) {
    super(message, 422, 'SAFETY_REFUSAL', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please slow down.', retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfterSeconds });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class TimeoutError extends AppError {
  constructor(message = 'The AI service took too long to respond.', provider = 'upstream') {
    super(message, 504, 'PROVIDER_TIMEOUT', { provider });
    this.provider = provider;
  }
}

export class ProviderTimeoutError extends AppError {
  constructor(message = 'The upstream image provider timed out while generating your image.', details = null) {
    super(message, 504, 'PROVIDER_TIMEOUT', details);
  }
}

export class ProviderError extends AppError {
  constructor(message, provider = 'upstream', originalError = null) {
    super(message, 502, 'PROVIDER_ERROR', { provider });
    this.provider = provider;
    this.originalMessage = originalError?.message || null;
  }
}

export class ConfigurationError extends AppError {
  constructor(message = 'Server configuration error') {
    super(message, 500, 'CONFIGURATION_ERROR');
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'An unexpected internal error occurred') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

/**
 * Strips secrets, keys, and internal stack traces so client responses are safe.
 */
export function formatErrorForClient(err, requestId = null) {
  const isOperational = err instanceof AppError;
  const statusCode = isOperational ? err.statusCode : (err.statusCode || err.status || 500);
  let code = isOperational ? err.code : (err.code || err.type || 'INTERNAL_ERROR');

  // Map known status codes to standard error codes if default code is generic
  if (code === 'INTERNAL_ERROR' || code === 'INTERNAL_SERVER_ERROR') {
    if (statusCode === 400) code = 'INVALID_REQUEST';
    else if (statusCode === 413) code = 'PAYLOAD_TOO_LARGE';
    else if (statusCode === 422) code = 'UNSUPPORTED_CAPABILITY';
    else if (statusCode === 502) code = 'PROVIDER_ERROR';
    else if (statusCode === 503) code = 'PROVIDER_ERROR';
    else if (statusCode === 504) code = 'PROVIDER_TIMEOUT';
  }

  // Scrub any accidentally included keys in error message
  let safeMessage = (isOperational || err.status || err.statusCode) ? err.message : 'An unexpected error occurred. Please try again.';
  if (typeof safeMessage === 'string') {
    safeMessage = safeMessage
      .replace(/(?:Bearer\s+|sk-or-v1-|sk-)[a-zA-Z0-9_\-]{16,}/gi, '[REDACTED]')
      .replace(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]{100,}/g, '[BASE64_IMAGE_DATA]');
  }

  const responseBody = {
    success: false,
    error: {
      code,
      message: safeMessage,
      details: isOperational && err.details ? err.details : (err.details || undefined),
      requestId: requestId || undefined
    },
    message: safeMessage,
    code
  };

  if (err.recommendedModels) {
    responseBody.recommendedModels = err.recommendedModels;
    if (responseBody.error && !responseBody.error.details) {
      responseBody.error.details = { recommendedModels: err.recommendedModels };
    } else if (responseBody.error && responseBody.error.details) {
      responseBody.error.details.recommendedModels = err.recommendedModels;
    }
  }

  return {
    statusCode,
    body: responseBody
  };
}

export default {
  AppError,
  ValidationError,
  InvalidRequestError,
  ImageUploadError,
  PayloadTooLargeError,
  UnsupportedCapabilityError,
  ModelCompatibilityError,
  SafetyRefusalError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ProviderTimeoutError,
  ProviderError,
  ConfigurationError,
  InternalServerError,
  formatErrorForClient
};
