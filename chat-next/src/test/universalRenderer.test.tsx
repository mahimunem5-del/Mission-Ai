import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UniversalMessageRenderer } from '../components/UniversalMessageRenderer';
import type { UniversalMessage } from '../types/universal';

vi.mock('streamdown', () => ({
  Streamdown: ({ children }: { children: string }) => <div data-testid="streamdown">{children}</div>
}));
vi.mock('@streamdown/code', () => ({ code: {} }));
vi.mock('@streamdown/math', () => ({ math: {} }));
vi.mock('@streamdown/mermaid', () => ({ mermaid: {} }));

describe('UniversalMessageRenderer', () => {
  it('renders text, sources, images, attachments, tool calls, and unknown parts', () => {
    const msg: UniversalMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'assistant',
      status: 'completed',
      createdAt: new Date().toISOString(),
      parts: [
        { partIndex: 0, partType: 'text', payload: { text: '# Heading\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n$E=mc^2$' } },
        { partIndex: 1, partType: 'image', payload: { imageUrl: 'https://example.com/img.png', prompt: 'Neon city' } },
        { partIndex: 2, partType: 'sources', payload: { sources: [{ title: 'Docs', url: 'https://docs.example.com' }] } },
        { partIndex: 3, partType: 'tool_call', payload: { toolCallId: 'tc-1', toolName: 'web_search', args: {}, state: 'completed' } },
        { partIndex: 4, partType: 'tool_result', payload: { toolCallId: 'tc-1', toolName: 'web_search', result: { ok: true } } },
        { partIndex: 5, partType: 'custom_unknown_xyz', payload: { foo: 'bar' } }
      ],
      attachments: [
        { id: 'att-1', fileName: 'spec.pdf', mimeType: 'application/pdf', sizeBytes: 2048 }
      ],
      metadata: {
        isFallback: true,
        fallbackNotice: 'Using fallback model',
        error: { message: 'Minor warning' }
      }
    };

    render(<UniversalMessageRenderer message={msg} />);

    expect(screen.getByTestId('streamdown')).toHaveTextContent('# Heading');
    expect(screen.getByAltText('Neon city')).toHaveAttribute('src', 'https://example.com/img.png');
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('spec.pdf')).toBeInTheDocument();
    expect(screen.getByText('web_search')).toBeInTheDocument();
    expect(screen.getByText('Tool Result: web_search')).toBeInTheDocument();
    expect(screen.getByText('Unsupported content part: custom_unknown_xyz')).toBeInTheDocument();
    expect(screen.getByText('Using fallback model')).toBeInTheDocument();
    expect(screen.getByText('Minor warning')).toBeInTheDocument();
  });

  it('renders interrupted notice when generation is stopped by user', () => {
    const msg: UniversalMessage = {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      status: 'interrupted',
      createdAt: new Date().toISOString(),
      parts: [{ partIndex: 0, partType: 'text', payload: { text: 'Partial answer' } }],
      attachments: [],
      metadata: {}
    };

    render(<UniversalMessageRenderer message={msg} />);
    expect(screen.getByText('Generation stopped by user.')).toBeInTheDocument();
  });

  it('renders structured citation domain cards and streaming status cleanly', () => {
    const msg: UniversalMessage = {
      id: 'msg-3',
      conversationId: 'conv-1',
      role: 'assistant',
      status: 'streaming',
      createdAt: new Date().toISOString(),
      parts: [
        { partIndex: 0, partType: 'text', payload: { text: 'Live streaming content' } },
        {
          partIndex: 1,
          partType: 'sources',
          payload: {
            sources: [
              { title: 'Cloudflare Docs', url: 'https://www.cloudflare.com/learning/performance/http3/' }
            ]
          }
        }
      ],
      attachments: [],
      metadata: {
        statusMessage: 'Synthesizing research...'
      }
    };

    render(<UniversalMessageRenderer message={msg} />);
    expect(screen.getByText('Synthesizing research...')).toBeInTheDocument();
    expect(screen.getByText('[1]')).toBeInTheDocument();
    expect(screen.getByText('Cloudflare Docs')).toBeInTheDocument();
    expect(screen.getByText('cloudflare.com')).toBeInTheDocument();
  });

  it('renders calculate_math result card and failed tool error banner', () => {
    const msg: UniversalMessage = {
      id: 'msg-4',
      conversationId: 'conv-1',
      role: 'assistant',
      status: 'completed',
      createdAt: new Date().toISOString(),
      parts: [
        {
          partIndex: 0,
          partType: 'tool_call',
          payload: { toolCallId: 't1', toolName: 'calculate_math', args: { expression: '6 * 7' }, state: 'completed' }
        },
        {
          partIndex: 1,
          partType: 'tool_result',
          payload: {
            toolCallId: 't1',
            toolName: 'calculate_math',
            result: { ok: true, toolName: 'calculate_math', data: { expression: '6 * 7', result: 42 } }
          }
        },
        {
          partIndex: 2,
          partType: 'tool_result',
          payload: {
            toolCallId: 't2',
            toolName: 'web_search',
            isError: true,
            result: { ok: false, toolName: 'web_search', error: { message: 'Search timed out' } }
          }
        }
      ],
      attachments: [],
      metadata: {}
    };

    render(<UniversalMessageRenderer message={msg} />);
    expect(screen.getByText('6 * 7')).toBeInTheDocument();
    expect(screen.getByText('= 42')).toBeInTheDocument();
    expect(screen.getByText('Search timed out')).toBeInTheDocument();
  });
});
