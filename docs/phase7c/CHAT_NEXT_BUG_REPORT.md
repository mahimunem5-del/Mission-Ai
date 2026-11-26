# `/chat-next` Bug Report (`CHAT_NEXT_BUG_REPORT.md`)

---

## Bugs Found & Fixed During Phase 7B/7C QA

1. **Pre-Aborted `AbortSignal` Hang in `sseProtocolAdapter.ts`** (Fixed)
   - **Symptom**: `streamMestrioChat` could hang waiting on `reader.read()` if `AbortSignal` was already aborted before the reader loop started.
   - **Fix**: Added immediate `if (input.signal.aborted) onAbort();` check and `abort` listener calling `reader.cancel()` in [sseProtocolAdapter.ts](file:///d:/Ai%20platform/chat-next/src/adapters/sseProtocolAdapter.ts).

2. **Mobile Sidebar Layout Overflow in `Sidebar.tsx` & `ChatWorkspace.tsx`** (Fixed)
   - **Symptom**: Fixed `w-64` (`256px`) sidebar remained permanently visible on mobile (`375px`) viewports, squeezing `<main>` to `119px`.
   - **Fix**: Converted [Sidebar.tsx](file:///d:/Ai%20platform/chat-next/src/components/Sidebar.tsx) to `hidden md:flex` with a mobile slide-over drawer (`isOpenMobile`) and added a mobile menu toggle button in [ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx).

3. **TypeScript Narrowing Errors on `UniversalMessagePart`** (Fixed)
   - **Symptom**: `tsc -b` failed to narrow `text` payload across union variants.
   - **Fix**: Added `extractTextFromParts` type guard helper in [universal.ts](file:///d:/Ai%20platform/chat-next/src/types/universal.ts).

---

## Open / Unresolved Limitations
- **Live Chrome Visual QA Pending**: Automated Chrome DevTools connection failed (`DevToolsActivePort` missing), so live browser visual inspection of Shiki/KaTeX/Mermaid/Recharts and `MediaRecorder` microphone UX is pending.
- **Database Migration Pending**: `001_clean_schema.sql` has not been applied to live Supabase yet.
