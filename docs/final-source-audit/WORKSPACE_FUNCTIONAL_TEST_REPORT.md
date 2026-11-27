# Workspace Functional Test Report — Mestrio AI

- **Tested URL:** `http://127.0.0.1:5001`

## Per-Workspace Functional Results

| Workspace | What Passed | Limitations / Notes | Status |
| --- | --- | --- | --- |
| **New Chat (`/`)** | Live Chromium prompt submission (`Reply with only the exact word PONG.`) -> AI SDK v7 SSE stream (`openai/gpt-4o-mini` via OpenRouter) rendered `"PONG"` with `Copy` and `Regenerate`; 26/26 backend tests verified `web_search`, `deep-research`, `calculate_math`, Compare mode, AbortSignal, and History CRUD; 4/4 `universalRenderer.test.tsx` passed | Live local browser session ran in `Auth: Dev / unauthenticated` mode | **VERIFIED** |
| **Image Workspace (`/images`)** | View 1 hero, word-by-word typewriter + `TAB`, 4 workflow cards (`/workflows/*.jpeg`, 0 broken), Templates masonry + `#template-white-preview-modal` -> View 2 (`#image-studio-workspace`) with `#ideogram-sidebar-resizer`, 3/3 `imagesWorkspace.test.tsx` passed across all 4 finalized modes | Live AI image generation (`POST /api/generate-image`) requires live provider image generation quota/request and was not triggered to avoid external image API charges | **VERIFIED** (UI/routing/controls) / **NOT TESTED** (live paid image generation call) |
| **Slides Studio (`/slides`)** | Direct route load, hero input & Templates UI rendered, 18 desktop images loaded (`0` broken), 2/2 `slidesWorkspace.test.tsx` (create/edit/navigate/save) | Persists to `localStorage` (`slidesService.ts`), not Supabase | **VERIFIED** |
| **Projects (`/projects`)** | Direct route load, 1/1 `projectsWorkspace.test.tsx` (create, custom instructions, delete, chat isolation) | Persists to `localStorage` (`projectsStorage.ts`); project chat streams via `/api/chat/ui-stream` | **VERIFIED** |
| **Library (`/library`)** | Direct route load, search input & `+ New` button rendered, 1/1 `libraryWorkspace.test.tsx` (filter, favourites, create/delete prompt) | Persists to `localStorage` (`libraryStorage.ts`) | **VERIFIED** |
| **Settings, Account & Upgrade** | Live Chromium `#sidebar-account-btn` -> menu (`Settings`, `Upgrade plan`) -> Settings modal opened & closed; 2/2 `modals.test.tsx` | Billing/upgrade UI is client-side plan state without live Stripe/payment gateway | **VERIFIED** (UI/modals) |
