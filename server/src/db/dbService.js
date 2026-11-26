import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import config from '../config/env.js';
import { ConfigurationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

let supabaseClient = null;

const isSupabaseConfigured = Boolean(
  config.supabase.url &&
  config.supabase.serviceRoleKey &&
  config.supabase.url.startsWith('http') &&
  config.supabase.serviceRoleKey.length > 10
);

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    logger.info('Supabase client initialized successfully (isolated for Image Templates)');
  } catch (err) {
    logger.error('Failed to initialize Supabase client for Image Templates', { error: err.message });
    supabaseClient = null;
  }
} else {
  logger.debug('Supabase credentials not configured. Image Templates operating in offline mode.');
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeUuid(rawId) {
  if (!rawId) return crypto.randomUUID();
  const str = String(rawId).trim();
  if (UUID_REGEX.test(str)) return str;
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Fetch all conversations sorted by created_at DESC from Supabase
 */
export async function getConversations(options = {}) {
  const { projectId = null, limit = 50, userId = null } = options;
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (projectId) query = query.eq('project_id', projectId);
  if (userId && UUID_REGEX.test(String(userId))) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) {
    logger.warn('Supabase getConversations warning', { error: error.message });
    return [];
  }
  return data || [];
}

/**
 * Fetch a single conversation along with its chronological messages from Supabase
 */
export async function getConversationById(id, userId = null, options = {}) {
  const { includeMessages = true } = options;
  if (!id) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const normalizedId = normalizeUuid(id);
  let convQuery = supabase.from('conversations').select('*').eq('id', normalizedId);
  if (userId && UUID_REGEX.test(String(userId))) {
    convQuery = convQuery.eq('user_id', userId);
  }
  const { data: conv, error: convErr } = await convQuery.maybeSingle();
  if (convErr || !conv) return null;

  if (!includeMessages) {
    return conv;
  }

  const { data: msgs, error: msgErr } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', normalizedId)
    .order('created_at', { ascending: true });

  if (msgErr) {
    logger.warn('Supabase getConversationById messages warning', { error: msgErr.message });
  }

  return {
    ...conv,
    messages: msgs || []
  };
}

/**
 * Create or upsert a conversation thread in Supabase
 */
export async function createConversation(data = {}) {
  const id = normalizeUuid(data.id);
  const normalizedUserId = data.user_id && UUID_REGEX.test(String(data.user_id))
    ? data.user_id
    : (data.userId && UUID_REGEX.test(String(data.userId)) ? data.userId : null);

  const payload = {
    id,
    title: data.title || 'New Chat',
    model_id: data.model_id || data.modelId || 'mahi-engine',
    mode: data.mode || 'chat',
    project_id: data.project_id || data.projectId || null,
    user_id: normalizedUserId,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (!supabase) return payload;

  const { data: saved, error } = await supabase
    .from('conversations')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    logger.warn('Supabase createConversation warning', { error: error.message });
    return payload;
  }
  return saved || payload;
}

/**
 * Persist a message record in Supabase
 */
export async function addMessage(conversationId, data = {}) {
  if (!conversationId) throw new Error('conversation_id is required');

  const convUuid = normalizeUuid(conversationId);
  const id = normalizeUuid(data.id);
  const payload = {
    id,
    conversation_id: convUuid,
    role: data.role || 'user',
    content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content || ''),
    type: data.type || 'text',
    metadata: data.metadata || {},
    created_at: data.created_at || new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (!supabase) return payload;

  const { data: saved, error } = await supabase
    .from('messages')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    logger.warn('Supabase addMessage warning', { error: error.message });
    return payload;
  }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', convUuid);

  return saved || payload;
}

/**
 * Delete a conversation and cascade all its messages in Supabase
 */
export async function deleteConversation(id, userId = null) {
  if (!id) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return true;

  const normalizedId = normalizeUuid(id);
  let query = supabase.from('conversations').delete().eq('id', normalizedId);
  if (userId && UUID_REGEX.test(String(userId))) {
    query = query.eq('user_id', userId);
  }
  const { error } = await query;
  if (error) {
    logger.warn('Supabase deleteConversation warning', { error: error.message });
    return false;
  }
  return true;
}

/**
 * Health check status of the database connection
 */
export async function checkDatabaseHealth() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      status: 'degraded',
      type: 'supabase_unconfigured',
      connected: false
    };
  }
  return {
    status: 'ready',
    type: 'supabase',
    connected: true
  };
}

/**
 * Returns the initialized Supabase client instance with service role privileges
 */
export function getSupabaseClient() {
  if (!supabaseClient && isSupabaseConfigured) {
    try {
      supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    } catch (err) {
      logger.error('Failed to initialize Supabase client', { error: err.message });
      supabaseClient = null;
    }
  }
  return supabaseClient;
}

export default {
  getSupabaseClient,
  getConversations,
  getConversationById,
  createConversation,
  addMessage,
  deleteConversation,
  checkDatabaseHealth
};
