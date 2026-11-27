# Old Chat Removal Report

**Date**: 2026-11-26  
**Branch**: `cleanup-backend-restructure`  

---

## Obsolete Old Chat Systems Removed

| Removed / Disabled Item | Location | Verification |
| :--- | :--- | :--- |
| Legacy `POST /api/chat/stream` & `POST /api/chat/` | `server/src/routes/chat.js` | `POST /api/chat/stream` returns HTTP `404` |
| Legacy `streamChat` handler & `aiOrchestrator` chat import | `server/src/controllers/chatController.js` | Only `streamUiChat` remains |
| `/classic`, `/legacy`, `/index.html` fallback routes | `server/src/index.js` | `GET /classic` returns HTTP `404` |
| Separate `/chat-next` SPA route | `server/src/index.js` | `GET /chat-next` returns HTTP `404`; `/` is the sole Chat entry |
| `Classic UI` (`/classic`) link in React sidebar | `chat-next/src/components/Sidebar.tsx` | Replaced with `/slides`, `/projects`, `/library`, `/vectorize` |
| Legacy `New chat` action inside `index.html` | `index.html` (`#new-chat-btn`) | Redirects to `window.location.href = '/'` |
| Unimplemented `planned` / `disabled` tool checkboxes in Chat UI | `chat-next/src/components/ChatWorkspace.tsx` | Tools menu filtered to `implemented && status === 'active'` only |

*(Note: `aiOrchestrator.js` is retained only for `compareController.js`'s `orchestrateCompareRequest` and is no longer exposed on `/api/chat/*`.)*
