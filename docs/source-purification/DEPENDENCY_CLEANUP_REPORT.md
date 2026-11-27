# Dependency Cleanup Report — Mestrio AI

## Server Dependencies (`server/package.json` & `server/package-lock.json`)

- **Removed:** `image-q`, `jimp`, `potrace` (and `70` transitive packages — `73` total packages removed via `npm --prefix server uninstall image-q jimp potrace`).
- **Verification:** `Select-String` across `server/src/` confirmed `0` remaining references to `jimp`, `potrace`, or `image-q`. Post-removal `npm --prefix server test` passed **26/26** tests.
- **Retained:** `@ai-sdk/openai-compatible`, `@openrouter/ai-sdk-provider`, `@supabase/supabase-js`, `@upstash/redis`, `ai` (`^7.0.183`), `axios`, `cors`, `dotenv`, `express`, `mammoth`, `openai`, `pdf-parse`, `sharp`, `xlsx`, `zod`.

## Frontend Dependencies (`chat-next/package.json`)

- Audited all dependencies (`react`, `react-dom`, `@ai-sdk/react`, `@assistant-ui/*`, `@streamdown/*`, `katex`, `lucide-react`, `mermaid`, `recharts`, `shiki`, `streamdown`, `clsx`, `tailwind-merge`). All are actively imported by `chat-next/src/`.
