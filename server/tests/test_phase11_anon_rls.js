import 'dotenv/config';
import assert from 'assert';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

assert(url, 'SUPABASE_URL must be set');
assert(anonKey, 'SUPABASE_ANON_KEY must be set');
assert(anonKey !== serviceKey, 'SUPABASE_ANON_KEY must NOT equal SUPABASE_SERVICE_ROLE_KEY');

// Anonymous client ONLY — never uses service-role key
const anonClient = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PRIVATE_TABLES = [
  {
    name: 'profiles',
    insertPayload: { id: '11111111-1111-1111-1111-111111111111', email: 'anon@test.invalid' },
    updatePayload: { full_name: 'Anon Tamper' }
  },
  {
    name: 'conversations',
    insertPayload: { title: 'Anon Tamper Conv', model_id: 'mahi-engine', mode: 'chat' },
    updatePayload: { title: 'Anon Tamper' }
  },
  {
    name: 'messages',
    insertPayload: { conversation_id: '11111111-1111-1111-1111-111111111111', role: 'user', content: 'anon tamper' },
    updatePayload: { content: 'Anon Tamper' }
  },
  {
    name: 'message_parts',
    insertPayload: { message_id: '11111111-1111-1111-1111-111111111111', part_index: 0, part_type: 'text', payload: {} },
    updatePayload: { part_index: 99 }
  },
  {
    name: 'attachments',
    insertPayload: { user_id: '11111111-1111-1111-1111-111111111111', file_name: 'anon.txt', mime_type: 'text/plain', size_bytes: 1 },
    updatePayload: { file_name: 'tamper.txt' }
  },
  {
    name: 'model_usage',
    insertPayload: { provider: 'openrouter', resolved_model: 'gpt-4o-mini', mode: 'chat', duration_ms: 1, status: 'success' },
    updatePayload: { status: 'tampered' }
  },
  {
    name: 'subscriptions',
    insertPayload: { user_id: '11111111-1111-1111-1111-111111111111', plan_tier: 'enterprise', status: 'active' },
    updatePayload: { plan_tier: 'enterprise' }
  },
  {
    name: 'credit_transactions',
    insertPayload: { user_id: '11111111-1111-1111-1111-111111111111', amount: 999999, reason: 'anon_exploit' },
    updatePayload: { amount: 999999 }
  }
];

async function main() {
  console.log('=== PHASE 11C: ANONYMOUS 9-TABLE RLS VERIFICATION ===');

  for (const t of PRIVATE_TABLES) {
    // 1. Anonymous SELECT must return 0 rows (never leak existing data)
    const sel = await anonClient.from(t.name).select('*').limit(10);
    const selRows = Array.isArray(sel.data) ? sel.data.length : 0;
    assert.strictEqual(selRows, 0, `${t.name}: anonymous SELECT returned ${selRows} rows (expected 0)`);

    // 2. Anonymous INSERT must be rejected
    const ins = await anonClient.from(t.name).insert(t.insertPayload).select();
    assert(ins.error, `${t.name}: anonymous INSERT succeeded unexpectedly`);
    const insRows = Array.isArray(ins.data) ? ins.data.length : 0;
    assert.strictEqual(insRows, 0, `${t.name}: anonymous INSERT returned rows`);

    // 3. Anonymous UPDATE must affect 0 rows (or error)
    const upd = await anonClient.from(t.name).update(t.updatePayload).neq('id', '00000000-0000-0000-0000-000000000000').select();
    const updRows = Array.isArray(upd.data) ? upd.data.length : 0;
    assert.strictEqual(updRows, 0, `${t.name}: anonymous UPDATE modified ${updRows} rows`);

    // 4. Anonymous DELETE must affect 0 rows (or error)
    const del = await anonClient.from(t.name).delete().neq('id', '00000000-0000-0000-0000-000000000000').select();
    const delRows = Array.isArray(del.data) ? del.data.length : 0;
    assert.strictEqual(delRows, 0, `${t.name}: anonymous DELETE removed ${delRows} rows`);

    console.log(`• ${t.name}: SELECT=0 rows, INSERT rejected (${ins.error.code || 'RLS'}), UPDATE=0 rows, DELETE=0 rows ✓ PASSED`);
  }

  // 9. image_templates: Public SELECT allowed; INSERT/UPDATE/DELETE rejected
  const tplSel = await anonClient.from('image_templates').select('id,title').limit(10);
  assert(!tplSel.error, `image_templates: anonymous SELECT failed unexpectedly: ${tplSel.error?.message}`);

  const tplIns = await anonClient.from('image_templates').insert({ title: 'Anon Template', prompt: 'test' }).select();
  assert(tplIns.error, 'image_templates: anonymous INSERT succeeded unexpectedly');

  const tplUpd = await anonClient.from('image_templates').update({ title: 'Tamper' }).neq('id', '00000000-0000-0000-0000-000000000000').select();
  const tplUpdRows = Array.isArray(tplUpd.data) ? tplUpd.data.length : 0;
  assert.strictEqual(tplUpdRows, 0, 'image_templates: anonymous UPDATE modified rows');

  const tplDel = await anonClient.from('image_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000').select();
  const tplDelRows = Array.isArray(tplDel.data) ? tplDel.data.length : 0;
  assert.strictEqual(tplDelRows, 0, 'image_templates: anonymous DELETE removed rows');

  console.log(`• image_templates: SELECT allowed (${tplSel.data.length} rows), INSERT rejected (${tplIns.error.code || 'RLS'}), UPDATE=0 rows, DELETE=0 rows ✓ PASSED`);

  // Storage check as anonymous client (read-only, no bucket modifications)
  const { data: anonBuckets, error: anonBucketErr } = await anonClient.storage.listBuckets();
  const { data: tplFiles, error: tplFilesErr } = await anonClient.storage.from('templates').list('', { limit: 5 });
  const { data: attFiles, error: attFilesErr } = await anonClient.storage.from('attachments').list('', { limit: 5 });
  console.log(`• Storage (anon): listBuckets=${anonBucketErr ? 'ERR:' + anonBucketErr.message : (anonBuckets || []).length + ' buckets'}, templates.list=${tplFilesErr ? 'ERR:' + tplFilesErr.message : (tplFiles || []).length + ' items'}, attachments.list=${attFilesErr ? 'ERR:' + attFilesErr.message : (attFiles || []).length + ' items'}`);

  console.log('\nSummary: 9/9 tables anonymous RLS verified ✓ PASSED');
}

main().catch((err) => {
  console.error('RLS Verification Failed:', err.message);
  process.exit(1);
});
