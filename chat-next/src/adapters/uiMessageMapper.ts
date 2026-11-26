import type { ThreadMessage, ThreadMessageLike } from '@assistant-ui/react';
import type { UIMessage } from '@ai-sdk/react';
import type {
  GenerationStatus,
  SourceItem,
  UniversalMessage,
  UniversalMessageMetadata,
  UniversalMessagePart
} from '../types/universal';
import { extractTextFromParts } from '../types/universal';

/**
 * Maps an @assistant-ui/react ThreadMessage (backed by Vercel AI SDK v7 UIMessage)
 * into Mestrio's provider-independent UniversalMessage contract for UniversalMessageRenderer.
 */
export function threadMessageToUniversalMessage(
  tm: ThreadMessage,
  conversationId: string,
  restoredOverlay?: UniversalMessage
): UniversalMessage {
  const parts: UniversalMessagePart[] = [];
  const metadata: UniversalMessageMetadata = {
    ...(restoredOverlay?.metadata || {})
  };

  for (const part of tm.content as unknown as Array<Record<string, any>>) {
    if (!part || typeof part !== 'object') continue;

    if (part.type === 'text' && typeof part.text === 'string') {
      parts.push({ partIndex: parts.length, partType: 'text', payload: { text: part.text } });
    } else if (part.type === 'tool-call') {
      const hasError = Boolean(
        part.isError ||
        part.status?.type === 'incomplete' ||
        (part.result && typeof part.result === 'object' && part.result.ok === false)
      );
      const callState = hasError
        ? 'error'
        : part.result !== undefined
          ? 'completed'
          : 'running';
      parts.push({
        partIndex: parts.length,
        partType: 'tool_call',
        payload: {
          toolCallId: String(part.toolCallId || ''),
          toolName: String(part.toolName || 'tool'),
          args: (part.args || {}) as Record<string, unknown>,
          state: callState
        }
      });
      if (part.result !== undefined) {
        parts.push({
          partIndex: parts.length,
          partType: 'tool_result',
          payload: {
            toolCallId: String(part.toolCallId || ''),
            toolName: String(part.toolName || 'tool'),
            result: part.result,
            isError: hasError
          }
        });
      }
    } else if (part.type === 'data') {
      const name = String(part.name || '');
      const data = (part.data || {}) as Record<string, any>;
      if (name === 'status') {
        if (typeof data.requestedModel === 'string') metadata.requestedModel = data.requestedModel;
        if (typeof data.resolvedModel === 'string') metadata.resolvedModel = data.resolvedModel;
        if (typeof data.provider === 'string') metadata.provider = data.provider;
        if (typeof data.isFallback === 'boolean') metadata.isFallback = data.isFallback;
        if (typeof data.message === 'string' && data.message) {
          metadata.statusMessage = data.message;
          if (data.isFallback) metadata.fallbackNotice = data.message;
        }
      } else if (name === 'sources' && Array.isArray(data.sources)) {
        parts.push({
          partIndex: parts.length,
          partType: 'sources',
          payload: { sources: data.sources as SourceItem[] }
        });
      } else if (name === 'usage') {
        metadata.providerMeta = { ...(metadata.providerMeta || {}), usage: data };
      }
    }
  }

  // Preserve restored non-text parts (e.g. sources, images) if not already in ThreadMessage content
  if (restoredOverlay) {
    for (const rp of restoredOverlay.parts) {
      if (rp.partType !== 'text' && !parts.some((p) => p.partType === rp.partType)) {
        parts.push({ ...rp, partIndex: parts.length });
      }
    }
  }

  let status: GenerationStatus = 'completed';
  if (tm.role === 'assistant' && tm.status) {
    if (tm.status.type === 'running') status = 'streaming';
    else if (tm.status.type === 'incomplete') {
      if (tm.status.reason === 'cancelled') status = 'interrupted';
      else {
        status = 'failed';
        if (tm.status.error) {
          metadata.error = { message: String(tm.status.error) };
        }
      }
    }
  }

  return {
    id: tm.id,
    conversationId,
    role: tm.role,
    status,
    createdAt: tm.createdAt ? tm.createdAt.toISOString() : new Date().toISOString(),
    parts,
    attachments: restoredOverlay?.attachments || [],
    metadata
  };
}

/**
 * Converts a restored UniversalMessage into assistant-ui ThreadMessageLike for runtime.thread.reset().
 */
export function universalToThreadMessageLike(msg: UniversalMessage): ThreadMessageLike {
  const text = extractTextFromParts(msg.parts);
  return {
    id: msg.id,
    role: msg.role,
    content: text ? [{ type: 'text', text }] : [],
    createdAt: new Date(msg.createdAt),
    status:
      msg.role === 'assistant'
        ? msg.status === 'streaming'
          ? { type: 'running' }
          : msg.status === 'interrupted'
            ? { type: 'incomplete', reason: 'cancelled' }
            : msg.status === 'failed'
              ? { type: 'incomplete', reason: 'error', error: msg.metadata.error?.message }
              : { type: 'complete', reason: 'stop' }
        : undefined
  };
}

/**
 * Converts a restored UniversalMessage into an AI SDK v7 UIMessage for useChat.setMessages().
 */
export function universalToUIMessage(msg: UniversalMessage): UIMessage {
  const parts: UIMessage['parts'] = [];
  for (const p of msg.parts) {
    if (p.partType === 'text' && typeof p.payload?.text === 'string') {
      parts.push({ type: 'text', text: p.payload.text });
    } else if (p.partType === 'sources' && Array.isArray(p.payload?.sources)) {
      parts.push({ type: 'data-sources', data: { sources: p.payload.sources } } as any);
    }
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', text: '' });
  }
  return {
    id: msg.id,
    role: msg.role,
    parts
  };
}
