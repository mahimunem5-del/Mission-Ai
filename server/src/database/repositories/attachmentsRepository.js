import crypto from 'crypto';
import { getSupabaseClient } from '../../db/dbService.js';
import logger from '../../utils/logger.js';

export async function listAttachmentsByUser(userId, conversationId = null) {
  if (!userId) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from('attachments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (conversationId) {
    query = query.eq('conversation_id', conversationId);
  }

  const { data, error } = await query;
  if (error) {
    logger.warn('attachmentsRepository.listAttachmentsByUser warning', { error: error.message });
    return [];
  }
  return data || [];
}

/**
 * Batch-loads attachments for a conversation scoped to userId (avoids N+1).
 */
export async function listAttachmentsByConversation(conversationId, userId = null) {
  if (!conversationId) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from('attachments')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    logger.debug('attachmentsRepository.listAttachmentsByConversation warning', { error: error.message });
    return [];
  }
  return data || [];
}

export async function createAttachment(userId, attachment = {}) {
  if (!userId) throw new Error('userId is required');
  const payload = {
    id: attachment.id || crypto.randomUUID(),
    user_id: userId,
    conversation_id: attachment.conversation_id ?? attachment.conversationId ?? null,
    message_id: attachment.message_id ?? attachment.messageId ?? null,
    file_name: attachment.file_name || attachment.fileName || 'attachment',
    mime_type: attachment.mime_type || attachment.mimeType || 'application/octet-stream',
    size_bytes: attachment.size_bytes ?? attachment.sizeBytes ?? 0,
    storage_path: attachment.storage_path ?? null,
    public_url: attachment.public_url ?? null,
    created_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (!supabase) return payload;

  const { data, error } = await supabase
    .from('attachments')
    .insert(payload)
    .select()
    .single();

  if (error) {
    logger.warn('attachmentsRepository.createAttachment warning', { error: error.message });
    return payload;
  }
  return data || payload;
}

export default { listAttachmentsByUser, listAttachmentsByConversation, createAttachment };
