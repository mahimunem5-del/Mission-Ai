# Pre-Phase 14 — Protected File Integrity Report

**Audit Date:** 2026-11-27  
**Governance Source:** [`WORKSPACE_LOCK.md`](file:///d:/Ai%20platform/WORKSPACE_LOCK.md) & Phase A Baseline ([`IMAGE_WORKSPACE_HASH_COMPARISON.md`](file:///d:/Ai%20platform/docs/final-source-audit/IMAGE_WORKSPACE_HASH_COMPARISON.md))

---

## 1. Governance Status (`WORKSPACE_LOCK.md`)

- `window.MESTRIO_WORKSPACES.images` was officially marked `locked: false, hideInSidebar: false` on `2026-11-27` for Unified React Migration into `chat-next/`.
- Backend AI/image controllers and services remain protected, and the 13-file Image Workspace SHA-256 baseline recorded after migration/purification is verified below without any modification.

---

## 2. Protected Image Workspace Baseline Verification (13 / 13 Files)

- **Expected Baseline File Count:** `13`
- **Actual Present File Count:** `13`
- **Matching SHA-256 Hashes:** `13 / 13` (`100%`)
- **Mismatched or Missing Files:** `0`

| File | Current SHA-256 | Baseline Match |
| :--- | :--- | :--- |
| `chat-next/src/components/images/ImageHomeView.tsx` | `B1F0A16CCBDD2B0D5353EE071D5DD620F15215A855D087AEDF5EAD5D6366F6B8` | EXACT MATCH |
| `chat-next/src/components/images/ImageLightboxModal.tsx` | `58A729CE982216F334ED4F5B2E1E8F7C685D2E1EEEF1E4307C666C2BC58989A1` | EXACT MATCH |
| `chat-next/src/components/images/imageStudioConstants.tsx` | `B9B2172AE3DEFAB925116D0D7B446E8AF0E9C994AE5355DBA6C99FC208FE0587` | EXACT MATCH |
| `chat-next/src/components/images/ImageStudioEditor.tsx` | `B4FEA0CCF24D3FBE1FF66C9DD8E20E96621CADE8F7C539AD77A55466118F7E32` | EXACT MATCH |
| `chat-next/src/components/images/ImagesWorkspaceContainer.tsx` | `3101FD307E15134E7DE34C6731ED0C7633B61BD66FB73469B650DFB4D8406A0E` | EXACT MATCH |
| `chat-next/src/components/images/ImageWorkspace.tsx` | `F5F8EADDF5B0957EC0B6FF1EFCFC08A41508C44FE7903F93928505B4A31B946C` | EXACT MATCH |
| `chat-next/src/components/images/TemplatePreviewModal.tsx` | `BB501322B2C067C6164C91711F95E013DDE9C9466164DAC9AC210FE20616BF23` | EXACT MATCH |
| `chat-next/src/styles/images.css` | `8F2D33DD9AD5392C4B8B56ACEA960E83110DCB3976C7ADE01C8CD46640E15D94` | EXACT MATCH |
| `chat-next/src/data/designTemplates.ts` | `ADDEB61164724E9C76741E11E12FE214D313B38BB128BFCA78C25BB998542270` | EXACT MATCH |
| `server/src/routes/image.js` | `7CDB0C0E6B17FB6AEAB62C2337B50598BBAB4DC98B18442531D6495D488DA1D3` | EXACT MATCH |
| `server/src/controllers/imageController.js` | `954A0DC0A46A41134AA08E55A27F48FE831B0AA1933D5AE582F729739E830054` | EXACT MATCH |
| `src/components/ImageWorkspace.tsx` | `A3DA07D63CBE120C8A0B44EBEE223421BFFFC1A9ECA34E4C45815E5FC9AF5C7F` | EXACT MATCH |
| `src/utils/imagePreprocessing.ts` | `006E26B3A2118B3845830BCB74FD6FED993A832F4D69BD68E62E7C0E744F26AF` | EXACT MATCH |

---

## 3. Additional `WORKSPACE_LOCK.md` Backend Services Check

All 17 additional backend image/template services, adapters, and legacy root references listed in `WORKSPACE_LOCK.md` Section 3A are present on disk with valid SHA-256 hashes (`templates.js`, `templateController.js`, `imageModelRegistry.js`, `preciseEditPlanner.js`, `referenceIntelligence.js`, `imagePreflight.js`, `templateService.js`, `promptIntelligence.js`, `imageOptimizer.js`, `imageAdapters/*.js`, and `src/components/VectorStudioCanvas.tsx`).
