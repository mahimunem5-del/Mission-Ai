import crypto from 'crypto';
import { getSupabaseClient } from '../../db/dbService.js';
import logger from '../../utils/logger.js';

export async function recordModelUsage(record = {}) {
  const payload = {
    id: record.id || crypto.randomUUID(),
    user_id: record.user_id ?? record.userId ?? null,
    conversation_id: record.conversation_id ?? record.conversationId ?? null,
    request_id: record.request_id ?? record.requestId ?? null,
    provider: record.provider || 'openrouter',
    requested_model: record.requested_model ?? record.requestedModel ?? null,
    resolved_model: record.resolved_model ?? record.resolvedModel ?? record.model_id ?? record.model ?? 'unknown',
    mode: record.mode || 'chat',
    input_tokens: typeof record.input_tokens === 'number' ? record.input_tokens : null,
    output_tokens: typeof record.output_tokens === 'number' ? record.output_tokens : null,
    total_tokens: typeof record.total_tokens === 'number' ? record.total_tokens : null,
    api_cost_usd: typeof record.api_cost_usd === 'number' ? record.api_cost_usd : null,
    duration_ms: record.duration_ms ?? record.durationMs ?? 0,
    cache_hit: Boolean(record.cache_hit ?? record.cacheHit),
    status: record.status || 'success',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (!supabase) return payload;

  const { data, error } = await supabase
    .from('model_usage')
    .insert(payload)
    .select()
    .single();

  if (error) {
    logger.debug('modelUsageRepository.recordModelUsage skipped/warn', { error: error.message });
    return payload;
  }
  return data || payload;
}

export async function listUsageByUser(userId, limit = 50) {
  if (!userId) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('model_usage')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.warn('modelUsageRepository.listUsageByUser warning', { error: error.message });
    return [];
  }
  return data || [];
}

export default { recordModelUsage, listUsageByUser };
