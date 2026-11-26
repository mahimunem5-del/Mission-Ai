import { getSupabaseClient } from '../../db/dbService.js';
import logger from '../../utils/logger.js';

export async function getProfileById(userId) {
  if (!userId) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    logger.warn('profilesRepository.getProfileById warning', { error: error.message });
    return null;
  }
  return data;
}

export async function upsertProfile(userId, profile = {}) {
  if (!userId) throw new Error('userId is required');
  const payload = {
    id: userId,
    email: profile.email ?? null,
    full_name: profile.full_name ?? profile.fullName ?? null,
    avatar_url: profile.avatar_url ?? profile.avatarUrl ?? null,
    preferred_language: profile.preferred_language ?? profile.preferredLanguage ?? 'en',
    updated_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (!supabase) return payload;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    logger.warn('profilesRepository.upsertProfile warning', { error: error.message });
    return payload;
  }
  return data || payload;
}

export default { getProfileById, upsertProfile };
