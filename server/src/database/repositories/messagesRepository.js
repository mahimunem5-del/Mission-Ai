import { addMessage, getSupabaseClient } from '../../db/dbService.js';
import logger from '../../utils/logger.js';

export async function listByConversation(conversationId) {
  if (!conversationId) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    logger.warn('messagesRepository.listByConversation warning', { error: error.message });
    return [];
  }
  return data || [];
}

export async function createMessage(conversationId, data = {}) {
  return addMessage(conversationId, data);
}

export default { listByConversation, createMessage };
