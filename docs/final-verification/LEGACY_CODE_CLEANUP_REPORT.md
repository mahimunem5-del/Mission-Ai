# Legacy Code & Duplicate Cleanup Report — Mestrio AI

## Repository Audit Classification

### A. Active and Required
- `chat-next/src/**`: Unified React + TypeScript application (`MasterSidebar`, `ChatWorkspace`, `ImagesWorkspaceContainer`, `SlidesWorkspace`, `ProjectsWorkspace`, `LibraryWorkspace`, `modals/`).
- `server/src/**`: Express backend, AI SDK v7 chat/tool routes, image generation/edit/upscale/remove-bg routes, templates, slides, projects, library, profile, and history controllers.
- `public/workflows/*.jpeg`, `public/templates/*.jpg`, `i18n.js`: Active static assets served by Express.

### B. Shared / Protected Reference
- `src/components/ImageWorkspace.tsx` (SHA-256: `A3DA07D63CBE120C8A0B44EBEE223421BFFFC1A9ECA34E4C45815E5FC9AF5C7F`): Preserved untouched per `WORKSPACE_LOCK.md` listing.
- `src/utils/imagePreprocessing.ts` (SHA-256: `006E26B3A2118B3845830BCB74FD6FED993A832F4D69BD68E62E7C0E744F26AF`): Preserved untouched per `WORKSPACE_LOCK.md` listing.
- `server/src/routes/image.js` (SHA-256: `7CDB0C0E6B17FB6AEAB62C2337B50598BBAB4DC98B18442531D6495D488DA1D3`)
- `server/src/controllers/imageController.js` (SHA-256: `954A0DC0A46A41134AA08E55A27F48FE831B0AA1933D5AE582F729739E830054`)

### C. Obsolete and Unused (Removed)
- `index.html` (root legacy monolith): Deleted; Express redirects `/index.html -> /`.
- `chat-next/src/components/Sidebar.tsx` + dead `{!isEmbedded && !hideSidebar && <Sidebar ... />}` fallback in `chat-next/src/components/ChatWorkspace.tsx`: Removed during Phase 10 cleanup (replaced globally by `MasterSidebar.tsx`).
- `chat-next/src/components/images/VectorStudioCanvas.tsx` & `chat-next/src/utils/imagePreprocessing.ts`: Removed per discontinued Vectorize removal directive.
- Vectorize endpoints (`/vectorize`, `/create/svg/vectorize`, `/api/images/vectorize`, `/api/images/vector-illustration`): Removed from `server/src/index.js`, `server/src/routes/image.js`, and `server/src/controllers/imageController.js`.

### D. Uncertain — Preserved Safely
- `src/components/VectorStudioCanvas.tsx`, `src/data/designTemplates.ts`, `test_anchors.js`, `serve.json`: Not imported by `chat-next/` or `server/`; preserved to avoid unintended side effects outside scope.
