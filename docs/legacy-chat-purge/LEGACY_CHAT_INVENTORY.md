# Legacy Chat Inventory — Mestrio AI

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## Classification Matrix

| Candidate | Classification | Action | Reason / Verification |
| :--- | :--- | :--- | :--- |
| `src/App.tsx` | `LEGACY_CHAT_ONLY` | **Deleted** | Unreferenced legacy React chat client calling removed `/api/chat/stream`. |
| `src/components/ModelDropdown.tsx` | `LEGACY_CHAT_ONLY` | **Deleted** | Unreferenced legacy chat model dropdown; `chat-next` has its own selector. |
| `src/components/ComparePickerModal.tsx` | `LEGACY_CHAT_ONLY` | **Deleted** | Unreferenced legacy chat compare modal. |
| `src/config/models.ts` | `LEGACY_CHAT_ONLY` | **Deleted** | Only imported by deleted `ModelDropdown.tsx` and `ComparePickerModal.tsx`. |
| `index.html` (`#hero-section`, `#mobile-home-container`, `#chat-box-area`, `#chat-input-card`, `#chat-free-plan-header`, `#chat-header-actions`, `#recent-chats-list`) | `LEGACY_CHAT_ONLY` | **Deleted** | Legacy chat UI markup replaced by `chat-next` at `/`. |
| `index.html` (`#mobile-home-container` CSS, `sendMessage()`, `window.sendMessage`, `initMobileHomepage()`) | `LEGACY_CHAT_ONLY` | **Deleted** | Dead CSS/JS belonging exclusively to removed `#hero-section` and `#mobile-home-container`. |
| `server/src/routes/chat.js` (`POST /api/chat/stream`, `POST /api/chat/`) & `server/src/controllers/chatController.js` (`streamChat`) | `LEGACY_CHAT_ONLY` | **Already Removed** | Only `POST /api/chat/ui-stream` (`streamUiChat`) remains; legacy endpoints return `404`. |
| `server/src/index.js` (`/classic`, `/legacy`, `/chat-next` routes) | `LEGACY_CHAT_ONLY` | **Already Removed** | `/classic` and `/legacy` return `404`; `/` and `/index.html` serve `chat-next/dist/index.html`. |
| `index.html` (`executeLiveChatStream`, `startDeepResearchFlow`, `startCompareFlow`, `renderCurrentConversation`, `renderChatMessages`, `chatState`) | `SHARED` | **Preserved** | Actively called by **Projects** workspace (`#projects-workspace`, `#project-chat-messages`). |
| `server/src/orchestrator/aiOrchestrator.js`, `researchOrchestrator.js`, `ai/adapters/*`, `compareController.js` | `SHARED` | **Preserved** | Actively used by `POST /api/chat/compare` (`orchestrateCompareRequest`, `streamCompare`). |
| `chat-next/*`, `uiStreamOrchestrator.js`, `providerRegistry.js`, `chatController.js`, `routes/chat.js`, `modelRouter.js`, `ai/model-registry/*`, `ai/tools/*`, `ai/streaming/*` | `NEW_CHAT` | **Protected** | Authoritative New Chat system; SHA-256 verified unchanged. |
| `src/components/ImageWorkspace.tsx`, `VectorStudioCanvas.tsx`, `imagePreprocessing.ts`, `designTemplates.ts`, `server/src/routes/image.js`, `controllers/imageController.js`, etc. | `NON_CHAT_WORKSPACE` | **Frozen** | Protected by `WORKSPACE_LOCK.md` (`images.locked = true`); SHA-256 verified unchanged. |
| `index.html` (`#slides-studio-workspace`, `#projects-workspace`, `#library-workspace`, `#sidebar`, `#settings-modal`, `#upgrade-modal`, `#chatgpt-feedback-modal`) | `NON_CHAT_WORKSPACE` | **Preserved** | Active `/slides`, `/projects`, and `/library` workspaces + shared shell. |
