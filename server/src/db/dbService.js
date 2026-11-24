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

// In-Memory Storage for Conversations and Messages (Chat operates completely isolated from Supabase)
const inMemoryConversations = new Map();
const inMemoryMessages = new Map(); // conversation_id -> Array<message>

/**
 * Fetch all conversations sorted by created_at DESC from in-memory store
 */
export async function getConversations(options = {}) {
  const { projectId = null, limit = 50, userId = null } = options;

  return Array.from(inMemoryConversations.values())
    .filter(c => (!projectId || c.project_id === projectId) && (!userId || c.user_id === userId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

/**
 * Fetch a single conversation along with its chronological messages from in-memory store
 */
export async function getConversationById(id, userId = null) {
  if (!id) return null;

  const conv = inMemoryConversations.get(id);
  if (!conv) return null;
  if (userId && conv.user_id && conv.user_id !== userId) return null;

  const msgs = (inMemoryMessages.get(id) || [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return {
    ...conv,
    messages: msgs
  };
}

/**
 * Create a new conversation thread in in-memory store
 */
export async function createConversation(data = {}) {
  const id = data.id || crypto.randomUUID();
  const newConv = {
    id,
    title: data.title || 'New Chat',
    model_id: data.model_id || data.modelId || 'mahi-engine',
    mode: data.mode || 'chat',
    project_id: data.project_id || data.projectId || null,
    user_id: data.user_id || data.userId || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  inMemoryConversations.set(id, newConv);
  if (!inMemoryMessages.has(id)) {
    inMemoryMessages.set(id, []);
  }
  return newConv;
}

/**
 * Persist a message record in in-memory store
 */
export async function addMessage(conversationId, data = {}) {
  if (!conversationId) throw new Error('conversation_id is required');

  const id = data.id || crypto.randomUUID();
  const newMsg = {
    id,
    conversation_id: conversationId,
    role: data.role || 'user',
    content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content || ''),
    type: data.type || 'text',
    metadata: data.metadata || {},
    created_at: data.created_at || new Date().toISOString()
  };

  if (!inMemoryMessages.has(conversationId)) {
    inMemoryMessages.set(conversationId, []);
  }
  inMemoryMessages.get(conversationId).push(newMsg);

  const conv = inMemoryConversations.get(conversationId);
  if (conv) {
    conv.updated_at = new Date().toISOString();
  }

  return newMsg;
}

/**
 * Delete a conversation and cascade all its messages in in-memory store
 */
export async function deleteConversation(id, userId = null) {
  if (!id) return false;

  const conv = inMemoryConversations.get(id);
  if (userId && conv && conv.user_id && conv.user_id !== userId) {
    return false;
  }

  inMemoryConversations.delete(id);
  inMemoryMessages.delete(id);
  return true;
}

/**
 * Health check status of the database connection (isolated in-memory for chat/history)
 */
export async function checkDatabaseHealth() {
  return {
    status: 'ready',
    type: 'in_memory',
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
