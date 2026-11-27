# File Cleanup Report — Mestrio AI

- **Branch:** `cleanup-backend-restructure`
- **Date:** 2026-11-27

## Summary Counts

- **Total Obsolete Files Deleted in Purification:** `508` files (`test_anchors.js` + `507` files in `scratch/`), in addition to `chat-next/src/components/Sidebar.tsx`, `chat-next/src/components/images/VectorStudioCanvas.tsx`, `chat-next/src/utils/imagePreprocessing.ts`, and root `index.html`.
- **Total Unused Packages Removed:** `73` packages (`image-q`, `jimp`, `potrace` + transitive dependencies in `server/`).
- **Total Obsolete Routes/Endpoints Removed:** `4` (`/vectorize`, `/create/svg/vectorize`, `/api/images/vector-illustration`, `/api/images/vectorize`).

## Files Deleted During Purification

- `D:\Ai platform\test_anchors.js` — Obsolete script reading deleted root `index.html`.
- `D:\Ai platform\scratch\*` (`507` files) — Pre-React one-off `.cjs`/`.mjs`/`.png`/`.json` debugging, migration, and screenshot artifacts.

## Files Preserved & Why

- `chat-next/src/**` (all active React + TypeScript workspaces, contexts, styles, and 9 Vitest suites).
- `server/src/**` (active Express server, AI SDK v7 chat/tool routes, image generation/edit/upscale/remove-bg routes, history, templates, models, profile, usage).
- `public/workflows/*.jpeg`, `public/templates/*.jpg`, `templates/`, `workflows/`, `i18n.js` (active static assets served by Express).
- `src/components/ImageWorkspace.tsx` and `src/utils/imagePreprocessing.ts` (**PROTECTED** in `WORKSPACE_LOCK.md`).
- `src/components/VectorStudioCanvas.tsx`, `src/data/designTemplates.ts`, `serve.json`, `vercel.json`, `_redirects` (**UNCERTAIN** / deployment configs preserved safely).
