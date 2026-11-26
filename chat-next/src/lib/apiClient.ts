import { getAuthHeaders, sanitizeClientError } from './auth';
import type {
  ConversationSummary,
  ModelCatalogItem,
  ToolCatalogItem,
  UniversalAttachment,
  UniversalMessage,
  UniversalMessagePart
} from '../types/universal';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  if (window.location.port === '5173' || window.location.port === '3000') {
    return '';
  }
  return '';
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = 'API_ERROR') {
    super(sanitizeClientError(message));
    this.status = status;
    this.code = code;
  }
}

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${url}`, {
    ...init,
    headers: getAuthHeaders((init.headers as Record<string, string>) || {})
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let code = 'API_ERROR';
    try {
      const errBody = await res.json();
      message = errBody?.error?.message || errBody?.message || errBody?.error || message;
      code = errBody?.error?.code || errBody?.code || code;
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(message, res.status, code);
  }

  return res.json() as Promise<T>;
}

export async function fetchModelsCatalog(): Promise<ModelCatalogItem[]> {
  const data = await requestJson<{ models?: ModelCatalogItem[] }>('/api/models');
  return Array.isArray(data.models) ? data.models : [];
}

export async function listConversations(limit = 50): Promise<ConversationSummary[]> {
  const res = await requestJson<{ success: boolean; data: ConversationSummary[] }>(
    `/api/history/conversations?limit=${limit}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export interface RestoredConversation extends ConversationSummary {
  messages: Array<{
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    parts?: Array<{ part_index?: number; part_type?: string; payload?: Record<string, unknown> }>;
    attachments?: Array<{ id: string; file_name: string; mime_type: string; size_bytes: number; public_url?: string | null }>;
  }>;
}

export function mapRestoredToUniversalMessages(conv: RestoredConversation): UniversalMessage[] {
  if (!conv || !Array.isArray(conv.messages)) return [];

  return conv.messages.map((m) => {
    const parts: UniversalMessagePart[] = [];
    if (Array.isArray(m.parts) && m.parts.length > 0) {
      for (const p of m.parts) {
        parts.push({
          partIndex: p.part_index ?? parts.length,
          partType: p.part_type || 'text',
          payload: (p.payload || {}) as Record<string, unknown>
        });
      }
    } else {
      if (m.content) {
        parts.push({ partIndex: 0, partType: 'text', payload: { text: m.content } });
      }
      const meta = (m.metadata || {}) as Record<string, unknown>;
      if (typeof meta.imageUrl === 'string' && meta.imageUrl) {
        parts.push({
          partIndex: parts.length,
          partType: 'image',
          payload: { imageUrl: meta.imageUrl, prompt: typeof meta.imagePrompt === 'string' ? meta.imagePrompt : undefined }
        });
      }
      if (Array.isArray(meta.sources) && meta.sources.length > 0) {
        parts.push({
          partIndex: parts.length,
          partType: 'sources',
          payload: { sources: meta.sources as Array<{ title: string; url: string; domain?: string }> }
        });
      }
    }

    const attachments: UniversalAttachment[] = Array.isArray(m.attachments)
      ? m.attachments.map((a) => ({
          id: a.id,
          fileName: a.file_name,
          mimeType: a.mime_type,
          sizeBytes: a.size_bytes,
          publicUrl: a.public_url ?? null
        }))
      : [];

    const meta = (m.metadata || {}) as Record<string, unknown>;
    const statusVal = meta.status === 'interrupted' || meta.status === 'failed' ? meta.status : 'completed';

    return {
      id: m.id,
      conversationId: m.conversation_id || conv.id,
      role: m.role,
      status: statusVal,
      createdAt: m.created_at || new Date().toISOString(),
      parts,
      attachments,
      metadata: {
        requestedModel: (meta.requestedModel as string) || (meta.model as string) || null,
        resolvedModel: (meta.resolvedModel as string) || null,
        provider: (meta.provider as string) || null,
        isFallback: Boolean(meta.isFallback),
        fallbackNotice: (meta.fallbackNotice as string) || null
      }
    };
  });
}

export async function restoreConversation(id: string): Promise<RestoredConversation | null> {
  try {
    const res = await requestJson<{ success: boolean; data: RestoredConversation }>(
      `/api/history/conversations/${encodeURIComponent(id)}`
    );
    return res.data || null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createConversation(payload: {
  id?: string;
  title?: string;
  model_id?: string;
  mode?: string;
}): Promise<ConversationSummary> {
  const res = await requestJson<{ success: boolean; data: ConversationSummary }>(
    '/api/history/conversations',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
  return res.data;
}

export async function saveMessage(
  conversationId: string,
  payload: {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type?: string;
    metadata?: Record<string, unknown>;
    parts?: UniversalMessagePart[];
    attachments?: Array<{ file_name: string; mime_type: string; size_bytes: number }>;
  }
): Promise<void> {
  await requestJson(`/api/history/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await requestJson(`/api/history/conversations/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function extractFileContent(fileData: string, fileName: string, fileType: string): Promise<string> {
  const res = await requestJson<{ success: boolean; extractedContent?: string; text?: string }>(
    '/api/files/extract',
    {
      method: 'POST',
      body: JSON.stringify({ fileData, fileName, fileType })
    }
  );
  return res.extractedContent || res.text || '';
}

export async function transcribeAudio(audioBase64: string, mimeType = 'audio/webm'): Promise<string> {
  const res = await requestJson<{ text?: string }>('/api/transcribe', {
    method: 'POST',
    body: JSON.stringify({ audio: audioBase64, mimeType })
  });
  return res.text || '';
}

export async function fetchToolsCatalog(): Promise<ToolCatalogItem[]> {
  const data = await requestJson<{ tools?: ToolCatalogItem[] }>('/api/tools');
  return Array.isArray(data?.tools) ? data.tools : [];
}
