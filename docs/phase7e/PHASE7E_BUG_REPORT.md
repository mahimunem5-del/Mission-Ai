# Phase 7E — Bug Report (`PHASE7E_BUG_REPORT.md`)

---

## Bugs Found & Fixed During Live Browser QA

1. **`threadRuntime.subscribe` Not Re-Rendering `useChatRuntime` Messages** (Fixed)
   - **Symptom**: Backend streamed responses (`completionLength: 586`), but `InnerChatWorkspace` did not re-render streamed messages.
   - **Fix**: Switched to `useAuiState((s) => s.thread.messages)` and `useAuiState((s) => s.thread.isRunning)` from `@assistant-ui/react` in [ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx).

2. **`threadRuntime.reset()` Not Updating `useChat` Messages on Conversation Restore** (Fixed)
   - **Symptom**: After `Page.reload`, clicking a saved conversation in the sidebar returned `restoredAssistantMsgs: 0`.
   - **Fix**: Switched to `useChat({ transport })` + `useAISDKRuntime(chatHelpers)` and called `chatHelpers.setMessages(mapped.map(universalToUIMessage))` on restore/new chat (`restoredAssistantMsgs: 3` verified after fix).

3. **Streamdown Tailwind Classes Purged** (Fixed)
   - **Symptom**: Streamdown's internal utility classes were not included in Tailwind's `content` scan.
   - **Fix**: Added `./node_modules/streamdown/dist/**/*.js` and `./node_modules/@streamdown/*/dist/**/*.js` to [tailwind.config.js](file:///d:/Ai%20platform/chat-next/tailwind.config.js).

4. **375px Mobile Header Mode Selector Clipping** (Fixed)
   - **Symptom**: `General | Coding | Reasoning` slightly clipped on `375px` mobile screens.
   - **Fix**: Added `flex-wrap` and `max-w-[170px] sm:max-w-none` on the model `<select>` in [ChatWorkspace.tsx](file:///d:/Ai%20platform/chat-next/src/components/ChatWorkspace.tsx).

---

## Remaining Minor Issues
- `GET /favicon.ico` returns `404` when no `favicon.ico` exists in `public/` (cosmetic only; zero impact on chat functionality).
- Interactive `MediaRecorder` microphone hardware capture was not exercised in headless Chromium (verified `/api/transcribe` via API tests).
