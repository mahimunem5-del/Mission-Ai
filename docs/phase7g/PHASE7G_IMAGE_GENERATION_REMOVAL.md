# Phase 7G — Image Generation Removal & Future Tool Architecture (`PHASE7G_IMAGE_GENERATION_REMOVAL.md`)

**Branch**: `cleanup-backend-restructure`  
**Scope**: `/chat-next` and its dedicated AI SDK v7 orchestration (`/api/chat/ui-stream`)

---

## 1. Summary of Removal

1. **System Prompt Guardrail ([masterSystemPrompt.js](file:///d:/Ai%20platform/server/src/prompts/masterSystemPrompt.js), [uiStreamOrchestrator.js](file:///d:/Ai%20platform/server/src/ai/sdk/uiStreamOrchestrator.js))**:
   - Added `allowImageTool = true` parameter to `buildSystemPrompt(...)`.
   - `uiStreamOrchestrator.js` (used exclusively by `/chat-next`) passes `allowImageTool: false`, replacing the `generate_image` tool instruction with explicit guidance: Image Generation is not currently available in this chat workspace, never fake execution or print ```image blocks, and answer ordinary questions about charts, graphs, or how image generation works normally.
   - Legacy `aiOrchestrator.js` keeps default `allowImageTool = true` so `/` remains untouched.
2. **Removed Stream Image Adapters ([uiMessageMapper.ts](file:///d:/Ai%20platform/chat-next/src/adapters/uiMessageMapper.ts), [ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx), [universal.ts](file:///d:/Ai%20platform/chat-next/src/types/universal.ts), [uiMessageMapper.test.ts](file:///d:/Ai%20platform/chat-next/src/test/uiMessageMapper.test.ts))**:
   - Removed live `part.type === 'image'` and `name === 'image'` (`data-image`) stream-part adapters from `threadMessageToUniversalMessage` and `universalToUIMessage`.
   - Simplified message persistence in `ChatWorkspace.tsx` to `type: 'text'`.
   - Removed `capabilities.image` from `ModelCatalogItem` in `universal.ts`.
   - Replaced `generate_image` / `data-image` mock fixture in `uiMessageMapper.test.ts` with `web_search`.
3. **UI Verification**:
   - Confirmed `/chat-next` contains zero image generation loading animations, `"Generating image..."` strings, image progress indicators, or image tool buttons/selectors.
   - Passive read-only rendering in `UniversalMessageRenderer.tsx` for historical restored DB records remains non-executable.

---

## 2. Future Integration Architecture (Unified AI Tools)

When Image Generation is re-introduced in a dedicated phase, integrate it via a **Unified Tool Registry**:
1. **Tool Registry (`server/src/ai/tools/registry.js`)**:
   - Register tools declaratively (`{ name, description, inputSchema, execute, capabilityFlag }`) using Vercel AI SDK v7 `tool({ description, inputSchema, execute })`.
2. **Scoped Orchestrator Injection**:
   - `uiStreamOrchestrator.js` loads enabled tools from the registry based on workspace/user permissions and passes `{ tools }` into `streamText(...)` and `allowImageTool` dynamically into `buildSystemPrompt(...)`.
3. **Typed Stream Parts & UI Renderers**:
   - Tool execution emits standard AI SDK v7 `tool-call` / `tool-result` stream parts (never custom ad-hoc status strings), rendered by dedicated typed tool-part cards in `UniversalMessageRenderer.tsx`.
4. **Shared Backend Service Reuse**:
   - The registered `generate_image` tool handler delegates to the preserved `imageService.js` / `falService.js` infrastructure without duplicating provider credentials or breaking the Frozen Image Workspace.
