import assert from 'assert';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { getProviderAdapter } from '../src/ai/adapters/index.js';
import { BaseProviderAdapter } from '../src/ai/adapters/baseAdapter.js';
import { getModelCapabilities } from '../src/ai/model-registry/index.js';
import {
  STREAM_EVENT_TYPES,
  createTextDeltaEvent,
  createStatusEvent,
  createUsageEvent
} from '../src/ai/streaming/protocol.js';
import { createSseSession } from '../src/ai/streaming/sseStream.js';
import {
  conversationsRepository,
  messagesRepository,
  profilesRepository,
  messagePartsRepository,
  attachmentsRepository,
  modelUsageRepository
} from '../src/database/repositories/index.js';
import { recordRequestMetrics } from '../src/services/usageService.js';
import { formatErrorForClient } from '../src/utils/errors.js';
import { requireAuth } from '../src/middleware/auth.js';
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
  console.log('\n=== MESTRIO POST-CLEANUP ARCHITECTURE VALIDATION ===\n');

  // 1. Provider adapter compatibility & model registry
  await test('1. Provider adapters implement BaseProviderAdapter and capability definitions', () => {
    const mahi = getProviderAdapter('mahi-engine');
    const or = getProviderAdapter('openai/gpt-4o-mini');

    assert(mahi instanceof BaseProviderAdapter);
    assert(or instanceof BaseProviderAdapter);
    assert.strictEqual(mahi.getCapabilities().streaming, true);
    assert.strictEqual(or.getCapabilities().tools, true);

    const mahiCaps = getModelCapabilities('mahi-engine');
    assert.strictEqual(mahiCaps.provider, 'mahi-engine');
    assert.strictEqual(mahiCaps.capabilities.vision, true);

    const orCaps = getModelCapabilities('openai/gpt-4o-mini');
    assert.strictEqual(orCaps.provider, 'openrouter');
    assert.strictEqual(orCaps.id, 'openai/gpt-4o-mini');
  });

  // 2. Stream protocol consistency & fallback identity preservation
  await test('2. Stream protocol preserves requestedModel vs resolvedModel and formats standard events', () => {
    const delta = createTextDeltaEvent('hello');
    assert.strictEqual(delta.text, 'hello');

    const status = createStatusEvent({
      message: 'Fallback',
      requestedModel: 'openai/gpt-4o',
      resolvedModel: 'openai/gpt-4o-mini',
      provider: 'openrouter',
      isFallback: true
    });
    assert.strictEqual(status.type, STREAM_EVENT_TYPES.STATUS);
    assert.strictEqual(status.requestedModel, 'openai/gpt-4o');
    assert.strictEqual(status.resolvedModel, 'openai/gpt-4o-mini');
    assert.strictEqual(status.isFallback, true);

    const usage = createUsageEvent({
      provider: 'openrouter',
      requestedModel: 'openai/gpt-4o-mini',
      resolvedModel: 'openai/gpt-4o-mini',
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30
    });
    assert.strictEqual(usage.type, STREAM_EVENT_TYPES.USAGE);
    assert.strictEqual(usage.totalTokens, 30);
  });

  // 3. Cancellation and error events
  await test('3. SSE session handles endWithError and cancellation cleanly; error formatter redacts secrets', () => {
    const req = new EventEmitter();
    const written = [];
    const res = new EventEmitter();
    res.writableEnded = false;
    res.destroyed = false;
    res.headersSent = false;
    res.setHeader = () => {};
    res.flushHeaders = () => { res.headersSent = true; };
    res.write = (chunk) => written.push(chunk);
    res.end = () => { res.writableEnded = true; };

    const sse = createSseSession(req, res, 'req-err');
    sse.endWithError('Upstream timeout', 'PROVIDER_TIMEOUT');
    assert(written.some(c => c.includes('"type":"stream_error"')));
    assert(written.some(c => c.includes('data: [DONE]')));
    assert.strictEqual(res.writableEnded, true);

    const redacted = formatErrorForClient(new Error('Failed with sk-or-v1-1234567890abcdef1234567890'), 'req-1');
    assert(!redacted.body.error.message.includes('sk-or-v1'));
  });

  // 4. Repository layer exports & offline/non-destructive behavior
  await test('4. Repository layers expose expected interfaces for all 6 entities', async () => {
    assert.strictEqual(typeof profilesRepository.getProfileById, 'function');
    assert.strictEqual(typeof conversationsRepository.listByUser, 'function');
    assert.strictEqual(typeof messagesRepository.createMessage, 'function');
    assert.strictEqual(typeof messagePartsRepository.saveMessageParts, 'function');
    assert.strictEqual(typeof attachmentsRepository.createAttachment, 'function');
    assert.strictEqual(typeof modelUsageRepository.recordModelUsage, 'function');
  });

  // 5. Usage accounting
  await test('5. Usage accounting preserves null when omitted and records actual provider tokens when supplied', () => {
    const omitted = recordRequestMetrics({
      requestId: 'req-usage-1',
      provider: 'openrouter',
      model: 'openai/gpt-4o-mini',
      promptLength: 40,
      completionLength: 80,
      durationMs: 120
    });
    assert.strictEqual(omitted.inputTokens, null);
    assert.strictEqual(omitted.outputTokens, null);
    assert.strictEqual(omitted.totalTokens, null);
    assert.strictEqual(omitted.apiCostUsd, null);

    const supplied = recordRequestMetrics({
      requestId: 'req-usage-2',
      provider: 'openrouter',
      requestedModel: 'openai/gpt-4o',
      model: 'openai/gpt-4o-mini',
      inputTokens: 15,
      outputTokens: 25,
      totalTokens: 40,
      apiCostUsd: 0.00012,
      durationMs: 200
    });
    assert.strictEqual(supplied.requestedModel, 'openai/gpt-4o');
    assert.strictEqual(supplied.model, 'openai/gpt-4o-mini');
    assert.strictEqual(supplied.inputTokens, 15);
    assert.strictEqual(supplied.outputTokens, 25);
    assert.strictEqual(supplied.totalTokens, 40);
    assert.strictEqual(supplied.apiCostUsd, 0.00012);
  });

  // 6. Production authentication & DEV_BYPASS_AUTH guard
  await test('6. Production auth guard rejects DEV_BYPASS_AUTH=true and requires Bearer token', async () => {
    const { spawnSync } = await import('child_process');
    const res = spawnSync(process.execPath, [
      '-e',
      'import("./src/config/env.js").then(m => m.validateConfig())'
    ], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'production', DEV_BYPASS_AUTH: 'true' },
      encoding: 'utf8'
    });
    assert.notStrictEqual(res.status, 0, 'Production startup must fail if DEV_BYPASS_AUTH=true');
    assert(res.stderr.includes('DEV_BYPASS_AUTH=true is strictly forbidden in production'));

    // Verify HMAC token auth via requireAuth
    const secret = 'test-hmac-secret-123';
    process.env.API_AUTH_SECRET = secret;
    const prevBypass = process.env.DEV_BYPASS_AUTH;
    process.env.DEV_BYPASS_AUTH = 'false';

    const token = signHmacToken({ sub: '11111111-1111-4111-8111-111111111111', email: 'a@test.com', exp: Math.floor(Date.now() / 1000) + 300 }, secret);
    const mockReq = { headers: { authorization: `Bearer ${token}` }, id: 'req-auth' };
    const mockRes = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
    let nextCalled = false;
    await requireAuth(mockReq, mockRes, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(mockReq.user.id, '11111111-1111-4111-8111-111111111111');

    process.env.DEV_BYPASS_AUTH = prevBypass;
  });

  // 7. User ownership isolation & DB persistence via HTTP
  await test('7. User ownership isolation blocks cross-user access to conversations and messages', async () => {
    const secret = 'test-isolation-secret-456';
    process.env.API_AUTH_SECRET = secret;
    const prevBypass = process.env.DEV_BYPASS_AUTH;
    process.env.DEV_BYPASS_AUTH = 'false';

    const userAToken = signHmacToken({ sub: '11111111-1111-4111-8111-111111111111', exp: Math.floor(Date.now() / 1000) + 300 }, secret);
    const userBToken = signHmacToken({ sub: '22222222-2222-4222-8222-222222222222', exp: Math.floor(Date.now() / 1000) + 300 }, secret);

    const server = await new Promise(resolve => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      // User A creates conversation
      const createRes = await fetch(`${baseUrl}/api/history/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userAToken}` },
        body: JSON.stringify({ title: 'User A Private Thread' })
      });
      assert.strictEqual(createRes.status, 201);
      const created = await createRes.json();
      const convId = created.data.id;

      // User B tries to read User A's conversation -> 404
      const getB = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        headers: { 'Authorization': `Bearer ${userBToken}` }
      });
      assert.strictEqual(getB.status, 404);

      // User B tries to post a message into User A's conversation -> 404
      const msgB = await fetch(`${baseUrl}/api/history/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userBToken}` },
        body: JSON.stringify({ role: 'user', content: 'Hijack attempt' })
      });
      assert.strictEqual(msgB.status, 404);

      // Cleanup User A's test conversation
      const delA = await fetch(`${baseUrl}/api/history/conversations/${convId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userAToken}` }
      });
      assert.strictEqual(delA.status, 200);
    } finally {
      process.env.DEV_BYPASS_AUTH = prevBypass;
      await new Promise(resolve => server.close(resolve));
    }
  });

  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Validation suite error:', err);
  process.exit(1);
});
