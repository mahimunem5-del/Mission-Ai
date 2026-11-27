# Remaining Dead Code Audit — Mestrio AI

## Static & Runtime Classification

| Item | Classification | Evidence & Disposition |
| --- | --- | --- |
| `chat-next/src/**` (42 source files + 9 test files) | **Active** | Every component, context, service, and stylesheet is imported by `App.tsx`, `main.tsx`, or Vitest suites. |
| `server/src/index.js`, `routes/*`, `controllers/*`, `services/*`, `orchestrator/*` | **Active / Shared** | Mounted in `server/src/index.js` or tested by `server/tests/runAllTests.js`. |
| `server/src/routes/attachments.js`, `server/src/routes/usage.js`, `server/src/routes/compare.js` | **Shared / Backend-Only** | Mounted in Express; not directly called by current `chat-next/src/` UI. Preserved safely. |
| `src/components/ImageWorkspace.tsx`, `src/utils/imagePreprocessing.ts` | **Protected** | Listed in `WORKSPACE_LOCK.md`; preserved untouched. |
| `src/components/VectorStudioCanvas.tsx`, `src/data/designTemplates.ts`, `serve.json`, `vercel.json`, `_redirects`, `templates/`, `workflows/` | **Uncertain** | Not imported by `chat-next/`, though `express.static(rootDir)` exposes root static folders. Preserved safely without guessing. |
| `index.html`, `Sidebar.tsx`, `VectorStudioCanvas.tsx` (in `chat-next/`), `test_anchors.js`, `scratch/*`, `jimp`/`potrace`/`image-q` | **Confirmed Dead (Removed)** | Previously removed; verified `0` broken imports and passing builds/tests. |
