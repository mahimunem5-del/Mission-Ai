# Supabase Verification Report — Mestrio AI

## Actual Supabase Integration Scope

1. **Client Configuration (`server/src/db/dbService.js`):**
   - Initializes `@supabase/supabase-js` using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-side service role client, `persistSession: false`).
   - **Important Architectural Fact:** Because `dbService.js` uses `SUPABASE_SERVICE_ROLE_KEY`, database queries bypass Supabase Row-Level Security (RLS). User-scoped filtering is applied in application code (`if (userId && UUID_REGEX.test(...)) query = query.eq('user_id', userId)`) rather than end-user JWT RLS enforcement.
2. **Verified Live Read Operations (`http://127.0.0.1:5001`):**
   - `GET /api/templates` -> `200` (queries Supabase `image_templates` table via `templateService.js`, with `BASE_DESIGN_TEMPLATES` fallback in `chat-next/src/data/designTemplates.ts`).
   - `GET /api/history/conversations?limit=5` -> `200` (conversation persistence verified in backend test suite).
   - `GET /api/profile` -> `200`.
3. **Client-Side Persistence (Non-Supabase):**
   - **Slides Studio** (`slidesService.ts`), **Projects** (`projectsStorage.ts`), **Library** (`libraryStorage.ts`), and **Image Studio History** (`mestrio_image_assets_v1`) currently persist in browser `localStorage`, not Supabase tables.
4. **Authentication & RLS Readiness Limitation:**
   - Local browser verification operated in `Auth: Dev / unauthenticated` mode. Authenticated multi-user JWT/RLS isolation was **not** tested in this environment and requires Supabase Auth JWT forwarding + RLS policies before multi-tenant production launch.
