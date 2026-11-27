# Shared Dependency Preservation Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

| Preserved Item | Location | Consumers | Why Kept |
| :--- | :--- | :--- | :--- |
| `executeLiveChatStream`, `startDeepResearchFlow`, `startCompareFlow`, `renderCurrentConversation`, `renderChatMessages`, `chatState` | `index.html` | Projects Workspace (`#projects-workspace`, `#project-chat-messages`) | Directly invoked by Projects chat submission & rendering handlers. |
| `#sidebar`, `#settings-modal`, `#upgrade-modal`, `#chatgpt-feedback-modal`, `switchWorkspace()`, `syncRoute()`, `getApiBaseUrl()`, `window.MESTRIO_WORKSPACES`, `i18n.js` | `index.html`, `i18n.js` | Slides Studio, Projects, Library, locked Images guard | Shared UI shell, navigation, localization, and modal infrastructure for all non-chat workspaces. |
| `aiOrchestrator.js`, `researchOrchestrator.js`, `ai/adapters/*`, `compareController.js`, `routes/compare.js` | `server/src/` | `POST /api/chat/compare` | `compareController.js` imports `orchestrateCompareRequest` from `aiOrchestrator.js`, which depends on `researchOrchestrator.js` and `ai/adapters/*`. |
| `src/data/designTemplates.ts` | `src/data/designTemplates.ts` | Image Workspace / Templates reference | Kept untouched to avoid any impact on frozen Image Workspace templates. |
