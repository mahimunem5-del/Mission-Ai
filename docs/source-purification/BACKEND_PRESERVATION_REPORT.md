# Backend Preservation Report — Mestrio AI

## Preserved & Verified Backend Architecture (`server/src/`)

- **Entry Point:** `server/src/index.js` (listening on `0.0.0.0:5001`, PID `9700`).
- **AI SDK v7 & Providers:**
  - `POST /api/chat/ui-stream` (OpenRouter + Mahi Engine SSE streaming, abort signal handling).
  - `POST /api/chat/compare` (multi-provider parallel streaming, max 4 models enforced).
  - Legacy `POST /api/chat/stream` remains `404`.
- **Tools & Orchestration:** `web_search`, `deep-research`, `calculate_math` verified via `npm --prefix server test`.
- **Image Workspace Endpoints:** `/api/generate-image`, `/api/images/precise-edit`, `/api/images/upscale`, `/api/images/remove-background`, `/api/templates` preserved intact.
- **Persistence & Caching:** Supabase template client + History API (`/api/history/conversations`, `/api/conversations`) + Upstash Redis cache isolation verified (`26 passed, 0 failed`).
