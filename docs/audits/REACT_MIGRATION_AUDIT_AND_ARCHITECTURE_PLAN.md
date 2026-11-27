# Mestrio AI — Frontend Audit & React Migration Architecture Plan (Step 1)

> **Status:** Step 1 Read-Only Audit & Architecture Plan Complete  
> **Scope:** Unify the Mestrio AI frontend (Master Sidebar, Mobile Navigation, Slides Studio, Projects, Library, and Shared Modals/Settings) into the existing React + TypeScript application (`chat-next/`), while keeping the current visual design, existing Node.js/Express backend, New Chat AI pipeline, and locked Image Workspace (`WORKSPACE_LOCK.md`) 100% intact.  
> **Constraint:** No application source code was modified during this step.

---

## 1. Executive Summary

Currently, Mestrio AI runs a **hybrid shell architecture**:
1. **Legacy Monolithic Shell (`index.html`, 44,926 lines / ~2.68 MB):** Serves `/` and non-chat SPA routes (`/slides`, `/projects`, `/library`, `/images`, `/vectorize`, `/create/svg/vectorize`), rendering the master left sidebar (`#sidebar`), mobile drawer, Slides Studio (`#slides-studio-workspace`), Projects (`#projects-workspace`), Library (`#library-workspace`), all shared modals (Settings, Account, Plan/Upgrade, Search Command Palette, Delete Account), and the locked Image Workspace (`#image-home-view`, `#image-studio-workspace`, `#image-chat-workspace`).
2. **Embedded React + TypeScript Chat App (`chat-next/`):** Built with Vite + React 18 + TypeScript + Tailwind CSS + `@assistant-ui/react` + `@ai-sdk/react` (Vercel AI SDK v7). Currently served at `/chat-embed` and mounted inside `index.html` via `<iframe id="chat-next-frame" src="/chat-embed?embedded=1">`, communicating with the parent shell over `window.postMessage`.

**Goal of Steps 2–7:** Promote `chat-next/` to become the **single unified React + TypeScript frontend** served at `/` (and all non-API SPA routes), eliminating the `<iframe>` + `postMessage` split for Chat, Sidebar, Slides, Projects, Library, and Modals—while strictly respecting `WORKSPACE_LOCK.md` (`images: { locked: true, hideInSidebar: true }`) and preserving every backend API contract untouched.

---

## 2. Complete Workspace & Component Inventory

### 2.1 Legacy Frontend Entry & Localization
| Asset | Path | Size / Lines | Role |
| :--- | :--- | :--- | :--- |
| Legacy Shell | `index.html` | 2,680,953 B (44,926 lines) | Monolithic HTML + `<style>` + `<script>` shell |
| Localization | `i18n.js` | 144,213 B (2,555 lines) | 52-language `window.MestrioI18n` + RTL mirroring (`ar`, `he`, `fa`, `ur`) |
| Root Package | `package.json` | 328 B | Scripts: `dev`/`start` (`server/`), `build` (`chat-next/`) |
| Static Assets | `public/` | — | `logo.png`, `templates/*`, `workflows/*` |

### 2.2 Master Left Sidebar & Mobile Navigation (`index.html`)
- **Overlay & Search:**
  - `#sidebar-overlay` (`L3182`) — mobile backdrop (`fixed inset-0 bg-black/40 z-40 md:hidden`)
  - `#chat-search-modal-overlay` / `#chat-search-modal` / `#command-palette-search-input` / `#command-palette-results` (`L3186–L3209`) — Command Palette search modal
- **Desktop & Mobile Sidebar (`#sidebar`, `L3212–L4349`):**
  - Brand Header (`L3216–L3234`): `#sidebar-brand-logo` (`/public/logo.png`), `#sidebar-search-btn`, `#sidebar-toggle-btn` (collapses `#sidebar` via `.sidebar-collapsed`)
  - Primary Nav (`L3237–L3269`):
    - `#new-chat-btn` (`switchWorkspace('chat')` / `createNewChat()`)
    - `#sidebar-nav-images` (hidden when `MESTRIO_WORKSPACES.images.hideInSidebar === true`)
    - `#sidebar-nav-slides` (`switchWorkspace('slides-studio')`)
    - `#sidebar-nav-projects` (`switchWorkspace('projects')`)
    - `#sidebar-nav-library` (`switchWorkspace('library')`)
  - Recents List (`L3272–L3395`): `#recent-chats-list`, `#chat-item-context-menu` (Pin, Rename, Add/Change Project `#chat-project-submenu`, Delete `#recent-chat-delete-modal`), sort popover (`L3482–L4322`)
  - Profile Footer (`L4327–L4348`): `#sidebar-account-btn`, `#sidebar-user-avatar`, `#sidebar-user-name`, `#sidebar-user-plan-label`
- **Iframe Chat Mount (`L4354–L4356`):**
  - `#react-chat-workspace` containing `<iframe id="chat-next-frame" src="/chat-embed?embedded=1">`
  - `postMessage` bridge (`L40814–L40857`): `mestrio:toggle-mobile-sidebar`, `mestrio:conversations-sync`, `mestrio:select-conversation`, `mestrio:new-chat` (`L22194`)

### 2.3 Slides Studio Workspace (`index.html`)
- **DOM:**
  - `#slides-studio-workspace` (`L8116–L8782`)
  - Composer & Controls: `#slides-composer-box`, `#slides-prompt-input`, `#slides-add-btn`, `#slides-file-input`, `#slides-count-dropdown`, `#slides-tone-dropdown`, `#slides-style-dropdown`, `#slides-visual-dropdown`, `#slides-generate-btn`
  - Loading & Deck Viewer: `#slides-loading-state` (`#slides-progress-bar`), `#slides-presentation-deck` (`#slides-deck-prev`, `#slides-deck-next`, `#slides-active-canvas`, `#slides-thumbnail-strip`, `#slides-export-btn`)
  - Templates Grid & Preview Modal: `#slides-templates-section` (`#slides-template-search`, `#slides-templates-grid`), `#slides-template-modal` (`L8020–L8112`)
- **JS Logic:** `slidesStudioState`, `SLIDES_TEMPLATES`, `generateSlides()`, deck navigation & export (`L33937–L36453`). Currently frontend-only (`FRONTEND ONLY` banner at `L8114`).

### 2.4 Projects Workspace (`index.html`)
- **DOM:**
  - `#projects-workspace` (`L8786–L9722`)
  - List View: `#projects-list-view`, `#projects-count-badge`, `#projects-empty-state`, `#projects-grid-container`, `#projects-cards-grid`
  - Detail View: `#btn-back-to-projects`, `#project-account-memory-toggle`, project composer, files, instructions
  - Modals: `#project-create-modal` (`L10137`), `#project-edit-modal` (`L10196`), `#project-delete-confirm-modal` (`L10254`), `#project-rename-chat-modal` (`L9659`), `#project-delete-chat-modal` (`L9692`), `#project-file-preview-modal` (`L10082`)
- **JS Logic:** `PROJECT_FILES_PREFIX` (`project_files_`), `PROJECT_MEMORY_PREFIX` (`project_memory_`), `renderProjectsList()` (`L37306`), `openProjectDetail()` (`L37965`), `localStorage`-backed project & file persistence (`L36454–L38992`).

### 2.5 Library Workspace (`index.html`)
- **DOM:**
  - `#library-workspace` (`L9726–L10081`)
  - Toolbar: `#library-search-input`, `#library-new-btn` / `#library-new-dropdown` (`#library-opt-upload-file`, `#library-opt-new-chat`, `#library-opt-gen-image`, `#library-opt-slides`), `#library-tabs-list` (`all`, `favourites`, `images`, `files`), `#library-filter-dropdown`, `#library-sort-dropdown`, `#library-view-grid-btn`, `#library-view-list-btn`
  - Views & Modals: `#library-empty-state`, `#library-grid-view`, `#library-list-view`, `#library-prompt-modal` (`L9946`), `#library-preview-modal` (`L9999`), `#library-delete-modal` (`L10057`)
- **JS Logic:** `LIBRARY_STORAGE_KEY` (`library_items`), `DEFAULT_LIBRARY_ITEMS`, `saveLibraryItemsToStorage()` (`L39166`), `renderLibraryItems()` (`L39492`), filter/sort/upload handlers (`L38993–L40422`).

### 2.6 Shared Modals, Dropdowns, Settings & Account UI (`index.html`)
- **Plan / Upgrade Modal:** `#plan-selection-modal` (`L10291–L10506`), `#upgrade-toggle-monthly`, `#upgrade-toggle-annual`, `window.openUpgradeModal` (`L11625`)
- **Settings Modal:** `#settings-modal` (`L10510–L11156`) with 6 panels:
  - `#settings-panel-general` (name edit, email, default workspace `#workspace-dropdown-menu`)
  - `#settings-panel-appearance` (Light / Dark / System cards)
  - `#settings-panel-language` (52-language search + grid via `window.MestrioI18n`)
  - `#settings-panel-notifications` (`#settings-toggle-updates`, `#settings-toggle-security`)
  - `#settings-panel-subscription` (`#settings-sub-plan-badge`, `#settings-sub-action-btn`)
  - `#settings-panel-privacy` (`#settings-toggle-history`, `#settings-export-chats-btn`, `#settings-clear-chats-btn`)
  - `#settings-panel-account` (`#settings-account-edit-profile-btn`, `#settings-account-logout-btn`, `#settings-account-delete-btn`)
- **Delete Account Modal:** `#delete-account-modal` (`L11160–L11209`)
- **Feedback Modal:** `#chatgpt-feedback-modal` (`L11213–L11269`)
- **Account Dropdown Menu:** `#account-dropdown-menu` (`L11273–L11517`) with `#appearance-submenu`, `#language-submenu`, `#account-menu-settings`, `#account-menu-help`, `#account-menu-upgrade`, `#account-menu-logout`

### 2.7 Existing React + TypeScript App (`chat-next/`)
- **Config:** `chat-next/package.json`, `chat-next/vite.config.ts` (proxies `/api` to `http://127.0.0.1:5001`, outputs to `chat-next/dist/`), `chat-next/tsconfig.json`, `chat-next/tailwind.config.js`, `chat-next/index.html`
- **Source (`chat-next/src/`):**
  - `main.tsx`, `App.tsx` (renders `<ChatWorkspace />`), `index.css`
  - `components/ChatWorkspace.tsx` (994 lines — `@assistant-ui/react`, `@ai-sdk/react`, `AssistantChatTransport`, `isEmbedded` + `postMessage` sync)
  - `components/Sidebar.tsx` (115 lines — standalone fallback sidebar, hidden when `isEmbedded === true`)
  - `components/UniversalMessageRenderer.tsx`, `components/ChartRenderer.tsx`
  - `adapters/uiMessageMapper.ts`, `types/universal.ts`
  - `lib/apiClient.ts`, `lib/auth.ts`
  - `test/` (`historyAndModels.test.ts`, `uiMessageMapper.test.ts`, `universalRenderer.test.tsx`)

---

## 3. Design System & CSS Preservation Map

To ensure **100% visual parity** when migrating out of `index.html`:

1. **Typography & Fonts (`index.html` L37–L46):**
   - Preserve Google Fonts import (`Inter`, `Instrument Serif`, `Plus Jakarta Sans`, `Noto Sans Arabic`, `Noto Sans Bengali`, `Noto Sans Devanagari`, `Noto Sans JP`, `Noto Sans SC`) in `chat-next/index.html` and font-family stack in `chat-next/src/index.css`.
2. **CSS Custom Properties (`index.html` L1387–L1423):**
   - Light mode (`:root`): `--chat-text: #1f1f1f`, `--chat-heading: #18181b`, `--chat-muted: #71717a`, `--chat-border: #e4e4e7`, `--chat-inline-code-bg: rgba(113, 113, 122, 0.12)`, `--chat-table-head-bg: #f4f4f5`, `--chat-accent: #2563eb`, `--chat-user-bubble-bg: #f4f4f5`, `--chat-user-bubble-text: #18181b`.
   - Dark mode (`html.dark` / `:root:not(.light)`): `--chat-text: #e4e4e7`, `--chat-heading: #fafafa`, `--chat-muted: #a1a1aa`, `--chat-border: #27272a`, `--chat-inline-code-bg: rgba(255, 255, 255, 0.1)`, `--chat-table-head-bg: #27272a`, `--chat-accent: #60a5fa`, `--chat-user-bubble-bg: #27272a`, `--chat-user-bubble-text: #f4f4f5`.
   - Keep `chat-next/src/index.css` HSL tokens (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`) for `ChatWorkspace` compatibility.
3. **Sidebar & Shell Styles (`index.html` L179–L195, L471–L775, L2172–L2205):**
   - Extract `#sidebar`, `#sidebar.sidebar-collapsed`, `#sidebar.mobile-open`, `html[dir="rtl"] #sidebar`, `.sidebar-nav-item`, `.sidebar-label`, `.perplexity-scrollbar`, and `html.dark` overrides into dedicated modular CSS files (`chat-next/src/styles/tokens.css`, `chat-next/src/styles/sidebar.css`, `chat-next/src/styles/workspaces.css`) imported by `chat-next/src/main.tsx`.
4. **Tailwind Strategy:**
   - `index.html` uses Tailwind CDN; `chat-next/` uses compiled Tailwind v3 (`tailwind.config.js`). Ensure `darkMode: 'class'` is configured in `chat-next/tailwind.config.js` so `html.dark` toggles apply identically across all migrated Tailwind `dark:*` classes.

---

## 4. Shared JavaScript, Auth & Localization Dependency Map

| Legacy Mechanism (`index.html`) | Target React / TS Abstraction (`chat-next/src/`) | Notes |
| :--- | :--- | :--- |
| `window.MESTRIO_WORKSPACES` Proxy (`L12650–L12755`) | `src/config/workspaces.ts` + `useWorkspaceLock()` | Enforces `locked` & `hideInSidebar` guards; redirects blocked routes to `chat` (`/`) |
| `switchWorkspace()` + `popstate` (`L28908`, `L40860`) | `WorkspaceRouter` / React state + `window.history.pushState` (or `react-router-dom`) | Syncs `/`, `/slides`, `/projects`, `/library` cleanly |
| `window.mestrioAuthToken` / `localStorage('mestrio_auth_token')` | `src/lib/auth.ts` (`getAuthToken`, `setAuthToken`, `getAuthHeaders`) | Already implemented in `chat-next/src/lib/auth.ts`; add `useAuth` / `AuthContext` for profile & logout |
| `postMessage` bridge (`mestrio:conversations-sync`, `mestrio:new-chat`, `mestrio:select-conversation`, `mestrio:toggle-mobile-sidebar`) | Shared `ChatContext` / `AppShellContext` | Eliminates `<iframe>` and `postMessage` overhead once Sidebar & Chat live in the same React tree |
| `window.MestrioI18n` (`/i18n.js`) | `src/lib/i18n.ts` + `useI18n()` hook | Load `/i18n.js` in `chat-next/index.html` or wrap `window.MestrioI18n` with React state for instant RTL/52-language re-renders |
| `localStorage` (`project_files_*`, `project_memory_*`, `library_items`, settings/appearance/plan) | Typed storage services (`src/services/projectsStorage.ts`, `src/services/libraryStorage.ts`, `src/services/settingsStorage.ts`) | Preserves exact `localStorage` keys so existing user data is never lost |

> **Note on Supabase Client:** No client-side `supabase.createClient` SDK is instantiated in `index.html`. Authentication is handled via Bearer JWT (`mestrio_auth_token`) validated by `server/src/middleware/auth.js` (`supabase.auth.getUser(bearerToken)` or HMAC `API_AUTH_SECRET`, with `DEV_BYPASS_AUTH` in non-production).

---

## 5. Backend & API Contract Map (No Backend Rewrite Needed)

Inspected `server/src/index.js` and `server/src/routes/*.js`:

| Domain | Endpoints | Auth / Middleware |
| :--- | :--- | :--- |
| **Health** | `GET /health`, `GET /api/health` | Public |
| **Chat & Compare** | `POST /api/chat/ui-stream`, `POST /api/chat/compare` | `requireAuth`, `chatRateLimiter`, `validateChatRequest` / `validateCompareRequest` |
| **Models & Tools** | `GET /api/models`, `GET /api/tools` | Public |
| **History** | `GET /api/history/conversations`, `GET /api/history/conversations/:id`, `POST /api/history/conversations`, `POST /api/history/conversations/:id/messages`, `GET /api/history/conversations/:id/messages/:messageId/parts`, `DELETE /api/history/conversations/:id` (plus `/api/conversations*` aliases) | `requireAuth`, `generalRateLimiter` |
| **Profile & Usage** | `GET /api/profile`, `PUT /api/profile`, `GET /api/usage`, `GET /api/attachments` | `requireAuth`, `generalRateLimiter` |
| **Files & Audio** | `POST /api/files/extract`, `POST /api/transcribe` | `requireAuth`, `generalRateLimiter` (50 MB limit) |
| **Image (LOCKED)** | `POST /api/generate-image/*`, `/api/images/*`, `/api/image/*`, `GET/POST/PUT/DELETE /api/templates`, `/api/admin/templates` | `requireAuth` (on image & admin template writes) |
| **SPA Static Serving** | `GET /chat-embed`, `GET /`, `GET /index.html` (-> 302 `/`), `GET *` (`VALID_NON_CHAT_SPA_ROUTES`: `/create/svg/vectorize`, `/vectorize`, `/images`, `/slides`, `/projects`, `/library`) | Express static (`chat-next/dist` + `rootDir` + `public`) |

**Confirmation:** Zero backend API logic needs to be rewritten. Only in **Step 7 (Legacy Cleanup)** will `server/src/index.js` static/SPA route serving be updated to serve `chat-next/dist/index.html` at `/` and for `VALID_NON_CHAT_SPA_ROUTES` (while keeping `/images` / `/vectorize` locked/guarded as configured).

---

## 6. Protected & Frozen Boundaries (`WORKSPACE_LOCK.md`)

Per `WORKSPACE_LOCK.md` and `window.MESTRIO_WORKSPACES`:
```js
images: { locked: true, hideInSidebar: true }
```

### Strictly Frozen Image Workspace Files (DO NOT MODIFY)
- `src/components/ImageWorkspace.tsx`
- `src/components/VectorStudioCanvas.tsx`
- `src/utils/imagePreprocessing.ts`
- `src/data/designTemplates.ts`
- `server/src/routes/image.js`, `server/src/routes/templates.js`
- `server/src/controllers/imageController.js`, `server/src/controllers/templateController.js`
- `server/src/config/imageModelRegistry.js`
- `server/src/services/imageService.js`, `preciseEditPlanner.js`, `referenceIntelligence.js`, `imagePreflight.js`, `templateService.js`, `promptIntelligence.js`, `imageAdapters/*`, `server/src/utils/imageOptimizer.js`

### Strictly Protected New Chat AI Backend Files (DO NOT MODIFY)
- `server/src/routes/chat.js`, `server/src/routes/compare.js`, `server/src/routes/models.js`, `server/src/routes/tools.js`, `server/src/routes/history.js`
- `server/src/controllers/chatController.js`, `compareController.js`, `historyController.js`
- `server/src/ai/sdk/uiStreamOrchestrator.js`, `providerRegistry.js`
- `server/src/ai/adapters/*`, `server/src/ai/streaming/*`, `server/src/ai/tools/*`, `server/src/ai/model-registry/*`
- `server/src/orchestrator/aiOrchestrator.js`, `researchOrchestrator.js`
- `server/src/services/modelRouter.js`, `mahiEngineResolver.js`

---

## 7. Recommended Modular Folder Architecture (`chat-next/src/`)

```text
chat-next/src/
├── main.tsx
├── App.tsx                          # Root providers + Unified Shell + WorkspaceRouter
├── index.css                        # Tailwind base + HSL tokens
├── styles/
│   ├── tokens.css                   # Extracted :root / html.dark CSS vars & fonts
│   ├── sidebar.css                  # #sidebar, .sidebar-collapsed, mobile drawer, RTL
│   └── workspaces.css               # Shared scrollbars, modals, Slides/Projects/Library styles
├── config/
│   └── workspaces.ts                # MESTRIO_WORKSPACES lock config & route guard helpers
├── context/
│   ├── AppShellContext.tsx          # Active workspace, sidebar collapsed/mobile, theme, i18n
│   ├── AuthProfileContext.tsx       # Token, /api/profile, user name/plan state
│   └── ChatSessionContext.tsx       # Shared conversations list, activeConvId, select/new/delete
├── components/
│   ├── layout/
│   │   ├── MasterSidebar.tsx        # Replaces #sidebar (brand, search, nav, recents, profile footer)
│   │   ├── RecentChatsList.tsx      # Recents + 3-dot context menu + pin/rename/project/delete
│   │   └── MobileDrawerOverlay.tsx  # Mobile backdrop & drawer sync
│   ├── chat/
│   │   ├── ChatWorkspace.tsx        # Existing chat-next workspace (connected directly to ChatSessionContext)
│   │   ├── UniversalMessageRenderer.tsx
│   │   └── ChartRenderer.tsx
│   ├── slides/
│   │   ├── SlidesWorkspace.tsx      # Slides Studio main view & composer
│   │   ├── SlidesDeckViewer.tsx     # Active slide canvas, thumbnail strip, export
│   │   └── SlidesTemplateModal.tsx  # Template preview & selection modal
│   ├── projects/
│   │   ├── ProjectsWorkspace.tsx    # Projects grid & empty state
│   │   ├── ProjectDetailView.tsx    # Project instructions, memory toggle, files, chats
│   │   └── ProjectModals.tsx        # Create, edit, delete, rename chat, file preview modals
│   ├── library/
│   │   ├── LibraryWorkspace.tsx     # Search, tabs, filter/sort, grid/list views
│   │   └── LibraryModals.tsx        # Preview, prompt, delete modals
│   └── modals/
│       ├── CommandPaletteModal.tsx  # Chat search modal (#chat-search-modal)
│       ├── AccountDropdownMenu.tsx  # Profile popover + appearance/language submenus
│       ├── SettingsModal.tsx        # 6-tab Settings modal
│       ├── PlanSelectionModal.tsx   # Monthly/Annual upgrade modal
│       ├── DeleteAccountModal.tsx   # Account deletion confirmation
│       └── FeedbackModal.tsx        # Dislike / share feedback modal
├── hooks/
│   ├── useWorkspaceNavigation.ts    # URL <-> workspace state + popstate + lock guard
│   ├── useTheme.ts                  # Light / Dark / System + html.dark class sync
│   └── useI18n.ts                   # Bridge to window.MestrioI18n (52 languages + RTL)
├── services/
│   ├── slidesService.ts             # Slides state, templates, generation & export helpers
│   ├── projectsStorage.ts           # localStorage project_files_* & project_memory_*
│   └── libraryStorage.ts            # localStorage library_items & seed data
├── adapters/
│   └── uiMessageMapper.ts           # Existing
├── lib/
│   ├── apiClient.ts                 # Existing + profile/usage helpers
│   └── auth.ts                      # Existing
└── types/
    └── universal.ts                 # Existing + WorkspaceId, Project, LibraryItem, SlideDeck types
```

---

## 8. Step-by-Step Execution Roadmap (Steps 2–7)

| Step | Scope | Key Deliverables | Risks & Rollback |
| :--- | :--- | :--- | :--- |
| **Step 2** | **Unified Sidebar, Theme, i18n & Routing** | Extract CSS tokens/sidebar styles; implement `workspaces.ts` lock guard, `AppShellContext`, `MasterSidebar`, `RecentChatsList`, `CommandPaletteModal`, and `ChatSessionContext` directly in `chat-next/`. Keep `index.html` intact as fallback during build verification. | **Risk:** CSS conflicts between `chat-next/src/index.css` and `sidebar.css`. **Rollback:** Revert `chat-next/src/App.tsx`; `/chat-embed` & `index.html` remain untouched. |
| **Step 3** | **Slides Studio Migration** | Port `SLIDES_TEMPLATES`, `SlidesWorkspace`, `SlidesDeckViewer`, and `SlidesTemplateModal` into `chat-next/src/components/slides/` with identical classes and `html.dark` support. | **Risk:** Missing dropdown close/outside-click handlers or export regressions. **Rollback:** Isolate behind `/slides` route in `WorkspaceRouter`. |
| **Step 4** | **Projects Workspace Migration** | Port `ProjectsWorkspace`, `ProjectDetailView`, `ProjectModals`, and `projectsStorage.ts` preserving `project_files_*` and `project_memory_*` `localStorage` keys and chat-to-project assignment. | **Risk:** Breaking `localStorage` schema compatibility. **Rollback:** Keep exact JSON keys/shapes; unit-test storage adapter. |
| **Step 5** | **Library Workspace Migration** | Port `LibraryWorkspace`, `LibraryModals`, and `libraryStorage.ts` preserving `library_items` key, tabs, filters, sort, grid/list toggle, and file/image uploaders. | **Risk:** Large base64/blob previews in memory. **Rollback:** Reuse `URL.createObjectURL` cleanup on modal close. |
| **Step 6** | **Shared Modals, Settings, Account & Upgrade** | Port `AccountDropdownMenu`, `SettingsModal` (all 6 tabs), `PlanSelectionModal`, `DeleteAccountModal`, `FeedbackModal`, and wire `/api/profile` + `useTheme` + `useI18n`. | **Risk:** `i18n.js` DOM-scanning vs React virtual DOM re-renders. **Rollback:** Trigger `MestrioI18n.applyTranslations()` on language/route change via `useEffect`. |
| **Step 7** | **Unified Serving Switchover, Legacy Cleanup & QA** | Update `server/src/index.js` so `/` and `VALID_NON_CHAT_SPA_ROUTES` serve `chat-next/dist/index.html` (removing the `<iframe>` split), archive/remove legacy non-locked shell code from `index.html`, verify `images` lock guard (`hideInSidebar: true`, `/images` & `/vectorize` blocked), and run `vitest` + `tsc -b` + `vite build` + end-to-end smoke checks. | **Risk:** Breaking Express static fallback or locked Image routes. **Rollback:** Keep `index.html` backup / git revert of `server/src/index.js` route switch. |

---

*End of Step 1 Audit & Architecture Plan. Awaiting user approval before beginning Step 2.*
