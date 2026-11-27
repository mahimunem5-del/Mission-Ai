# Legacy Chat Deletion Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## 1. Deleted Legacy Chat Files & Code

1. **Deleted Files in `src/`**:
   - `src/App.tsx`
   - `src/components/ModelDropdown.tsx`
   - `src/components/ComparePickerModal.tsx`
   - `src/config/models.ts`
2. **Deleted Legacy Chat Markup, CSS & JS in `index.html`**:
   - `#recent-chats-list` and Recents sidebar header/search/sort block.
   - `#mobile-home-container`, `#chat-free-plan-header`, `#chat-header-actions`, `#hero-section`, `#chat-box-area`, `#chat-input-card`, `#hero-quick-prompts`.
   - `#mobile-home-container` responsive CSS block.
   - `sendMessage()`, `window.sendMessage`, and `initMobileHomepage()`.
   - Startup `createNewChat()` call on empty `localStorage` and duplicate pre-init `DOMContentLoaded` workspace listener.
   - Wired `createNewChat()`, `#new-chat-btn`, `#sidebar-brand-logo`, `switchWorkspace('chat')`, and fallback startup routes to `window.location.replace('/')`.

---

## 2. Repository-Wide Remaining Legacy Search Verification

- Searched `index.html`, `server/src/`, and `chat-next/src/` for: `id="hero-section"`, `id="mobile-home-container"`, `id="chat-input-card"`, `/api/chat/stream`, `function sendMessage(`, `function initMobileHomepage(`, `streamChatResponse`, `/classic`, `/legacy`.
- **Matches found**:
  - `index.html:21936`: `const targetChatUrl = `${getApiBaseUrl()}/api/chat/stream`;` inside `executeLiveChatStream()` — **preserved** as part of `SHARED` Projects chat code (note: legacy `/api/chat/stream` returns `404` on the backend).
  - `server/src/database/migrations/PHASE6_FINAL_AUDIT.md:68`: historical audit markdown note.
- **Zero** matches for `#hero-section`, `#mobile-home-container`, `#chat-input-card`, `sendMessage(`, `initMobileHomepage(`, `streamChatResponse`, `/classic`, or `/legacy`.
- **Blocked Routes**: `GET /classic` -> `404`, `GET /legacy` -> `404`, `GET /` -> `chat-next/dist/index.html`, `GET /index.html` -> `chat-next/dist/index.html`.
