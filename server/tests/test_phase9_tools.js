import assert from 'assert';
import app from '../src/index.js';
import {
  listToolDefinitions,
  resolveActiveTools,
  evaluateSafeMathExpression
} from '../src/ai/tools/toolRegistry.js';
import { executeUnifiedTool } from '../src/ai/tools/toolExecutor.js';

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
  console.log('\n=== PHASE 9: UNIFIED AI TOOLS ARCHITECTURE TESTS ===\n');

  await test('1. Central Tool Registry defines all 14 categories and blocks planned/disabled tools', () => {
    const defs = listToolDefinitions();
    assert(defs.length >= 14, `Expected >= 14 tool definitions, got ${defs.length}`);
    const imgTool = defs.find((d) => d.name === 'image_generation');
    assert(imgTool && !imgTool.implemented && imgTool.status === 'disabled');

    const { sdkTools, activeToolNames, rejectedTools } = resolveActiveTools({
      requestedTools: ['calculate_math', 'image_generation', 'code_execution'],
      supportsTools: true
    });
    assert(sdkTools && sdkTools.calculate_math);
    assert.deepStrictEqual(activeToolNames, ['calculate_math']);
    assert(rejectedTools.includes('image_generation') && rejectedTools.includes('code_execution'));
  });

  await test('2. Unsupported model capability disables tools cleanly', () => {
    const { sdkTools, activeToolNames } = resolveActiveTools({
      requestedTools: ['calculate_math'],
      supportsTools: false
    });
    assert.strictEqual(sdkTools, undefined);
    assert.deepStrictEqual(activeToolNames, []);
  });

  await test('3. Safe math evaluator computes valid expressions and rejects code injection', () => {
    assert.strictEqual(evaluateSafeMathExpression('(15 * 24) + sqrt(144)'), 372);
    assert.throws(() => evaluateSafeMathExpression('process.exit(1)'));
    assert.throws(() => evaluateSafeMathExpression('globalThis.fetch("x")'));
  });

  await test('4. executeUnifiedTool handles validation errors and timeouts cleanly', async () => {
    const { z } = await import('zod');
    const mockTool = {
      name: 'slow_mock',
      displayName: 'Slow Mock',
      implemented: true,
      status: 'active',
      timeoutMs: 40,
      retries: 0,
      inputSchema: z.object({ count: z.number().min(1) }),
      handler: async () => new Promise((r) => setTimeout(() => r({ ok: true }), 200))
    };

    const badInput = await executeUnifiedTool(mockTool, { count: 0 });
    assert.strictEqual(badInput.ok, false);
    assert.strictEqual(badInput.error.code, 'TOOL_VALIDATION_ERROR');

    const timedOut = await executeUnifiedTool(mockTool, { count: 2 });
    assert.strictEqual(timedOut.ok, false);
    assert.strictEqual(timedOut.error.code, 'TOOL_TIMEOUT');
  });

  await test('5. GET /api/tools, real GPT tool call (calculate_math), and unsupported model handling', async () => {
    const prevBypass = process.env.DEV_BYPASS_AUTH;
    process.env.DEV_BYPASS_AUTH = 'true';
    const server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      const toolsResp = await fetch(`${baseUrl}/api/tools`);
      assert.strictEqual(toolsResp.status, 200);
      const toolsJson = await toolsResp.json();
      assert(toolsJson.success && toolsJson.count >= 14);

      // Real GPT-4o-mini tool call
      const mathResp = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          searchMode: 'none',
          enabledTools: ['calculate_math'],
          messages: [
            {
              id: 'u-math',
              role: 'user',
              parts: [{ type: 'text', text: 'Use the calculate_math tool to compute (123 * 45) + 678.' }]
            }
          ]
        })
      });
      assert.strictEqual(mathResp.status, 200);
      const mathRaw = await mathResp.text();
      assert(mathRaw.includes('calculate_math'), 'Expected calculate_math tool invocation in UI stream');
      assert(mathRaw.includes('6213'), 'Expected exact computed result 6213 in stream');

      // Unsupported model + requested tool degrades gracefully
      const unsupResp = await fetch(`${baseUrl}/api/chat/ui-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mahi-engine',
          searchMode: 'none',
          enabledTools: ['calculate_math'],
          messages: [{ id: 'u-mahi', role: 'user', parts: [{ type: 'text', text: 'Say hello in 3 words.' }] }]
        })
      });
      assert.strictEqual(unsupResp.status, 200);
      const unsupRaw = await unsupResp.text();
      assert(unsupRaw.includes('does not support tool calling'), 'Expected unsupported model tool notice');
      assert(unsupRaw.includes('"type":"text-delta"'), 'Expected normal text response fallback');
    } finally {
      process.env.DEV_BYPASS_AUTH = prevBypass;
      await new Promise((resolve) => server.close(resolve));
    }
  });

  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Phase 9 suite error:', err);
  process.exit(1);
});
