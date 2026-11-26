# Phase 9 — Unified AI Tools Architecture Plan (`PHASE9_ARCHITECTURE_PLAN.md`)

**Branch**: `cleanup-backend-restructure`  
**Target**: `/chat-next` + Vercel AI SDK v7 Orchestrator (`server/src/ai/sdk/uiStreamOrchestrator.js`)

---

## 1. Architectural Goals

Build a single, modular, provider-independent **Unified AI Tools Architecture** inside Mestrio AI's existing Vercel AI SDK v7 + `@assistant-ui/react` stack without introducing a second chat orchestration system or modifying the Frozen Image Workspace / legacy `/`.

---

## 2. System Layers

1. **Central Tool Registry ([toolRegistry.js](file:///d:/Ai%20platform/server/src/ai/tools/toolRegistry.js))**:
   - Single source of truth for all 14 tool categories.
   - Tracks `name`, `displayName`, `category`, `description`, `implemented` (`true`/`false`), `status` (`active` | `planned` | `disabled`), `requiresModelToolCalling`, `timeoutMs`, `retries`, and Zod `inputSchema`.
2. **Unified Tool Execution Engine ([toolExecutor.js](file:///d:/Ai%20platform/server/src/ai/tools/toolExecutor.js))**:
   - Validates tool inputs via Zod, enforces timeouts and `AbortSignal` cancellation, applies bounded retries for transient network tools, emits real `data-status` progress updates, and normalizes every result into `{ ok, toolName, data | error, durationMs }`.
3. **Model & Provider Capability Mapping ([modelRouter.js](file:///d:/Ai%20platform/server/src/services/modelRouter.js), [providerRegistry.js](file:///d:/Ai%20platform/server/src/ai/sdk/providerRegistry.js))**:
   - Explicit `capabilities.tools` boolean per model.
   - Starts with supported GPT models (`openai/gpt-4o-mini`, `openai/gpt-4o`, `openai/o3-mini`) enabled for tool calling; unsupported models degrade gracefully to standard text chat with an explicit `data-status` notice.
4. **AI SDK v7 Stream Integration ([uiStreamOrchestrator.js](file:///d:/Ai%20platform/server/src/ai/sdk/uiStreamOrchestrator.js))**:
   - Passes resolved `ai.tool(...)` definitions and `stopWhen: stepCountIs(5)` into `streamText(...)`.
   - Streams standard AI SDK v7 `tool-input-*`, `tool-output-available`, and `tool-output-error` parts alongside `data-status`, `data-sources`, and `data-usage`.
5. **Discovery Endpoint ([tools.js](file:///d:/Ai%20platform/server/src/routes/tools.js))**:
   - `GET /api/tools` exposes tool metadata and availability to `/chat-next`.
6. **Frontend Tool-State Experience (`/chat-next`)**:
   - Header **Tools** selector in [ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx) for selecting implemented tools and viewing planned/disabled status honestly.
   - Real-time tool cards (`running`, `completed`, `error`) and rich result rendering (`ChartRenderer`, `SourcesSection`, `calculate_math` result pill) in [UniversalMessageRenderer.tsx](file:///d:/Ai%20platform/chat-next/src/components/UniversalMessageRenderer.tsx).
