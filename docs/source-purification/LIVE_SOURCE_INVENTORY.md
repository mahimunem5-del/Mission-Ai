# Live Source Inventory — Mestrio AI

- **Baseline Live URL:** `http://127.0.0.1:5001`
- **Branch:** `cleanup-backend-restructure`
- **Canonical Frontend:** `chat-next/` (React 18 + TypeScript + Vite)
- **Canonical Backend:** `server/src/index.js` (Node.js + Express + AI SDK v7 + OpenRouter + Mahi Engine + Supabase + Upstash Redis)

## 1. Active Frontend Files (`chat-next/src/`)

| Category | File(s) | Role in Live Website |
| --- | --- | --- |
| Entry & Root | `main.tsx`, `App.tsx`, `index.css` | React 18 mount (`#root`), workspace router, modal host |
| Config & Lib | `config/workspaces.ts`, `lib/apiClient.ts`, `lib/auth.ts`, `types/universal.ts`, `adapters/uiMessageMapper.ts` | Route normalization, API client, auth headers, AI SDK v7 message mapping |
| Contexts | `AppShellContext.tsx`, `AuthProfileContext.tsx`, `ChatSessionContext.tsx`, `I18nContext.tsx`, `ThemeContext.tsx` | Shared sidebar state, profile/plan, mount-time `RECENTS` hydration, i18n/RTL, theme tokens |
| Layout & Modals | `MasterSidebar.tsx`, `AccountDropdownMenu.tsx`, `RecentChatsList.tsx`, `CommandPaletteModal.tsx`, `SettingsModal.tsx`, `PlanSelectionModal.tsx`, `DeleteAccountModal.tsx`, `FeedbackModal.tsx` | Unified sidebar (`#sidebar`), account menu, settings, upgrade/billing, command palette |
| New Chat (`/`) | `ChatWorkspace.tsx`, `UniversalMessageRenderer.tsx`, `ChartRenderer.tsx` | AI SDK v7 streaming (`AssistantChatTransport`), Markdown/KaTeX/Shiki/Mermaid/Recharts |
| Image Workspace (`/images`) | `ImagesWorkspaceContainer.tsx`, `ImageWorkspace.tsx`, `ImageHomeView.tsx`, `TemplatePreviewModal.tsx`, `ImageStudioEditor.tsx`, `ImageLightboxModal.tsx`, `imageStudioConstants.tsx`, `data/designTemplates.ts`, `styles/images.css` | 1:1 Ideogram-style View 1 & View 2 (`Generate Image`, `Remove Background`, `Precise Edit`, `Upscale Image`) |
| Slides Studio (`/slides`) | `SlidesWorkspace.tsx`, `SlidesDeckViewer.tsx`, `SlidesTemplateModal.tsx`, `services/slidesService.ts`, `styles/slides.css` | Deck generation, viewer, templates, export |
| Projects (`/projects`) | `ProjectsWorkspace.tsx`, `ProjectDetailView.tsx`, `ProjectModals.tsx`, `services/projectsStorage.ts`, `styles/projects.css` | Project CRUD, custom instructions, isolated chats |
| Library (`/library`) | `LibraryWorkspace.tsx`, `LibraryModals.tsx`, `services/libraryStorage.ts`, `styles/library.css` | Asset/prompt library, search, favourites, grid/list |
| Shared Styles | `styles/tokens.css`, `styles/sidebar.css`, `styles/modals.css` | Theme variables, sidebar & modal styling |

## 2. Active Backend Files (`server/src/`)

- **Entry & Middleware:** `index.js`, `config/env.js`, `config/imageModelRegistry.js`, `middleware/rateLimit.js`, `middleware/validate.js`, `utils/errors.js`, `utils/imageOptimizer.js`, `utils/logger.js`
- **Routes & Controllers:**
  - `routes/chat.js` -> `controllers/chatController.js` (`/api/chat/ui-stream`, `/api/chat/compare`, `/api/chat/*`)
  - `routes/image.js` -> `controllers/imageController.js` (`/api/generate-image`, `/api/images/precise-edit`, `/api/images/upscale`, `/api/images/remove-background`)
  - `routes/templates.js` -> `controllers/templateController.js` -> `services/templateService.js`
  - `routes/history.js` -> `controllers/historyController.js` (`/api/history/conversations`, `/api/conversations`)
  - `routes/models.js` -> `controllers/modelsController.js` (`/api/models`)
  - `routes/profile.js` -> `controllers/profileController.js` (`/api/profile`)
  - `routes/tools.js`, `routes/transcribe.js`, `routes/usage.js`, `routes/health.js`
- **Orchestration & Services:** `orchestrator/aiOrchestrator.js`, `orchestrator/compareOrchestrator.js`, `orchestrator/researchOrchestrator.js`, `services/cacheService.js`, `services/imagePreflight.js`, `services/imageService.js`, `services/mahiEngineResolver.js`, `services/modelRouter.js`, `services/preciseEditPlanner.js`, `services/promptIntelligence.js`, `services/referenceIntelligence.js`, `services/searchService.js`, `services/usageService.js`, `services/imageAdapters/*.js`

## 3. Classification of Non-Runtime / Legacy Candidates

| Path | Classification | Action |
| --- | --- | --- |
| `test_anchors.js` | **OBSOLETE** (reads deleted `index.html`) | Remove |
| `scratch/` | **OBSOLETE** (200+ pre-React one-off `.cjs`/`.png` debug scripts) | Remove |
| `server/package.json` deps: `jimp`, `potrace`, `image-q` | **OBSOLETE** (0 imports; only used by discontinued Vectorize) | Remove via `npm --prefix server uninstall` |
| `src/components/ImageWorkspace.tsx`, `src/utils/imagePreprocessing.ts` | **PROTECTED** (listed in `WORKSPACE_LOCK.md`) | Preserve untouched |
| `src/components/VectorStudioCanvas.tsx`, `src/data/designTemplates.ts`, `serve.json`, `vercel.json`, `_redirects`, `templates/`, `workflows/` | **UNCERTAIN** (static/deploy config or root fallback assets) | Preserve safely |
