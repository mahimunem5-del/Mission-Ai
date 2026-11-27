# Frontend-Backend Integration Report — Mestrio AI

## Active Frontend -> Backend API Map

| Frontend Caller | Endpoint | Backend Handler | Status |
| --- | --- | --- | --- |
| `ChatWorkspace.tsx`, `ProjectDetailView.tsx` | `POST /api/chat/ui-stream` | `routes/chat.js` -> `chatController.js` | Active & Verified |
| `apiClient.ts` | `GET /api/models`, `GET /api/tools` | `routes/models.js`, `routes/tools.js` | Active & Verified |
| `apiClient.ts` | `GET/POST/DELETE /api/history/conversations*` | `routes/history.js` -> `historyController.js` | Active & Verified (`200`) |
| `apiClient.ts` | `POST /api/files/extract`, `POST /api/transcribe` | `routes/files.js`, `routes/transcribe.js` | Active (behind `requireAuth`) |
| `AuthProfileContext.tsx` | `GET/PUT /api/profile` | `routes/profile.js` -> `profileController.js` | Active & Verified (`200`) |
| `ImagesWorkspaceContainer.tsx` | `POST /api/generate-image`, `/api/images/precise-edit`, `/api/images/remove-background`, `/api/images/upscale` | `routes/image.js` -> `imageController.js` | Active (behind `requireAuth`) |
| `designTemplates.ts` | `GET /api/templates`, `POST/PUT/DELETE /api/admin/templates` | `routes/templates.js` -> `templateService.js` | Active & Verified (`200`) |

## Backend Endpoints Registered But Not Called by Current React UI

- `/api/chat/compare` (`routes/compare.js`): Covered by backend tests (`26/26`), not currently wired as a standalone UI route in `chat-next/`.
- `/api/attachments` (`routes/attachments.js`) and `/api/usage` (`routes/usage.js`): Preserved backend routes; not currently invoked by `chat-next/src/`.
- `/vectorize`, `/create/svg/vectorize`, `/api/images/vectorize`, `/api/images/vector-illustration`: **Removed (`404`)**.
