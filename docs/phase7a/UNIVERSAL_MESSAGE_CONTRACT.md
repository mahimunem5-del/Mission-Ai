# Universal Message Contract (`UNIVERSAL_MESSAGE_CONTRACT.md`)

Provider-independent message representation used across backend persistence (`messages` + `message_parts` + `attachments`) and the React + `assistant-ui` + `Streamdown` frontend.

---

## 1. Universal Message Envelope

```typescript
export type MessageRole = 'user' | 'assistant' | 'system';
export type GenerationStatus = 'streaming' | 'completed' | 'interrupted' | 'failed';

export interface UniversalMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  status: GenerationStatus;
  createdAt: string; // ISO-8601 UTC
  parts: UniversalMessagePart[];
  attachments: UniversalAttachment[];
  metadata: UniversalMessageMetadata;
}
```

## 2. Universal Message Parts (`message_parts`)

Every content element is represented as a typed, ordered part (`part_index`), independent of OpenRouter or Mahi Engine wire formats:

```typescript
export type UniversalMessagePart =
  | {
      partIndex: number;
      partType: 'text';
      payload: {
        /** Raw markdown: headings, lists, tables, fenced code (Shiki), LaTeX math (KaTeX), Mermaid, and chart blocks */
        text: string;
      };
    }
  | {
      partIndex: number;
      partType: 'sources';
      payload: {
        sources: Array<{
          title: string;
          url: string;
          domain?: string;
        }>;
      };
    }
  | {
      partIndex: number;
      partType: 'image';
      payload: {
        imageUrl: string;
        prompt?: string;
      };
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
    };
```

## 3. Attachments & Metadata Isolation

```typescript
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
  provider?: 'openrouter' | 'mahi-engine' | string | null;
  isFallback?: boolean;
  fallbackNotice?: string | null;
  searchMode?: 'none' | 'web-search' | 'deep-research';
  researchStages?: string[];
  error?: {
    code: string;
    message: string;
  } | null;
  /** Provider-specific diagnostics kept strictly out of the UI renderer */
  providerMeta?: Record<string, unknown>;
}
```

## 4. Renderer Mapping

- **`text` part** -> Passed directly to `Streamdown` (with `Shiki` for fenced code, `KaTeX` for `$...$` / `$$...$$`, `Mermaid` for `mermaid` blocks, and `Recharts` for structured chart blocks).
- **`sources` part** -> Citation chips & `[1]` inline popover references.
- **`image` part** -> Inline image card with prompt caption.
- **`tool_call` / `tool_result` parts** -> `assistant-ui` tool execution status/result components.
- **Interrupted / Failed messages** -> Rendered with `status: 'interrupted' | 'failed'`, preserving partial `text` parts without discarding user context.
