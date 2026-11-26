import { describe, it, expect } from 'vitest';
import type { ThreadMessage } from '@assistant-ui/react';
import {
  threadMessageToUniversalMessage,
  universalToThreadMessageLike
} from '../adapters/uiMessageMapper';

describe('uiMessageMapper (AI SDK v7 ThreadMessage <-> UniversalMessage)', () => {
  it('maps text, data-status, data-sources, data-usage, and tool-call parts', () => {
    const tm = {
      id: 'msg-sdk-1',
      role: 'assistant',
      createdAt: new Date('2026-11-26T12:00:00.000Z'),
      status: { type: 'complete', reason: 'stop' },
      content: [
        { type: 'text', text: 'Here is your result [1].' },
        {
          type: 'data',
          name: 'status',
          data: {
            requestedModel: 'openai/gpt-4o',
            resolvedModel: 'openai/gpt-4o-mini',
            provider: 'openrouter',
            isFallback: true,
            message: 'Using fallback'
          }
        },
        {
          type: 'data',
          name: 'sources',
          data: { sources: [{ title: 'AI SDK', url: 'https://ai-sdk.dev' }] }
        },
        {
          type: 'data',
          name: 'usage',
          data: { inputTokens: 12, outputTokens: 34, totalTokens: 46 }
        },
        {
          type: 'tool-call',
          toolCallId: 'tc-1',
          toolName: 'web_search',
          args: { query: 'AI SDK v7' },
          result: { count: 1 }
        }
      ]
    } as unknown as ThreadMessage;

    const u = threadMessageToUniversalMessage(tm, 'conv-1');
    expect(u.status).toBe('completed');
    expect(u.metadata.requestedModel).toBe('openai/gpt-4o');
    expect(u.metadata.resolvedModel).toBe('openai/gpt-4o-mini');
    expect(u.metadata.isFallback).toBe(true);
    expect(u.parts.some((p) => p.partType === 'text')).toBe(true);
    expect(u.parts.some((p) => p.partType === 'sources')).toBe(true);
    expect(u.parts.some((p) => p.partType === 'tool_call')).toBe(true);
    expect(u.parts.some((p) => p.partType === 'tool_result')).toBe(true);
    expect((u.metadata.providerMeta as any)?.usage?.totalTokens).toBe(46);

    const like = universalToThreadMessageLike(u);
    expect(like.id).toBe('msg-sdk-1');
    expect(like.status).toEqual({ type: 'complete', reason: 'stop' });
  });

  it('maps cancelled ThreadMessage to interrupted status', () => {
    const tm = {
      id: 'msg-sdk-2',
      role: 'assistant',
      createdAt: new Date('2026-11-26T12:00:00.000Z'),
      status: { type: 'incomplete', reason: 'cancelled' },
      content: [{ type: 'text', text: 'Partial...' }]
    } as unknown as ThreadMessage;

    const u = threadMessageToUniversalMessage(tm, 'conv-1');
    expect(u.status).toBe('interrupted');
  });
});
