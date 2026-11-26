import crypto from 'crypto';
import config from '../config/env.js';
import { getSupabaseClient } from '../db/dbService.js';
import logger from '../utils/logger.js';

/**
 * Verifies a Supabase JWT or HMAC-signed session token.
 * Attaches `req.user` on success, or returns 401 JSON on failure.
 * `DEV_BYPASS_AUTH` is strictly disabled in production.
 */
export async function requireAuth(req, res, next) {
  const isLocalDevBypass = !config.isProd && config.auth?.devBypass && process.env.DEV_BYPASS_AUTH !== 'false';
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!bearerToken) {
    if (isLocalDevBypass) {
      req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'dev@localhost', name: 'Developer', isDevBypass: true };
      return next();
    }
    return res.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication required. Provide a valid Bearer token.' },
      message: 'Authentication required. Provide a valid Bearer token.'
    });
  }

  // 1. Check optional HMAC-signed API token (API_AUTH_SECRET)
  const apiSecret = config.auth?.apiAuthSecret || process.env.API_AUTH_SECRET?.trim();
  if (apiSecret && bearerToken.includes('.')) {
    try {
      const [payloadB64, sig] = bearerToken.split('.');
      const expectedSig = crypto.createHmac('sha256', apiSecret).update(payloadB64).digest('base64url');
      if (sig && sig.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
        if (!payload.exp || payload.exp * 1000 > Date.now()) {
          req.user = {
            id: payload.sub || payload.userId || 'api-user',
            email: payload.email || null,
            name: payload.name || null
          };
          return next();
        }
      }
    } catch (_) {
      // Fall through to Supabase JWT verification
    }
  }

  // 2. Verify Supabase JWT
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(bearerToken);
      if (!error && data?.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email || null,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null
        };
        return next();
      }
    } catch (err) {
      logger.warn('Supabase JWT verification error', { requestId: req.id, error: err.message });
    }
  }

  return res.status(401).json({
    success: false,
    error: { code: 'AUTHENTICATION_REQUIRED', message: 'Invalid or expired authentication token.' },
    message: 'Invalid or expired authentication token.'
  });
}

export default {
  requireAuth
};
