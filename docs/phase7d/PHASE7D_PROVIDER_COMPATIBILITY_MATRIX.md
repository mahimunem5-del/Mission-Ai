# Phase 7D — Provider Compatibility Matrix (`PHASE7D_PROVIDER_COMPATIBILITY_MATRIX.md`)

| Provider | Package / Adapter | Status | Notes |
| :--- | :--- | :--- | :--- |
| **OpenRouter** (GPT, etc.) | `@openrouter/ai-sdk-provider` (`^3.1.0`) | **Working (Verified Live)** | `openai/gpt-4o-mini` streamed live via `POST /api/chat/ui-stream` (`1,725 ms` first token, `1,780 ms` total) with `data-usage` and `generate_image` tool support. |
| **Mahi Engine** (Gemini) | `@ai-sdk/openai-compatible` (`^3.0.96`) | **Working (Verified Live)** | `mahi-engine` -> `gemini-3.5-flash-lite` streamed live via `MAHI_ENGINE_API_BASE_URL` with `x-goog-api-key` header. |
| **OpenAI (Native)** | `@ai-sdk/openai` | **Architecture-Ready** | Slot defined in `PROVIDER_CAPABILITY_STATUS`; not installed/activated until direct OpenAI key routing is enabled. |
| **Google Gemini (Native)** | `@ai-sdk/google` | **Architecture-Ready** | Slot defined in `PROVIDER_CAPABILITY_STATUS`. |
| **Anthropic Claude (Native)** | `@ai-sdk/anthropic` | **Architecture-Ready** | Slot defined in `PROVIDER_CAPABILITY_STATUS`. |
| **xAI Grok (Native)** | `@ai-sdk/xai` | **Architecture-Ready** | Slot defined in `PROVIDER_CAPABILITY_STATUS`. |
| **DeepSeek (Native)** | `@ai-sdk/deepseek` | **Architecture-Ready** | Slot defined in `PROVIDER_CAPABILITY_STATUS`. |
