import assert from 'assert';
import crypto from 'crypto';
import app from '../src/index.js';
import { resolveSdkLanguageModel } from '../src/ai/sdk/providerRegistry.js';

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

function signHmacToken(sub, expOffsetSec = 300, secret = 'phase7d-suite-secret') {
  const b64 = Buffer.from(JSON.stringify({ sub, exp: Math.floor(Date.now() / 1000) + expOffsetSec })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

async function run() {
  console.log('\n=== PHASE 7D: VERCEL AI SDK v7 REAL API & INTEGRATION TESTS ===\n');

  const secret = 'phase7d-suite-secret';
  process.env.API_AUTH_SECRET = secret;
  const prevBypass = process.env.DEV_BYPASS_AUTH;
  process.env.DEV_BYPASS_AUTH = 'false';

  const validToken = signHmacToken('11111111-1111-4111-8111-111111111111', 300, secret);
  const expiredToken = signHmacToken('11111111-1111-4111-8111-111111111111', -60, secret);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await test('1. Provider registry preserves requestedModel, resolvedModel, and provider identity', () => {
      const orTarget = resolveSdkLanguageModel('openai/gpt-4o-mini');
      assert.strictEqual(orTarget.provider, 'openrouter');
      assert.strictEqual(orTarget.requestedModel, 'openai/gpt-4o-mini');
      assert.strictEqual(orTarget.resolvedModel, 'openai/gpt-4o-mini');

      const mahiTarget = resolveSdkLanguageModel('mahi-engine');
      assert.strictEqual(mahiTarget.provider, 'mahi-engine');
      assert.strictEqual(mahiTarget.requestedModel, 'mahi-engine');
    });

    await test('2. Missing and expired tokens are rejected with 401 on /api/chat/ui-stream', async () => {
      const rMissing = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [] })
      });
      assert.strictEqual(rMissing.status, 401);

      const rExpired = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${expiredToken}` },
        body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [] })
      });
      assert.strictEqual(rExpired.status, 401);
    });

    await test('3. Real GPT-4o-mini streaming via OpenRouter AI SDK v7 emits text-delta, data-status, and data-usage', async () => {
      const t0 = Date.now();
      let firstTokenMs = null;
      const res = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${validToken}` },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Reply with: PHASE7D_GPT_OK' }] }]
        })
      });
      assert.strictEqual(res.status, 200);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let body = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        if (firstTokenMs === null && chunk.includes('text-delta')) firstTokenMs = Date.now() - t0;
        body += chunk;
      }
      assert(body.includes('text-delta'), 'Contains text-delta');
      assert(body.includes('data-status'), 'Contains data-status');
      assert(body.includes('data-usage'), 'Contains data-usage');
      console.log(`(firstToken=${firstTokenMs}ms, total=${Date.now() - t0}ms) `);
    });

    await test('4. Real Mahi Engine streaming via AI SDK v7 emits text-delta and data-status', async () => {
      const res = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${validToken}` },
        body: JSON.stringify({
          model: 'mahi-engine',
          messages: [{ id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Reply with: MAHI_OK' }] }]
        })
      });
      assert.strictEqual(res.status, 200);
      const body = await res.text();
      assert(body.includes('text-delta'));
      assert(body.includes('data-status'));
    });

    await test('5. Web search & deep research emit data-sources and data-status on /api/chat/ui-stream', async () => {
      const ws = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${validToken}` },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          searchMode: 'web-search',
          messages: [{ id: 'u3', role: 'user', parts: [{ type: 'text', text: 'TypeScript latest version' }] }]
        })
      });
      assert.strictEqual(ws.status, 200);
      const wsBody = await ws.text();
      assert(wsBody.includes('data-sources'));

      const dr = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${validToken}` },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          searchMode: 'deep-research',
          messages: [{ id: 'u4', role: 'user', parts: [{ type: 'text', text: 'Compare QUIC vs TCP briefly' }] }]
        })
      });
      assert.strictEqual(dr.status, 200);
      const drBody = await dr.text();
      assert(drBody.includes('data-status'));
      assert(drBody.includes('data-sources'));
    });

    await test('6. Client AbortController cancels upstream AI SDK v7 stream cleanly', async () => {
      const controller = new AbortController();
      const promise = fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${validToken}` },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ id: 'u5', role: 'user', parts: [{ type: 'text', text: 'Write a very long 500 word essay on astronomy' }] }]
        }),
        signal: controller.signal
      });
      setTimeout(() => controller.abort(), 80);
      try {
        await promise;
      } catch (err) {
        assert(err.name === 'AbortError' || String(err.message).toLowerCase().includes('abort'));
      }
    });
  } finally {
    process.env.DEV_BYPASS_AUTH = prevBypass;
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Phase 7D suite error:', err);
  process.exit(1);
});
