export type MessageRole = 'user' | 'assistant' | 'system';
export type GenerationStatus = 'streaming' | 'completed' | 'interrupted' | 'failed';
export type ChatMode = 'general' | 'coding' | 'reasoning';
export type SearchMode = 'none' | 'web-search' | 'deep-research';

export interface SourceItem {
  title: string;
  url: string;
  domain?: string;
}

export type UniversalMessagePart =
  | {
      partIndex: number;
      partType: 'text';
      payload: { text: string };
    }
  | {
      partIndex: number;
      partType: 'sources';
      payload: { sources: SourceItem[] };
    }
  | {
      partIndex: number;
      partType: 'image';
      payload: { imageUrl: string; prompt?: string };
    }
  | {
      partIndex: number;
      partType: 'tool_call';
      payload: {
        toolCallId: string;
        toolName: string;
        args: Record<string, unknown>;
        state: 'running' | 'completed' | 'error';
      };
    }
  | {
      partIndex: number;
      partType: 'tool_result';
      payload: {
        toolCallId: string;
        toolName: string;
        result: unknown;
        isError?: boolean;
      };
    }
  | {
      partIndex: number;
      partType: 'file';
      payload: {
        attachmentId: string;
        fileName: string;
        mimeType: string;
        sizeBytes: number;
      };
    }
  | {
      partIndex: number;
      partType: string;
      payload: Record<string, unknown>;
    };

export interface UniversalAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl?: string | null;
}

export interface UniversalMessageMetadata {
  requestedModel?: string | null;
  resolvedModel?: string | null;
  provider?: string | null;
  isFallback?: boolean;
  fallbackNotice?: string | null;
  searchMode?: SearchMode;
  statusMessage?: string | null;
  researchStages?: string[];
  error?: { code?: string; message: string } | null;
  providerMeta?: Record<string, unknown>;
}

export interface UniversalMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  status: GenerationStatus;
  createdAt: string;
  parts: UniversalMessagePart[];
  attachments: UniversalAttachment[];
  metadata: UniversalMessageMetadata;
}

export interface ModelCatalogItem {
  id: string;
  name: string;
  provider: string;
  tier?: string;
  isLocked?: boolean;
  isPro?: boolean;
  group?: string;
  desc?: string;
  openRouterModel?: string;
  capabilities?: {
    streaming?: boolean;
    reasoning?: boolean;
    coding?: boolean;
    tools?: boolean;
  };
}

export interface ToolCatalogItem {
  name: string;
  displayName: string;
  category: string;
  description: string;
  implemented: boolean;
  status: 'active' | 'planned' | 'disabled';
  enabledByDefault: boolean;
  requiresModelToolCalling: boolean;
}

export interface ConversationSummary {
  id: string;
  title: string;
  model_id: string;
  mode: string;
  project_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export function extractTextFromParts(parts: UniversalMessagePart[]): string {
  return parts
    .filter((p): p is Extract<UniversalMessagePart, { partType: 'text' }> => p.partType === 'text')
    .map((p) => (typeof p.payload?.text === 'string' ? p.payload.text : ''))
    .join('\n\n');
}
