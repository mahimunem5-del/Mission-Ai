import { describe, it, expect } from 'vitest';
import { mapRestoredToUniversalMessages } from '../lib/apiClient';
import { sanitizeClientError } from '../lib/auth';

describe('Conversation restoration & security helpers', () => {
  it('maps restored conversation messages with structured parts, attachments, and interrupted status', () => {
    const universal = mapRestoredToUniversalMessages({
      id: 'conv-1',
      title: 'Restored Thread',
      model_id: 'openai/gpt-4o-mini',
      mode: 'chat',
      created_at: '2026-11-26T10:00:00.000Z',
      messages: [
        {
          id: 'm1',
          conversation_id: 'conv-1',
          role: 'user',
          content: 'Analyze this file',
          type: 'text',
          created_at: '2026-11-26T10:00:01.000Z',
          parts: [{ part_index: 0, part_type: 'text', payload: { text: 'Analyze this file' } }],
          attachments: [
            { id: 'a1', file_name: 'data.csv', mime_type: 'text/csv', size_bytes: 512 }
          ]
        },
        {
          id: 'm2',
          conversation_id: 'conv-1',
          role: 'assistant',
          content: 'Partial...',
          type: 'text',
          metadata: { status: 'interrupted', requestedModel: 'openai/gpt-4o', resolvedModel: 'openai/gpt-4o-mini', isFallback: true },
          created_at: '2026-11-26T10:00:05.000Z'
        }
      ]
    });

    expect(universal).toHaveLength(2);
    expect(universal[0].attachments[0].fileName).toBe('data.csv');
    expect(universal[0].parts[0].partType).toBe('text');
    expect(universal[1].status).toBe('interrupted');
    expect(universal[1].metadata.requestedModel).toBe('openai/gpt-4o');
    expect(universal[1].metadata.resolvedModel).toBe('openai/gpt-4o-mini');
    expect(universal[1].metadata.isFallback).toBe(true);
  });

  it('redacts API keys from client error messages', () => {
    expect(sanitizeClientError('Bad key sk-or-v1-abcdef1234567890abcdef')).toBe('Bad key [REDACTED]');
  });
});
