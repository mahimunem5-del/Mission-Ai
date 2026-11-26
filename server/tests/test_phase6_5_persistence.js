import assert from 'assert';
import crypto from 'crypto';
import {
  messagePartsRepository,
  conversationsRepository
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
  console.log('\n=== PHASE 6.5: PERSISTENCE & RESTORATION VALIDATION ===\n');

  await test('1. Deterministic message_parts IDs prevent duplicate parts on re-save', async () => {
    const msgId = '33333333-3333-4333-8333-333333333333';
    const partsA = await messagePartsRepository.saveMessageParts(msgId, [
      { part_type: 'text', payload: { text: 'Markdown + $E=mc^2$ + ```js\nconsole.log(1)\n```' } },
      { part_type: 'sources', payload: { sources: [{ title: 'Ref 1', url: 'https://example.com' }] } }
    ]);
    const partsB = await messagePartsRepository.saveMessageParts(msgId, [
      { part_type: 'text', payload: { text: 'Markdown + $E=mc^2$ + ```js\nconsole.log(1)\n```' } },
      { part_type: 'sources', payload: { sources: [{ title: 'Ref 1', url: 'https://example.com' }] } }
    ]);
    assert.strictEqual(partsA.length, 2);
    assert.strictEqual(partsA[0].id, partsB[0].id);
    assert.strictEqual(partsA[1].id, partsB[1].id);
  });

  await test('2. Runtime routes (/api/profile, /api/attachments, /api/usage, /api/history) enforce auth & isolation', async () => {
    const secret = 'phase6-5-secret-key';
    process.env.API_AUTH_SECRET = secret;
    const prevBypass = process.env.DEV_BYPASS_AUTH;
    process.env.DEV_BYPASS_AUTH = 'false';

    const userA = '11111111-1111-4111-8111-111111111111';
    const userB = '22222222-2222-4222-8222-222222222222';
    const tokenA = signHmacToken({ sub: userA, email: 'a@mestrio.ai', name: 'User A', exp: Math.floor(Date.now() / 1000) + 300 }, secret);
    const tokenB = signHmacToken({ sub: userB, email: 'b@mestrio.ai', name: 'User B', exp: Math.floor(Date.now() / 1000) + 300 }, secret);

    const server = await new Promise(resolve => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      // Unauthenticated rejections
      assert.strictEqual((await fetch(`${baseUrl}/api/profile`)).status, 401);
      assert.strictEqual((await fetch(`${baseUrl}/api/attachments`)).status, 401);
      assert.strictEqual((await fetch(`${baseUrl}/api/usage`)).status, 401);

      // Profile GET & PUT
      const profGet = await fetch(`${baseUrl}/api/profile`, { headers: { Authorization: `Bearer ${tokenA}` } });
      assert.strictEqual(profGet.status, 200);
      const profPut = await fetch(`${baseUrl}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ full_name: 'User A Updated', preferred_language: 'en' })
      });
      assert.strictEqual(profPut.status, 200);
      assert.strictEqual((await profPut.json()).data.full_name, 'User A Updated');

      // Attachments & Usage GET
      assert.strictEqual((await fetch(`${baseUrl}/api/attachments`, { headers: { Authorization: `Bearer ${tokenA}` } })).status, 200);
      assert.strictEqual((await fetch(`${baseUrl}/api/usage`, { headers: { Authorization: `Bearer ${tokenA}` } })).status, 200);

      // Full conversation persistence & restoration lifecycle
      const convRes = await fetch(`${baseUrl}/api/history/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ title: 'Phase 6.5 Restore Thread' })
      });
      assert.strictEqual(convRes.status, 201);
      const convId = (await convRes.json()).data.id;

      // Save user message (order 1)
      const uMsgRes = await fetch(`${baseUrl}/api/history/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({
          role: 'user',
          content: 'Analyze chart and math',
          created_at: '2026-11-26T10:00:00.000Z'
        })
      });
      assert.strictEqual(uMsgRes.status, 201);
      const uMsgId = (await uMsgRes.json()).data.id;

      // Save interrupted assistant message (order 2)
      const aMsgRes = await fetch(`${baseUrl}/api/history/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({
          role: 'assistant',
          content: 'Partial response before abort...',
          metadata: { status: 'interrupted', requestedModel: 'mahi-engine' },
          created_at: '2026-11-26T10:00:05.000Z'
        })
      });
      assert.strictEqual(aMsgRes.status, 201);

      // Restore conversation & verify ordering, metadata, parts/attachments arrays
      const restoreRes = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      assert.strictEqual(restoreRes.status, 200);
      const restored = (await restoreRes.json()).data;
      assert.strictEqual(restored.messages.length, 2);
      assert.strictEqual(restored.messages[0].role, 'user');
      assert.strictEqual(restored.messages[1].role, 'assistant');
      assert.strictEqual(restored.messages[1].metadata.status, 'interrupted');
      assert(Array.isArray(restored.messages[0].parts), 'Restored message includes parts array');
      assert(Array.isArray(restored.messages[0].attachments), 'Restored message includes attachments array (graceful when empty/missing)');

      // Message parts endpoint & cross-user rejection
      const partsOk = await fetch(`${baseUrl}/api/history/conversations/${convId}/messages/${uMsgId}/parts`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      assert.strictEqual(partsOk.status, 200);

      const partsCross = await fetch(`${baseUrl}/api/history/conversations/${convId}/messages/${uMsgId}/parts`, {
        headers: { Authorization: `Bearer ${tokenB}` }
      });
      assert.strictEqual(partsCross.status, 404);

      const convCross = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${tokenB}` }
      });
      assert.strictEqual(convCross.status, 404);

      // Cleanup
      const delRes = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenA}` }
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
  console.error('Phase 6.5 suite error:', err);
  process.exit(1);
});
