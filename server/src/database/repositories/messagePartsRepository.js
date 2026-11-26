import crypto from 'crypto';
import { getSupabaseClient } from '../../db/dbService.js';
import logger from '../../utils/logger.js';

function deterministicPartId(messageId, partIndex) {
  const hash = crypto.createHash('sha256').update(`${messageId}:${partIndex}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function listPartsByMessage(messageId) {
  if (!messageId) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('message_parts')
    .select('*')
    .eq('message_id', messageId)
    .order('part_index', { ascending: true });

  if (error) {
    logger.warn('messagePartsRepository.listPartsByMessage warning', { error: error.message });
    return [];
  }
  return data || [];
}

/**
 * Batch-loads message_parts for a list of message IDs in a single query (avoids N+1).
 */
export async function listPartsByMessageIds(messageIds = []) {
  if (!Array.isArray(messageIds) || messageIds.length === 0) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('message_parts')
    .select('*')
    .in('message_id', messageIds)
    .order('part_index', { ascending: true });

  if (error) {
    logger.debug('messagePartsRepository.listPartsByMessageIds warning', { error: error.message });
    return [];
  }
  return data || [];
}

export async function saveMessageParts(messageId, parts = []) {
  if (!messageId || !Array.isArray(parts) || parts.length === 0) return [];
  const rows = parts.map((p, idx) => {
    const partIndex = p.part_index ?? idx;
    return {
      id: p.id || deterministicPartId(messageId, partIndex),
      message_id: messageId,
      part_index: partIndex,
      part_type: p.part_type || p.type || 'text',
      payload: p.payload ?? p,
      created_at: p.created_at || new Date().toISOString()
    };
  });

  const supabase = getSupabaseClient();
  if (!supabase) return rows;

  const { data, error } = await supabase
    .from('message_parts')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    logger.warn('messagePartsRepository.saveMessageParts warning', { error: error.message });
    return rows;
  }
  return data || rows;
}

export default { listPartsByMessage, listPartsByMessageIds, saveMessageParts };
