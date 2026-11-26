# Phase 7D — Production Readiness (`PHASE7D_PRODUCTION_READINESS.md`)

---

## Summary
- **Migrated**: `/chat-next` now runs on `@assistant-ui/ai-sdk` (`useChatRuntime` + `AssistantChatTransport`) connected to Express `POST /api/chat/ui-stream` powered by Vercel AI SDK v7 (`ai@^7.0.183`, `@openrouter/ai-sdk-provider@^3.1.0`, `@ai-sdk/openai-compatible@^3.0.96`).
- **Working Providers**: OpenRouter (`openai/gpt-4o-mini` verified live) and Mahi Engine (`gemini-3.5-flash-lite` verified live).
- **Architecture-Ready Providers**: OpenAI, Google, Anthropic, xAI, DeepSeek.
- **Preserved**: `index.html`, `/api/chat/stream`, Image Workspace, `UniversalMessageRenderer`, and all database repositories.

## Remaining Limitations & Readiness Verdict
1. **Live Chrome Browser QA**: Still pending `DevToolsActivePort` availability for visual verification of `/chat-next` with the new `useChatRuntime` transport.
2. **Database Migration**: `001_clean_schema.sql` has not yet been applied to live Supabase.
3. **Verdict**: `/chat-next` is **ready for parallel staging/browser validation**; keep `/` on `index.html` until live browser QA and `001_clean_schema.sql` are completed.
