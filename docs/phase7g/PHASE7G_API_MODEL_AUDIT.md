# Phase 7G — API, Model & Environment Audit (`PHASE7G_API_MODEL_AUDIT.md`)

**Branch**: `cleanup-backend-restructure`

---

## 1. Removed from `/chat-next` & Its Dedicated Orchestration

| Category | Item | Action Taken |
| :--- | :--- | :--- |
| **Tool Definitions & Handlers** | `generate_image` tool in `uiStreamOrchestrator.js` | Already removed in Phase 7D Cleanup; verified zero executable image tools remain |
| **System Prompt Tool Instruction** | `generate_image` prompt directive in [masterSystemPrompt.js](file:///d:/Ai%20platform/server/src/prompts/masterSystemPrompt.js) | Disabled for `/chat-next` via `allowImageTool: false` in [uiStreamOrchestrator.js](file:///d:/Ai%20platform/server/src/ai/sdk/uiStreamOrchestrator.js) |
| **Stream Response Adapters** | `part.type === 'image'` & `data-image` stream mapping in [uiMessageMapper.ts](file:///d:/Ai%20platform/chat-next/src/adapters/uiMessageMapper.ts) | Removed |
| **Frontend Model Capability Type** | `capabilities.image` in [universal.ts](file:///d:/Ai%20platform/chat-next/src/types/universal.ts) | Removed |
| **Chat Message Type Emitter** | `type: ... ? 'image' : 'text'` in [ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx) | Simplified to `type: 'text'` |
| **Environment Variables (Exclusive)** | None exclusive to `/chat-next` | Zero env vars removed (all image keys are shared with Frozen Image Workspace) |
| **NPM Dependencies** | None exclusive to `/chat-next` image gen | Zero dependencies removed (all AI SDK & UI packages are shared) |

---

## 2. Intentionally Preserved (Shared with Frozen Image Workspace & Legacy `/`)

Per strict workspace protection rules, the following shared configurations and files were **NOT modified or deleted**:
- **Frozen Image Workspace & APIs**: [imageController.js](file:///d:/Ai%20platform/server/src/controllers/imageController.js), [imageModelRegistry.js](file:///d:/Ai%20platform/server/src/config/imageModelRegistry.js), [imageService.js](file:///d:/Ai%20platform/server/src/services/imageService.js), [imagePreflight.js](file:///d:/Ai%20platform/server/src/services/imagePreflight.js), [falService.js](file:///d:/Ai%20platform/server/src/services/falService.js), [templateService.js](file:///d:/Ai%20platform/server/src/services/templateService.js), `/api/generate-image`, `/api/templates`.
- **Shared Environment Variables**: `FAL_KEY`, `OPENROUTER_API_KEY` (used by both `/chat-next` text models and Frozen Image Workspace), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Legacy `/` Application**: `index.html`, `/api/chat/stream`, and `aiOrchestrator.js` (with `allowImageTool = true` default preserved).
- **`/api/models` Catalog ([modelRouter.js](file:///d:/Ai%20platform/server/src/services/modelRouter.js))**: Verified to return `16` chat/reasoning/coding models and `0` image-generation models.
