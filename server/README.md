# Mestrio AI Backend

Modular Express backend powering Mestrio AI's multi-model chat, compare mode, web search, deep research, image generation/editing, file extraction, voice transcription, and conversation persistence.

## Architecture

```text
server/
  src/
    ai/
      adapters/          # Unified Provider Adapter interface (OpenRouter & Mahi Engine)
      streaming/         # Centralized SSE streaming & abort lifecycle (sseStream.js)
    config/              # Environment config & image model registry
    controllers/         # HTTP & SSE request controllers
    database/
      migrations/        # Non-destructive SQL schema migrations
    db/                  # Supabase persistence service & base schema
    middleware/          # Auth (Supabase JWT / HMAC), CORS, rate limiting, validation, error handling
    orchestrator/        # Central AI & Deep Research orchestration
    prompts/             # Master system prompt builder
    providers/           # Low-level API clients (OpenRouter, Mahi Engine, Serper)
    routes/              # Express route definitions
    services/            # Model router, cache, search, image intelligence, templates, usage
    utils/               # Error classes, logger with secret redaction, sharp image optimizer
    index.js             # Express app bootstrap & middleware wiring
  tests/                 # Automated backend test suites
```

## Running & Testing

```bash
cd server
npm install
npm start       # Start server on PORT (default 5001)
npm test        # Run core backend verification suite
```
