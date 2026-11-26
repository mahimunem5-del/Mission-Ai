# Phase 7D — Vercel AI SDK v7 Migration Report (`PHASE7D_VERCEL_AI_SDK_MIGRATION_REPORT.md`)

**Branch**: `cleanup-backend-restructure`  
**Status**: Implemented & Verified

---

## 1. What Was Migrated
- **Backend AI SDK v7 Layer**:
  - [providerRegistry.js](file:///d:/Ai%20platform/server/src/ai/sdk/providerRegistry.js) — `resolveSdkLanguageModel()` using `@openrouter/ai-sdk-provider` (`^3.1.0`) and `@ai-sdk/openai-compatible` (`^3.0.96`).
  - [uiStreamOrchestrator.js](file:///d:/Ai%20platform/server/src/ai/sdk/uiStreamOrchestrator.js) — `orchestrateUiStream()` using `ai` (`^7.0.183`): `streamText`, `convertToModelMessages`, `createUIMessageStream`, and `pipeUIMessageStreamToResponse`, emitting standard UI Message Stream chunks plus typed `data-status`, `data-sources`, and `data-usage` parts. (Tool registration deferred to Phase 8 Universal Tool Calling System.)
  - [chatController.js](file:///d:/Ai%20platform/server/src/controllers/chatController.js) & [routes/chat.js](file:///d:/Ai%20platform/server/src/routes/chat.js) — Added `POST /api/chat/ui-stream` behind `requireAuth`, `chatRateLimiter`, and `validateChatRequest`.
- **Frontend AI SDK v7 Runtime (`chat-next/`)**:
  - Migrated [ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx) to `@assistant-ui/ai-sdk` (`^0.0.20`) `useChatRuntime` + `AssistantChatTransport` targeting `/api/chat/ui-stream` with `getAuthHeaders()`.
  - Created [uiMessageMapper.ts](file:///d:/Ai%20platform/chat-next/src/adapters/uiMessageMapper.ts) bridging `ThreadMessage` (`UIMessage`) <-> `UniversalMessage`.

## 2. Custom Components Replaced vs Preserved
- **Replaced & Removed**: `chat-next/src/adapters/sseProtocolAdapter.ts`, `chat-next/src/adapters/assistantUiAdapter.ts`, and `chat-next/src/test/sseProtocolAdapter.test.ts`.
- **Preserved Intact**:
  - `UniversalMessageRenderer.tsx`, `ChartRenderer.tsx`, `Streamdown`, `Shiki`, `KaTeX`, `Mermaid`, `Recharts`, `Sidebar.tsx`, `apiClient.ts`, `auth.ts`.
  - Classic `index.html` and legacy `POST /api/chat/stream` (for zero-risk rollback).
  - Frozen Image Workspace (untouched).
  - All database repositories (`conversationsRepository`, `messagesRepository`, `messagePartsRepository`, `attachmentsRepository`, `modelUsageRepository`, `profilesRepository`).
