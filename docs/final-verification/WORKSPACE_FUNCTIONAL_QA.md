# Workspace Functional QA — Mestrio AI

- **Target Live URL:** `http://127.0.0.1:5001`

## Functional Verification Matrix

| Workspace / Feature | Checks Performed | Result | Status |
| --- | --- | --- | --- |
| **New Chat (`/`)** | Live AI SDK v7 SSE streaming (`POST /api/chat/ui-stream`), Web Search, Deep Research, `calculate_math` tool, Compare mode, Abort/disconnect handling, History CRUD (`POST`/`GET`/`DELETE /api/history/conversations`), Markdown/Tables/Code/Mermaid unit tests (`universalRenderer.test.tsx`) | 26/26 backend tests + 4/4 renderer tests passed | **VERIFIED** |
| **Image Workspace (`/images`)** | View 1 (`Imagine it. Craft it.`), word-by-word typewriter placeholder + `TAB` badge, 4 workflow cards (`/workflows/*.jpeg` all HTTP 200), Templates masonry + `#template-white-preview-modal` click-through to View 2, `#ideogram-sidebar-resizer`, 4 finalized modes (`Generate Image`, `Remove Background`, `Precise Edit`, `Upscale Image`), `#studio-lightbox-modal` | Live Chromium + 3/3 `imagesWorkspace.test.tsx` tests passed | **VERIFIED** |
| **Slides Studio (`/slides`)** | Direct route load, 18 visible images on desktop (`0` broken), Slides workspace controls & persistence unit tests (`slidesWorkspace.test.tsx`) | Live Chromium + 2/2 unit tests passed | **VERIFIED** |
| **Projects (`/projects`)** | Direct route load, project listing/creation/instructions/chat isolation (`projectsWorkspace.test.tsx`) | Live Chromium + 1/1 unit test passed | **VERIFIED** |
| **Library (`/library`)** | Direct route load, seed items, filtering, favourites, prompt create/delete (`libraryWorkspace.test.tsx`) | Live Chromium + 1/1 unit test passed | **VERIFIED** |
| **Settings / Account / Upgrade** | `#sidebar-account-btn` opens account menu (`Settings`, `Upgrade plan`), `SettingsModal` opens and closes (`Esc`), billing toggle & plan selection tested (`modals.test.tsx`) | Live Chromium + 2/2 unit tests passed | **VERIFIED** |
| **Vectorize (Discontinued)** | Removed from frontend UI, routing, and backend routes (`/vectorize`, `/create/svg/vectorize`, `/api/images/vectorize`, `/api/images/vector-illustration` return `404`) | Confirmed removed | **NOT IMPLEMENTED** (Removed by owner request) |
