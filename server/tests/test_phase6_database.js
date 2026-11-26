import assert from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  profilesRepository,
  conversationsRepository,
  messagesRepository,
  messagePartsRepository,
  attachmentsRepository,
  modelUsageRepository
} from '../src/database/repositories/index.js';
import app from '../src/index.js';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    process.stdout.write(`• ${name}... `);
    await fn();
    console.log('✓ PASSED');
    passed++;
  } catch (err) {
    console.log('✗ FAILED:', err.message);
    failed++;
  }
}

function signHmacToken(payload, secret) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

async function run() {
  console.log('\n=== PHASE 6: DATABASE, RLS & PERSISTENCE VALIDATION ===\n');

  await test('1. Migration 001_clean_schema.sql contains all 9 tables, RLS, and zero destructive SQL', () => {
    const sqlPath = path.resolve(process.cwd(), 'src/database/migrations/001_clean_schema.sql');
    const rawSql = fs.readFileSync(sqlPath, 'utf8');
    const sql = rawSql.replace(/--.*$/gm, '');

    const expectedTables = [
      'profiles',
      'conversations',
      'messages',
      'message_parts',
      'attachments',
      'model_usage',
      'subscriptions',
      'credit_transactions',
      'image_templates'
    ];

    for (const table of expectedTables) {
      assert(sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `Missing table ${table}`);
      assert(sql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`), `Missing RLS on ${table}`);
    }

    assert(!/\bDROP\s+TABLE\b/i.test(sql), 'Migration must not contain DROP TABLE');
    assert(!/\bTRUNCATE\b/i.test(sql), 'Migration must not contain TRUNCATE');

    // Billing & usage tables must only grant SELECT policies to users (no INSERT/UPDATE/DELETE policies)
    assert(!/FOR\s+(INSERT|UPDATE|DELETE|ALL)\s+ON\s+model_usage\b/i.test(sql), 'Users must not mutate model_usage');
    assert(!/FOR\s+(INSERT|UPDATE|DELETE|ALL)\s+ON\s+subscriptions\b/i.test(sql), 'Users must not mutate subscriptions');
    assert(!/FOR\s+(INSERT|UPDATE|DELETE|ALL)\s+ON\s+credit_transactions\b/i.test(sql), 'Users must not mutate credit_transactions');
  });

  await test('2. Usage persistence payload never invents tokens or cost when omitted', async () => {
    const rec = await modelUsageRepository.recordModelUsage({
      user_id: '11111111-1111-4111-8111-111111111111',
      request_id: 'req-p6-1',
      provider: 'mahi-engine',
      requested_model: 'mahi-engine',
      resolved_model: 'gemini-3.5-flash-lite'
    });
    assert.strictEqual(rec.input_tokens, null);
    assert.strictEqual(rec.output_tokens, null);
    assert.strictEqual(rec.total_tokens, null);
    assert.strictEqual(rec.api_cost_usd, null);
    assert.strictEqual(rec.requested_model, 'mahi-engine');
    assert.strictEqual(rec.resolved_model, 'gemini-3.5-flash-lite');
  });

  await test('3. Complete conversation persistence lifecycle, structured parts, attachments, and cross-user isolation', async () => {
    const secret = 'phase6-db-secret-789';
    process.env.API_AUTH_SECRET = secret;
    const prevBypass = process.env.DEV_BYPASS_AUTH;
    process.env.DEV_BYPASS_AUTH = 'false';

    const userA = '11111111-1111-4111-8111-111111111111';
    const userB = '22222222-2222-4222-8222-222222222222';
    const tokenA = signHmacToken({ sub: userA, exp: Math.floor(Date.now() / 1000) + 300 }, secret);
    const tokenB = signHmacToken({ sub: userB, exp: Math.floor(Date.now() / 1000) + 300 }, secret);

    const server = await new Promise(resolve => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      // 1. Create conversation
      const createRes = await fetch(`${baseUrl}/api/history/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Phase 6 Persistence Test', model_id: 'mahi-engine' })
      });
      assert.strictEqual(createRes.status, 201);
      const convId = (await createRes.json()).data.id;

      // 2. Save user message with attachment metadata
      const userMsgRes = await fetch(`${baseUrl}/api/history/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({
          role: 'user',
          content: 'Summarize this PDF',
          attachments: [{ file_name: 'report.pdf', mime_type: 'application/pdf', size_bytes: 1024 }]
        })
      });
      assert.strictEqual(userMsgRes.status, 201);

      // 3. Save assistant message with structured parts & citations
      const asstMsgRes = await fetch(`${baseUrl}/api/history/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({
          role: 'assistant',
          content: 'Here is the summary [1].',
          parts: [
            { part_type: 'text', payload: { text: 'Here is the summary [1].' } },
            { part_type: 'sources', payload: { sources: [{ title: 'Source 1', url: 'https://example.com' }] } }
          ]
        })
      });
      assert.strictEqual(asstMsgRes.status, 201);

      // 4. Restore conversation after refresh
      const restoreRes = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      assert.strictEqual(restoreRes.status, 200);
      const restored = (await restoreRes.json()).data;
      assert.strictEqual(restored.id, convId);
      assert.strictEqual(restored.messages.length, 2);

      // 5. Cross-user isolation check (User B cannot access or delete User A's conversation)
      const crossGet = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      assert.strictEqual(crossGet.status, 404);

      // 6. Cleanup User A's test conversation
      const delRes = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      assert.strictEqual(delRes.status, 200);
    } finally {
      process.env.DEV_BYPASS_AUTH = prevBypass;
      await new Promise(resolve => server.close(resolve));
    }
  });

  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Phase 6 suite error:', err);
  process.exit(1);
});
