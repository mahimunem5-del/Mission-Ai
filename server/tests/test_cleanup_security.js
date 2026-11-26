import assert from 'assert';
import { getProviderAdapter } from '../src/ai/adapters/index.js';
import { BaseProviderAdapter, trimHistoryForCostControl } from '../src/ai/adapters/baseAdapter.js';
import { isImageJsonBlock, parseImagePromptFromJsonBlock } from '../src/ai/adapters/openrouterAdapter.js';
import { createSseSession } from '../src/ai/streaming/sseStream.js';
import { EventEmitter } from 'events';

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

async function run() {
  console.log('\n=== MESTRIO CLEANUP & SECURITY UNIT TESTS ===\n');

  await test('1. getProviderAdapter routes mahi-engine and OpenRouter models cleanly', () => {
    const mahi = getProviderAdapter('mahi-engine');
    assert(mahi instanceof BaseProviderAdapter);
    assert.strictEqual(mahi.name, 'mahi-engine');

    const or = getProviderAdapter('openai/gpt-4o-mini');
    assert(or instanceof BaseProviderAdapter);
    assert.strictEqual(or.name, 'openrouter');
  });

  await test('2. trimHistoryForCostControl preserves system messages and recent turns', () => {
    const msgs = [
      { role: 'system', content: 'System prompt' },
      { role: 'user', content: 'A'.repeat(500) },
      { role: 'assistant', content: 'B'.repeat(500) },
      { role: 'user', content: 'Latest question' }
    ];
    const trimmed = trimHistoryForCostControl(msgs, 50); // ~200 chars budget
    assert.strictEqual(trimmed[0].role, 'system');
    assert.strictEqual(trimmed[trimmed.length - 1].content, 'Latest question');
  });

  await test('3. isImageJsonBlock & parseImagePromptFromJsonBlock extract pseudo-tool prompts', () => {
    const raw = '```image\n{"prompt": "a neon cyberpunk cat"}\n```';
    assert.strictEqual(isImageJsonBlock(raw), true);
    assert.strictEqual(parseImagePromptFromJsonBlock(raw), 'a neon cyberpunk cat');
    assert.strictEqual(isImageJsonBlock('Normal markdown response'), false);
  });

  await test('4. createSseSession handles headers, writeChunk, [DONE], and client abort', () => {
    const req = new EventEmitter();
    const headers = {};
    const written = [];
    const res = new EventEmitter();
    res.writableEnded = false;
    res.destroyed = false;
    res.headersSent = false;
    res.setHeader = (k, v) => { headers[k] = v; };
    res.flushHeaders = () => { res.headersSent = true; };
    res.write = (chunk) => { written.push(chunk); };
    res.end = () => { res.writableEnded = true; };

    const session = createSseSession(req, res, 'req-1');
    assert.strictEqual(headers['Content-Type'], 'text/event-stream');
    assert.strictEqual(session.isAborted(), false);

    session.writeChunk({ text: 'hello' });
    assert(written[0].includes('"text":"hello"'));

    req.emit('aborted');
    assert.strictEqual(session.isAborted(), true);
    assert.strictEqual(session.abortSignal.aborted, true);
  });

  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run();
