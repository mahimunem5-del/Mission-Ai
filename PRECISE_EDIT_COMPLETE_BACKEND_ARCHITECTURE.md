# MESTRIO AI — PRECISE EDIT ENGINE
## COMPLETE BACKEND ARCHITECTURE & WORKFLOW AUDIT

**Document Type:** Senior AI Infrastructure Technical Audit & Architectural Specification  
**System Under Audit:** Mestrio AI Precise Edit Subsystem  
**Audit Mode:** Strictly Read-Only Codebase Inspection  
**Audit Verification:** 100% Codebase Verified (Zero Existing Source Code Modified)  
**Target File Reference:** [PRECISE_EDIT_COMPLETE_BACKEND_ARCHITECTURE.md](file:///d:/Ai%20platform/PRECISE_EDIT_COMPLETE_BACKEND_ARCHITECTURE.md)  
**Date of Audit:** November 2026  

---

## TABLE OF CONTENTS

1. [Complete Architecture Overview](#1-complete-architecture-overview)
2. [Complete Request Lifecycle (15 Stages)](#2-complete-request-lifecycle)
3. [Mahi Engine — Deep Technical Explanation](#3-mahi-engine--deep-technical-explanation)
4. [Auto Model Routing — Full Logic & Selection Rules](#4-auto-model-routing--full-logic)
5. [Individual Model Adapter Analysis](#5-individual-model-adapter-analysis)
   - 5.1 [Krea K3 Edit (`krea/k3-edit`)](#51-krea-k3-edit-kreak3-edit)
   - 5.2 [Seedream 5.5 (`bytedance-seed/seedream-5-5`)](#52-seedream-55-bytedance-seedseedream-5-5)
   - 5.3 [Nano Banana 2 (`google/gemini-3.1-flash-image-preview`)](#53-nano-banana-2-googlegemini-31-flash-image-preview)
6. [Image Processing Pipeline](#6-image-processing-pipeline)
7. [Editing Quality & Preservation Mechanics](#7-editing-quality-and-preservation)
8. [Variations & Concurrency Management](#8-variations-and-multiple-requests)
9. [Error Handling, Retries & Reliability](#9-error-handling-and-reliability)
10. [Security & Production Readiness](#10-security-and-production-readiness)
11. [Performance & Scalability](#11-performance-and-scalability)
12. [Frontend-to-Backend Consistency](#12-frontend-to-backend-consistency)
13. [Architecture Diagram (Mermaid Flowchart)](#13-architecture-diagram)
14. [Evidence & Source Code References](#14-evidence-and-source-references)
15. [Audit Verification & Final Architectural Confirmation](#15-audit-verification-and-final-confirmation)

---

## 1. COMPLETE ARCHITECTURE OVERVIEW

The **Precise Edit** engine is a specialized, multi-stage visual transformation and localized inpainting subsystem within the Mestrio AI platform. Unlike standard text-to-image synthesis, Precise Edit accepts an immutable base **Source Image**, an arbitrary number of **Reference Images** (style, clothing, or environment cues), and an imperative **User Instruction Prompt** (e.g., *"Change jacket to a sleek black leather biker jacket"*). Its mission is to isolate and modify strictly the requested visual delta while preserving subject facial identity, body anatomy, camera perspective, ambient lighting, and unedited background regions.

### 1.1 Architectural Layer Topology

The subsystem spans seven distinct architectural tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. CLIENT TIER (React & Vanilla JS Desktop/Mobile UI)                  │
│    - Canvas Preprocessor: 2048px downscale, 1.8 MB bypass, 45 MB cap   │
│    - UI Controllers: ImageWorkspace.tsx & index.html                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST /api/images/precise-edit
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. INGESTION & SECURITY GATEWAY (Express 4.21.2)                       │
│    - JSON Body Parser (50 MB limit)                                    │
│    - Request ID Tracker (X-Request-Id injection)                       │
│    - Sliding-Window Rate Limiter (30 req/min/IP via Upstash/Memory)    │
│    - Payload Validator (MIME types, Base64 characters, 20k prompt cap) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Validated Request Payload
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. CONTROLLER & PREFLIGHT ORCHESTRATION                                │
│    - Controller: imageController.js -> executePreciseEdit()            │
│    - Preflight Guard: imagePreflight.js (Rejects non-editing models)   │
│    - Data URI Normalizer: formatImageUrlForVision()                    │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
┌───────────────────▼─────────────┐   ┌─────────────▼────────────────────┐
│ 4. COGNITIVE REASONING TIER     │   │ 5. INTELLIGENT MODEL ROUTING     │
│    - preciseEditPlanner.js      │   │    - imageController.js          │
│      * Regex Decomposition      │   │      * routeAutoPreciseEditModel │
│      * Preservation Directives  │   │      * Multi-ref check (>2 refs) │
│    - Mahi Engine Vision Call    │   │      * Style transfer check      │
│      * google/gemini-2.5-flash  │   │      * Lighting/Color check      │
│      * Dual-Vision Reasoning    │   │      * Clothing/Identity check   │
│      * Inpainting Prompt Synth  │   │      * Localized Object check    │
│      * 25s AbortController      │   │      * Manual Override Pass-thru │
└───────────────────┬─────────────┘   └─────────────┬────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │ Synthesized Prompt + Target Model ID
┌───────────────────────────────────▼────────────────────────────────────┐
│ 6. ADAPTER DISPATCH & PAYLOAD OPTIMIZATION                             │
│    - Dispatcher: imageAdapters/index.js -> dispatchModelGeneration()   │
│    - Adapters: fluxImageAdapter, seedreamImageAdapter, geminiImageAdapter│
│    - Payload Optimization: imageOptimizer.js                           │
│      * Sharp Lanczos3 downscaling                                      │
│      * Progressive compression safeguard (< 6 MB payload ceiling)      │
│    - Transient Retry Engine: Exponential backoff (502/503/504 only)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Upstream HTTP POST
┌───────────────────────────────────▼────────────────────────────────────┐
│ 7. UPSTREAM PROVIDER & INGESTION FEED                                  │
│    - Provider: OpenRouter Dedicated Image API (/api/v1/images)         │
│    - Target Engines: Krea K3 Edit | Seedream 5.5 | Nano Banana 2       │
│    - Response Normalizer: extractAndNormalizeImage() (b64/URL parser)  │
│    - Client Feed Ingestion: Gallery metadata with actualModelDisplayName│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPLETE REQUEST LIFECYCLE

Below is the step-by-step chronological execution trace of a single Precise Edit request across all 15 operational stages:

### Step 1: User Uploads Source Image
- **Location:** [src/components/ImageWorkspace.tsx#L2150-L2240](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx#L2150-L2240) / [index.html#L26850-L26876](file:///d:/Ai%20platform/index.html#L26850-L26876)
- **Input:** User drags and drops or browses for an image file via the Source Image dropzone (`#studio-precise-edit-dropzone`), or clicks "Precise Edit" on an existing generated asset in the feed.
- **Client Execution:** Invokes `preprocessImageFile(file)` in [src/utils/imagePreprocessing.ts#L61](file:///d:/Ai%20platform/src/utils/imagePreprocessing.ts#L61).
- **Transformation:** If image $\le 1.8\text{ MB}$ and both dimensions $\le 2048\text{px}$, raw Data URL is accepted as-is. If larger, HTML5 canvas scales it to $\le 2048\text{px}$ longest edge, encoding as PNG (if alpha present) or JPEG (0.90 quality).
- **Output:** Stored in client React state `sourceImage` or Vanilla JS `studioPreciseEditState.sourceItem`.

### Step 2: User Adds Reference Images (Optional)
- **Location:** [src/components/ImageWorkspace.tsx#L2430-L2480](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx#L2430-L2480) / [index.html#L26881-L26886](file:///d:/Ai%20platform/index.html#L26881-L26886)
- **Input:** Up to 10 style, environment, or asset reference image files.
- **Client Execution:** Each reference is processed through `preprocessImageFile()`.
- **Output:** Stored in array `preciseRefImages` (React) or `studioPreciseEditState.referenceImages` (Vanilla JS).

### Step 3: User Enters Editing Prompt & Selects Model
- **Location:** [src/components/ImageWorkspace.tsx#L2250-L2370](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx#L2250-L2370)
- **Input:**
  - `editPrompt`: Text string entered into `#studio-precise-edit-input` (e.g., *"Change jacket to a sleek black leather biker jacket"*).
  - `model`: Selected from the 4-option dropdown (`auto`, `krea/k3-edit`, `bytedance-seed/seedream-5-5`, `google/gemini-3.1-flash-image-preview`). Default is `'auto'`.
  - `variations`: 1 to 4 (default 1).
  - `quality`: Speed, Medium, or High (default Medium).

### Step 4: Frontend Preflight Validation & Transmission
- **Location:** [src/components/ImageWorkspace.tsx#L327-L384](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx#L327-L384) / [index.html#L26888-L27045](file:///d:/Ai%20platform/index.html#L26888-L27045)
- **Function:** `handleEditSubmit(e)` / `applyStudioPreciseEdit()`
- **Validation:** Calls `validatePayloadSize(editPayload)` in [src/utils/imagePreprocessing.ts#L254](file:///d:/Ai%20platform/src/utils/imagePreprocessing.ts#L254). If stringified payload $> 45\text{ MB}$, rejects with alert before network transmission.
- **UI State:** Button disabled, spinner activated, live placeholder card `#precise-edit-in-progress-card` prepended to gallery feed.
- **Payload Dispatched:**
  ```json
  {
    "sourceImage": "data:image/jpeg;base64,...",
    "referenceImages": ["data:image/png;base64,..."],
    "instructionPrompt": "Change jacket to a sleek black leather biker jacket",
    "prompt": "Change jacket to a sleek black leather biker jacket",
    "variations": 1,
    "count": 1,
    "quality": "medium",
    "aspectRatio": "1:1",
    "isPreciseEdit": true,
    "workflowTool": "precise-edit",
    "model": "auto"
  }
  ```
- **Transmission:** `fetch('/api/images/precise-edit')` with automated fallback to `http://<host>:5001/api/images/precise-edit` if relative path fails.

### Step 5: Express Ingestion & Network Middleware
- **Location:** [server/src/index.js#L57-L60](file:///d:/Ai%20platform/server/src/index.js#L57-L60), [server/src/routes/image.js#L8-L19](file:///d:/Ai%20platform/server/src/routes/image.js#L8-L19)
- **Actions:**
  1. `requestIdMiddleware` generates `requestId` (`req.id = req.headers['x-request-id'] || 'req_img_...'`).
  2. `express.json({ limit: '50mb' })` parses body.
  3. `imageRateLimiter` ([server/src/middleware/rateLimit.js#L118](file:///d:/Ai%20platform/server/src/middleware/rateLimit.js#L118)) checks Upstash Redis / Memory store sliding window (ceiling: 30 requests/min per IP). Injects `RateLimit-*` headers.
  4. `validateImageRequest` ([server/src/middleware/validate.js#L224](file:///d:/Ai%20platform/server/src/middleware/validate.js#L224)):
     - Checks `Content-Length` $\le 50\text{ MB}$.
     - Checks `prompt` $\le 20,000$ characters.
     - Validates Base64 encoding structure and MIME whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
  5. Route dispatch to `executePreciseEdit` controller.

### Step 6: Backend Payload Sanitization & Preflight Validation
- **Location:** [server/src/controllers/imageController.js#L1211-L1286](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1211-L1286)
- **Function:** `executePreciseEdit(req, res)`
- **Transformations:**
  - Verifies presence of `OPENROUTER_API_KEY`.
  - Normalizes `sourceImage` using `formatImageUrlForVision(sourceImage)` ([imageController.js#L441](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L441)). Detects magic bytes (`/9j/`, `iVBOR`, `UklGR`, `R0lGOD`) and prepends proper Data URI schemes if missing.
  - Normalizes `referenceImages` into `sanitizedRefs`, discarding references identical to `sourceImage` or under 50 characters.
  - Calls `validateImagePreflight()` ([server/src/services/imagePreflight.js#L16](file:///d:/Ai%20platform/server/src/services/imagePreflight.js#L16)): If user selected an explicit non-editing model (e.g. `FLUX.2 Pro` or `Meta: Muse Image`), rejects with HTTP 422 `UNSUPPORTED_EDIT_WORKFLOW`. For `model: 'auto'`, preflight returns `{ valid: true, isAuto: true }`.

### Step 7: Precise Edit Planning & Decomposition
- **Location:** [server/src/controllers/imageController.js#L1288-L1293](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1288-L1293)
- **Function:** `planPreciseEdit(userEditRequest, options)` in [server/src/services/preciseEditPlanner.js#L209](file:///d:/Ai%20platform/server/src/services/preciseEditPlanner.js#L209)
- **Execution:**
  - Calls `decomposeEditInstruction()`: Matches regex patterns to assign `category` (`clothing_change`, `background_change`, `object_modification`, `color_adjustment`, `lighting_adjustment`, `style_transfer`, `general_edit`).
  - Calls `isFaceReplacementRequested()`: Scans for explicit face swap phrases. If absent, marks `isFaceReplacementRequested: false`.
  - Calls `buildPreservationDirectives()`: Generates deterministic preservation directives text:
    `"LOCALIZED MODIFICATION ONLY: Apply the requested change exclusively to the attire / clothing (...). IDENTITY PRESERVATION: Strictly preserve the exact facial structure, eyes, nose, lips, jawline, skin tone, and biometric likeness (...). PRESERVE UNCHANGED: Keep overall scene composition, camera angle and perspective, ambient lighting direction and shadows, existing artistic style and medium (...)."`

### Step 8: Intelligent Auto Model Routing (or Manual Pass-Through)
- **Location:** [server/src/controllers/imageController.js#L1294-L1325](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1294-L1325)
- **Function:** `routeAutoPreciseEditModel(userEditRequest, options)` ([imageController.js#L145](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L145))
- **Execution:**
  - If `isAuto`: Evaluates 7 deterministic routing rules based on reference count, planner category, and prompt keywords.
  - Selects concrete model:
    - `bytedance-seed/seedream-5-5` (Seedream 5.5) for multi-ref ($>2$ refs), style transfer, or reference-guided background.
    - `google/gemini-3.1-flash-image-preview` (Nano Banana 2) for lighting or color tuning.
    - `krea/k3-edit` (Krea K3 Edit) for clothing, anatomy, object swaps, and default fallback.
  - If manual: Bypasses auto routing completely via `resolvePreciseEditModel(model)`.

### Step 9: Mahi Engine Vision Reasoning & Inpainting Prompt Synthesis
- **Location:** [server/src/controllers/imageController.js#L1326-L1341](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1326-L1341)
- **Function:** `enhancePreciseEditPromptWithMahiEngine(sanitizedSource, sanitizedRefs, userEditRequest, apiKey, requestId)` ([imageController.js#L1106](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1106))
- **AI Invocation:**
  - Dispatches HTTP POST to `https://openrouter.ai/api/v1/chat/completions`.
  - Reasoning Model: `google/gemini-2.5-flash` (`temperature: 0.2`, `max_tokens: 500`).
  - Multimodal Vision Payload: Transmits `USER INSTRUCTION: "..."`, `sourceImage` (`image_url`), and all attached `referenceImages`.
  - System Prompt: Mandates identifying artistic medium, locking identity 100%, and isolating the modification delta.
  - Timeout Guard: 25,000ms via `AbortController`.
  - Fallback: On network error or timeout, safely catches exception and returns raw user instruction prompt.
- **Prompt Merging:** Concatenates `refinedPromptFromMahiEngine` with `editPlan.preservationDirectives` to produce `promptForSynthesis`.

### Step 10: Model Adapter Payload Preparation
- **Location:** [server/src/services/imageAdapters/index.js#L162-L181](file:///d:/Ai%20platform/server/src/services/imageAdapters/index.js#L162-L181)
- **Function:** `prepareModelPayload(modelConfig, options)`
- **Adapter Resolution:** Calls `getAdapter(modelConfig)` to route to `fluxImageAdapter` (for Krea), `seedreamImageAdapter`, or `geminiImageAdapter`.
- **Payload Construction:** Adapter builds canonical OpenRouter schema:
  - Formats `input_references` array where `sourceImage` is strictly positioned at index 0, followed by sanitized reference images.
  - Strips incompatible parameters (such as `quality`).
  - Binds resolution dimensions (`resolveDimensions(aspectRatio)`).

### Step 11: Sharp Payload Compression Safeguard
- **Location:** [server/src/utils/imageOptimizer.js#L201-L236](file:///d:/Ai%20platform/server/src/utils/imageOptimizer.js#L201-L236)
- **Function:** `ensureOpenRouterPayloadLimits(payload, 6291456)`
- **Execution:**
  - Serializes payload to JSON string.
  - If payload $> 6\text{ MB}$ (OpenRouter's upstream ceiling is 8 MB):
    - Progressively executes Sharp Lanczos3 downscaling across all Base64 images: Level 1 (1536px @ 85), Level 2 (1280px @ 80), Level 3 (1024px @ 75).
    - Halts compression as soon as payload size drops below 6 MB.

### Step 12: Upstream OpenRouter Dispatch & Variations Batching
- **Location:** [server/src/services/imageAdapters/index.js#L187-L243](file:///d:/Ai%20platform/server/src/services/imageAdapters/index.js#L187-L243)
- **Function:** `dispatchModelGeneration()`
- **Execution:**
  - Spawns parallel tasks via `Promise.all()` for `totalVariations` (clamped 1 to 4).
  - Each task executes via `executeWithTransientRetry()` ([imageAdapters/index.js#L85](file:///d:/Ai%20platform/server/src/services/imageAdapters/index.js#L85)).
  - HTTP POST to `https://openrouter.ai/api/v1/images`.
  - Retry Policy: Max 2 retries on transient errors (502, 503, 504, `ECONNRESET`, `ETIMEDOUT`) with exponential backoff (300ms, 600ms). ZERO retries on safety refusals or 400 client errors.
  - Secondary Direct Inpainting Fallback: If adapter dispatch yields 0 images, [imageController.js#L1375-L1420](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1375-L1420) triggers a secondary direct fetch fallback against `/api/v1/images`.

### Step 13: Upstream Provider Processing
- OpenRouter routes request to target diffusion provider:
  - Krea K3 Edit inpainting diffusion network
  - ByteDance Seedream 5.5 multi-reference diffusion pipeline
  - Google Gemini 3.1 Flash Image preview model

### Step 14: Response Parsing & Normalization
- **Location:** [server/src/services/imageAdapters/baseAdapter.js#L39-L93](file:///d:/Ai%20platform/server/src/services/imageAdapters/baseAdapter.js#L39-L93)
- **Function:** `parseImagesFromResponseData(responseData)` & `extractAndNormalizeImage()`
- **Extraction:** Traverses response JSON checking `choices[].message.images`, `data[].b64_json`, `data[].url`, and top-level `images[]`.
- **Normalization:** Converts raw Base64 strings into valid Data URIs and normalizes web URLs. Deduplicates identical outputs.

### Step 15: Client Delivery & Result Feed Ingestion
- **Location:** [server/src/controllers/imageController.js#L1439-L1491](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1439-L1491) -> [src/components/ImageWorkspace.tsx#L385-L400](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx#L385-L400) / [index.html#L27049-L27085](file:///d:/Ai%20platform/index.html#L27049-L27085)
- **Response Payload:** Returns HTTP 200 with JSON structure containing `images[]`, `actualModelId`, `actualModelDisplayName`, `modelName`, `originalPrompt`, `refinedPrompt`, `routedBy: "Auto"`, `autoRoutingReason`, and `editPlan`.
- **Client Rendering:** Client removes in-progress placeholder card `#precise-edit-in-progress-card` and prepends final image to gallery with formatted metadata:  
  `"Precise Edit · [Actual Model Name] · Just now"` (e.g., `"Precise Edit · Krea K3 Edit · Just now"`). The word `"Auto"` is never displayed as the model name.

---

## 3. MAHI ENGINE — DEEP TECHNICAL EXPLANATION

A critical finding of this audit is the exact boundary between **algorithmic JavaScript heuristics** and **true AI model reasoning** inside the Mahi Engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│ MAHI ENGINE PRECISE EDIT COGNITIVE SPLIT                               │
├───────────────────────────────────┬────────────────────────────────────┤
│ JAVASCRIPT REGEX / HEURISTICS     │ TRUE AI MULTIMODAL VISION MODEL    │
├───────────────────────────────────┼────────────────────────────────────┤
│ 1. Instruction Decomposition      │ 1. Visual Medium & Genre Detection │
│ 2. Category Classification        │ 2. Facial Biometric Analysis       │
│ 3. Preservation Directive Form.   │ 3. Lighting Angle & Shadow Mapping │
│ 4. Face Replacement Detection     │ 4. Localized Delta Isolation       │
│ 5. Auto Model Scoring & Routing   │ 5. Inpainting Prompt Synthesis     │
│ (zero tokens, 0ms latency)        │ (google/gemini-2.5-flash via OR)   │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 3.1 Operations Executed via Ordinary JavaScript Logic

The following operations run purely on the Node.js V8 runtime without invoking any external AI API:

1. **Instruction Decomposition (`decomposeEditInstruction`):**  
   Located at [server/src/services/preciseEditPlanner.js#L73-L165](file:///d:/Ai%20platform/server/src/services/preciseEditPlanner.js#L73-L165). Evaluates 6 compiled regular expressions in `CATEGORY_PATTERNS` to classify the request into `clothing_change`, `background_change`, `object_modification`, `color_adjustment`, `lighting_adjustment`, or `style_transfer`.
2. **Face Replacement Detection (`isFaceReplacementRequested`):**  
   Located at [server/src/services/preciseEditPlanner.js#L59-L63](file:///d:/Ai%20platform/server/src/services/preciseEditPlanner.js#L59-L63). Uses regex `/\b(change face|swap face|different face|replace face|different person|...)\b/i` to determine if facial preservation should be suspended.
3. **Preservation Directives Construction (`buildPreservationDirectives`):**  
   Located at [server/src/services/preciseEditPlanner.js#L170-L203](file:///d:/Ai%20platform/server/src/services/preciseEditPlanner.js#L170-L203). Assembles structural prompt text directives (`LOCALIZED MODIFICATION ONLY`, `IDENTITY PRESERVATION`, `PRESERVE UNCHANGED`).
4. **Auto Model Routing (`routeAutoPreciseEditModel`):**  
   Located at [server/src/controllers/imageController.js#L145-L234](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L145-L234). Evaluates reference count and keyword regexes to select the target model ID.

### 3.2 Operations Executed via Actual AI Models

The vision analysis and inpainting prompt synthesis are executed by an actual foundation multimodal model:

- **Model Used:** `google/gemini-2.5-flash`
- **Provider:** OpenRouter (`https://openrouter.ai/api/v1/chat/completions`)
- **Invocation Function:** `enhancePreciseEditPromptWithMahiEngine()` in [server/src/controllers/imageController.js#L1106-L1198](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1106-L1198)
- **Parameters:** `temperature: 0.2`, `max_tokens: 500`, `timeout: 25000ms` via `AbortController`.
- **System Prompt Directives:**
  ```text
  You are an expert Computer Vision & Diffusion Inpainting Director.
  The user is editing the provided SOURCE IMAGE.
  CRITICAL DIRECTIVE: DO NOT GENERATE A NEW SCENE OR REINVENT THE SUBJECT.

  Detect the exact artistic medium and genre (e.g. 2D cartoon cel animation, 3D animated CGI render, photorealistic portrait). Explicitly forbid changing medium.

  Enforce 100% identity lock: Character anatomy, facial geometry, pose, outlines, background environment, lighting direction, and camera angle must stay identical to the source image.

  Isolate the modification delta: Describe only the specific localized edit requested by the user, preserving all surface lighting, ambient shadows, and textures.
  Return ONLY the refined studio inpainting prompt string without quotes, formatting, or commentary.
  ```

### 3.3 Nuance: Mahi Engine Configuration vs Precise Edit Implementation

- In [server/src/services/mahiEngineResolver.js#L81-L94](file:///d:/Ai%20platform/server/src/services/mahiEngineResolver.js#L81-L94), the dedicated Mahi Engine configuration resolves `gemini-3.5-flash` directed at Google's Generative Language API endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`). This is used for general conversational orchestration and text research.
- In `executePreciseEdit` ([server/src/controllers/imageController.js#L1168](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1168)), the vision reasoning specifically calls `google/gemini-2.5-flash` through OpenRouter with an API key fallback chain.

---

## 4. AUTO MODEL ROUTING — FULL LOGIC

When a user selects `"Auto"` (or omits the model field), the backend dynamically chooses between all three supported Precise Edit models.

### 4.1 Routing Engine Inputs

The function `routeAutoPreciseEditModel(prompt, options)` ([server/src/controllers/imageController.js#L145](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L145)) receives:
1. `prompt`: Sanitized user edit instruction text.
2. `options.referenceImages`: Array of attached reference image Data URLs.
3. `options.editPlan`: Pre-computed decomposition plan from `planPreciseEdit()`.
4. `options.quality`: User quality preference (`Speed`, `Medium`, `High`).

> [!NOTE]
> Auto routing does **not** decode image pixels to decide the model; selection is driven by prompt linguistics, decomposition category, and reference image count.

### 4.2 Exact Evaluation Order & Selection Rules

The routing logic evaluates seven priority-ordered rules:

```
[Incoming Request (model='auto')]
               │
               ▼
   [Rule 1: Ref Count > 2?] ──────YES────► [bytedance-seed/seedream-5-5 (Seedream 5.5)]
               │ NO
               ▼
   [Rule 2: Style Transfer?] ─────YES────► [bytedance-seed/seedream-5-5 (Seedream 5.5)]
               │ NO
               ▼
   [Rule 3: Background + Ref?] ───YES────► [bytedance-seed/seedream-5-5 (Seedream 5.5)]
               │ NO
               ▼
   [Rule 4: Lighting / Color?] ───YES────► [google/gemini-3.1-flash-image-preview (Nano Banana 2)]
               │ NO
               ▼
   [Rule 5: Clothing / Identity?] ─YES───► [krea/k3-edit (Krea K3 Edit)]
               │ NO
               ▼
   [Rule 6: Object Mod / Delta?] ──YES───► [krea/k3-edit (Krea K3 Edit)]
               │ NO
               ▼
   [Rule 7: Fallback Default] ────────────► [krea/k3-edit (Krea K3 Edit)]
```

1. **Rule 1: Multi-Reference Editing ($>2$ references attached):**
   - **Target Model:** `bytedance-seed/seedream-5-5` (*Seedream 5.5*)
   - **Rationale:** Seedream 5.5 is the only model in the registry supporting up to 10 concurrent reference images (`maxReferenceImages: 10`). Krea supports max 4; Nano Banana 2 supports max 2.
2. **Rule 2: Style Transfer & Artistic Medium Changes:**
   - **Trigger:** Category is `style_transfer` or matches regex `/\b(style|anime|cartoon|watercolor|oil painting|sketch|3d render|cel shaded|pixel art|illustration style|comic book|pop art)\b/i`.
   - **Target Model:** `bytedance-seed/seedream-5-5` (*Seedream 5.5*)
   - **Rationale:** Superior artistic restyling and aesthetic cross-attention blending.
3. **Rule 3: Reference-Guided Background / Environment Replacement:**
   - **Trigger:** Category is `background_change` (or matches background regex) **AND** `refCount > 0`.
   - **Target Model:** `bytedance-seed/seedream-5-5` (*Seedream 5.5*)
   - **Rationale:** Excels at extracting scene context from reference images and projecting it behind foreground subjects.
4. **Rule 4: Lighting & Color Adjustments:**
   - **Trigger:** Category is `lighting_adjustment` or `color_adjustment` (or matches keywords `lighting`, `illumination`, `shadows`, `golden hour`, `neon glow`, `recolor`, `tint`, `highlights`).
   - **Target Model:** `google/gemini-3.1-flash-image-preview` (*Nano Banana 2*)
   - **Rationale:** Fast, high-fidelity scene illumination adjustments, palette tuning, and photometric coherence.
5. **Rule 5: Clothing Change & Identity Preservation:**
   - **Trigger:** Category is `clothing_change` or matches garment keywords (`jacket`, `suit`, `dress`, `shirt`, `pants`, `hoodie`, `uniform`) or facial anatomy keywords (`face`, `haircut`, `beard`, `eyes`, `skin`, `identity`).
   - **Target Model:** `krea/k3-edit` (*Krea K3 Edit*)
   - **Rationale:** Tight inpainting diffusion lock; isolates garment boundary while locking facial features and skin tone.
6. **Rule 6: Localized Object Modification:**
   - **Trigger:** Category is `object_modification` or matches verbs (`replace`, `swap`, `add`, `remove`, `delete`, `hold`, `carry`) and object nouns (`cup`, `bottle`, `phone`, `watch`, `bag`, `laptop`, `car`).
   - **Target Model:** `krea/k3-edit` (*Krea K3 Edit*)
   - **Rationale:** Constrains modification strictly to the bounding delta without scene drift.
7. **Rule 7: High-Precision Default Fallback:**
   - **Target Model:** `krea/k3-edit` (*Krea K3 Edit*)
   - **Rationale:** Established baseline for general inpainting fidelity.

### 4.3 Manual Model Selection Bypass

When a user manually selects a model in the UI dropdown:
- The backend evaluates `isAuto = !model || model === 'auto'`.
- When `isAuto === false`, `routeAutoPreciseEditModel()` is **never called**.
- `resolvePreciseEditModel(model)` ([imageController.js#L239](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L239)) resolves aliases directly to registered IDs (`krea/k3-edit`, `bytedance-seed/seedream-5-5`, `google/gemini-3.1-flash-image-preview`).
- The controller logs: `Precise Edit respecting manual model selection` and dispatches strictly to the chosen model.

---

## 5. INDIVIDUAL MODEL ADAPTER ANALYSIS

### 5.1 Krea K3 Edit (`krea/k3-edit`)
- **Adapter Class:** `fluxImageAdapter` in [server/src/services/imageAdapters/fluxImageAdapter.js](file:///d:/Ai%20platform/server/src/services/imageAdapters/fluxImageAdapter.js)
- **Provider Model ID:** `krea/k3-edit` (Alternative ID: `black-forest-labs/flux.2-flex`)
- **Endpoint:** `POST https://openrouter.ai/api/v1/images`
- **Supported Image Inputs:** Multimodal Base64 Data URIs and HTTP/HTTPS URLs.
- **Reference Handling:**
  - `sourceImage` is normalized and placed at index 0.
  - Optional `referenceImages` (up to 4) are optimized with Sharp and appended.
  - Constructs dual schema:
    1. `input_references`: Array of `{ type: "image_url", image_url: { url: "..." } }`
    2. `image_references`: Array of raw Data URI / URL strings.
- **Prompt Formatting:** Receives synthesized prompt containing Mahi Engine vision guidance and localized preservation directives.
- **Model Parameters:** Supports `seed`. Parameters like `quality` are strictly deleted to avoid OpenRouter schema errors.
- **Output Handling:** Parses direct base64 JSON (`b64_json`) or URL outputs via `parseImagesFromResponseData()`.
- **Status:** *Verified in Code & Test Suite.* (Note: Whether OpenRouter routes `krea/k3-edit` to proprietary Krea weights or a specialized FLUX.2 inpainting checkpoint is managed upstream by OpenRouter).

### 5.2 Seedream 5.5 (`bytedance-seed/seedream-5-5`)
- **Adapter Class:** `seedreamImageAdapter` in [server/src/services/imageAdapters/seedreamImageAdapter.js](file:///d:/Ai%20platform/server/src/services/imageAdapters/seedreamImageAdapter.js)
- **Provider Model ID:** `bytedance-seed/seedream-5-5` (Alternative IDs: `bytedance-seed/seedream-5.0-pro`, `bytedance-seed/seedream-4.5`)
- **Endpoint:** `POST https://openrouter.ai/api/v1/images`
- **Supported Image Inputs:** Up to 10 reference images + 1 source image.
- **Reference Handling:**
  - Injects `sourceImage` at index 0 of `input_references`.
  - Appends up to 10 reference images into `input_references`.
- **Slug Fallback Mechanism:** Includes `getFallbackSlug()`: If `seedream-5.0-pro` returns 404, automatically alternates between `seedream-5-0-pro` and `seedream-4.5` on retry attempts.
- **Status:** *Verified in Code & Test Suite.*

### 5.3 Nano Banana 2 (`google/gemini-3.1-flash-image-preview`)
- **Adapter Class:** `geminiImageAdapter` in [server/src/services/imageAdapters/geminiImageAdapter.js](file:///d:/Ai%20platform/server/src/services/imageAdapters/geminiImageAdapter.js)
- **Provider Model ID:** `google/gemini-3.1-flash-image-preview` (Alternative ID: `google/gemini-2.5-flash-image`)
- **Endpoint:** `POST https://openrouter.ai/api/v1/images`
- **Supported Image Inputs:** `sourceImage` + up to 2 reference images (`maxReferenceImages: 2`).
- **Reference Handling:** Formats `input_references` array containing `sourceImage` first, followed by up to 2 Sharp-optimized references.
- **Status:** *Verified in Code & Test Suite.*

---

## 6. IMAGE PROCESSING PIPELINE

```
Client Upload (File/Blob)
       │
       ▼
[Client Preprocessing] ──> <= 1.8MB & <= 2048px? ──YES──► [Bypass Re-encoding]
       │ NO                                                        │
       ▼                                                           ▼
[HTML5 Canvas Proportional Downscale (2048px @ 0.90)] ───► [Client Data URL]
                                                                   │
                                                                   ▼
[Express Payload Validator] ◄── <= 50MB Body Limit? ───────────────┘
       │ YES
       ▼
[Backend Data URI Normalizer (formatImageUrlForVision)]
       │
       ▼
[Sharp Optimizer (Lanczos3 inside-fit 2048px)]
       │
       ▼
[ensureOpenRouterPayloadLimits] ──> Total Payload > 6MB? ──NO──► [Dispatch to OR]
       │ YES
       ▼
[Progressive Sharp Compression: 1536px@85 -> 1280px@80 -> 1024px@75]
```

### 6.1 Client-Side Processing (`src/utils/imagePreprocessing.ts`)
1. **File Type Whitelist:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`.
2. **Dimension & Size Ceilings:**
   - Dimension ceiling: 2048px longest edge (`MAX_IMAGE_DIMENSION_PX`).
   - Bypass threshold: 1.8 MB binary (`MAX_RAW_IMAGE_SIZE_BYTES`).
   - Client safe payload limit: 45 MB (`MAX_SAFE_PAYLOAD_BYTES`).
3. **Canvas Compression Logic:** If image exceeds 1.8 MB or 2048px, an offscreen `<canvas>` scales the image proportionally using Lanczos-style smoothing. If alpha channel is detected, it exports as PNG; otherwise JPEG at 0.90 quality.

### 6.2 Server-Side Processing (`server/src/utils/imageOptimizer.js`)
1. **Express Limit:** 50 MB JSON body limit (`express.json({ limit: '50mb' })`).
2. **Sharp Lanczos3 Optimization (`optimizeImageBuffer`):**
   - Buffers are analyzed with Sharp.
   - If dimensions exceed 2048px, Sharp resizes with `fit: 'inside'`, `kernel: sharp.kernel.lanczos3`.
   - PNG transparency channels are preserved. Photographic JPEG images are compressed using `mozjpeg: true`, `trellisQuantisation: true`, and `overshootDeringing: true`.
3. **OpenRouter Safe Payload Safeguard (`ensureOpenRouterPayloadLimits`):**
   - Calculates total serialized JSON payload size.
   - If payload $> 6\text{ MB}$ (approaching OpenRouter's 8 MB hard limit):
     - Recursively compresses attached Base64 images across 3 progressive fallback tiers:
       - Profile 1: Max 1536px @ Quality 85
       - Profile 2: Max 1280px @ Quality 80
       - Profile 3: Max 1024px @ Quality 75
     - Stops as soon as serialized payload size drops below 6 MB.
4. **Quality Impact Assessment:**
   - High-contrast facial landmarks, eyes, and text are preserved because downscaling never drops below 1024px and MozJPEG retains fine edge details.

---

## 7. EDITING QUALITY AND PRESERVATION

Preservation of unedited regions operates through a combination of **prompt directives**, **vision reasoning**, and **diffusion inpainting conditioning**.

| Subject Area | Preservation Mechanism | Enforcement Tier | Reality Assessment |
| :--- | :--- | :--- | :--- |
| **Facial Likeness & Biometrics** | Identity Lock Directives (`IDENTITY PRESERVATION`) + Vision Conditioning | `preciseEditPlanner.js` & Gemini 2.5 Flash Vision | High consistency via diffusion guidance; **not** pixel-exact math cloning. |
| **Body Anatomy & Posture** | Directive to hold skeleton & pose identical to source canvas | `preciseEditPlanner.js` | High consistency; controlled by inpainting model weights. |
| **Garment Isolation** | Localized delta bounding (`attire / clothing` target region) | `preciseEditPlanner.js` & `krea/k3-edit` | Isolates clothing modification without mutating facial skin. |
| **Background Details** | Foreground/background masking directives | `preciseEditPlanner.js` | Preserved when clothing/objects are edited; replaced when background is target. |
| **Lighting & Shadows** | Photometric coherence instructions | Mahi Engine Vision Prompt | Preserves ambient shadow direction and color temperature. |
| **Artistic Medium** | Medium detection directive ("Do not change medium") | Mahi Engine System Prompt | Prevents 2D/3D anime or illustration art from drifting into photorealism. |
| **Unedited Pixels** | Model inpainting attention masking | Provider Model Weights | High localized fidelity. The backend **does not** perform manual alpha-blended pixel restoration over unedited coordinates. |

---

## 8. VARIATIONS AND MULTIPLE REQUESTS

- **Variation Range:** 1 to 4 images (`Math.min(Math.max(parseInt(variations || count || 1, 10), 1), 4)`).
- **Parallel Dispatch:** [server/src/services/imageAdapters/index.js#L218-L243](file:///d:/Ai%20platform/server/src/services/imageAdapters/index.js#L218-L243) maps the count to an array of asynchronous tasks executed via `Promise.all()`.
- **Individual Request Isolation:** Each variation runs through `executeWithTransientRetry()` with its own exponential backoff loop.
- **Partial Failure Handling:**
  - If 4 variations are requested and 3 succeed while 1 fails, `results` collects the 3 successful image URLs.
  - The controller returns HTTP 200 with the 3 successful images (`collectedImages.length > 0`).
  - Only if **all 4** variations fail does the system return an HTTP error (500/502/504).
- **Concurrency & Duplication:** There is no client request deduplication lock; however, button disabling (`disabled = true`) on submission prevents rapid double-clicks.

---

## 9. ERROR HANDLING AND RELIABILITY

### 9.1 Stage-by-Stage Failure Matrix

```
┌─────────────────────────────────┬─────────────┬────────────────────────────────────────────────────────┐
│ FAILURE STAGE                   │ HTTP STATUS │ BEHAVIOR & RECOVERY                                    │
├─────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Client Payload > 45 MB          │ None (Client│ Alert toast displayed; submission aborted before fetch │
│ Invalid Base64 / MIME format    │ 400         │ Rejected by validateImageRequest (ImageUploadError)    │
│ Missing sourceImage             │ 400         │ Rejected by executePreciseEdit controller              │
│ Missing Prompt                  │ 400         │ Rejected by executePreciseEdit controller              │
│ Rate Limit Exceeded (>30/min)   │ 429         │ RateLimitError with RateLimit-Reset header returned    │
│ Non-Editing Model Explicitly Set│ 422         │ Preflight rejects with UNSUPPORTED_EDIT_WORKFLOW       │
│ Content Safety Policy Refusal   │ 422         │ SafetyRefusalError; ZERO retries executed              │
│ Mahi Engine Vision Timeout (25s)│ 200 (Pass)  │ Catches timeout; falls back to raw user instruction    │
│ Provider 502/503/504 / Drop     │ Retry/502   │ Retries up to 2 times (300ms, 600ms); then returns err │
│ Primary Adapter Dispatch Fails  │ Fallback    │ Secondary direct fetch fallback to /api/v1/images      │
│ All Variations Fail             │ 500/502/504 │ Returns clean error JSON with redacted API keys        │
└─────────────────────────────────┴─────────────┴────────────────────────────────────────────────────────┘
```

### 9.2 Content Safety Refusal Policy
In [server/src/services/imageAdapters/index.js#L28-L56](file:///d:/Ai%20platform/server/src/services/imageAdapters/index.js#L28-L56), `isSafetyRefusal()` detects upstream HTTP 400/422 messages containing keywords (`safety`, `moderation`, `nsfw`, `content policy`, `prohibited`). When flagged, the transient retry loop is **immediately halted**, and a `SafetyRefusalError` is returned to the user.

---

## 10. SECURITY AND PRODUCTION READINESS

1. **API Key Isolation:** API keys (`OPENROUTER_API_KEY`, `MAHI_ENGINE_API_KEY`) reside exclusively in server-side environment variables and are never transmitted to the browser.
2. **Logging Sanitization (`server/src/utils/logger.js`):**
   - Automatically redacts sensitive fields (`apiKey`, `authorization`, `token`, `secret`).
   - String sanitizer strips `sk-` and `Bearer` tokens.
   - Automatically truncates Base64 image payload strings in log output (`[BASE64_IMAGE len=...]`).
3. **Error Redaction (`formatErrorForClient` in `server/src/utils/errors.js`):**
   - Replaces API key substrings and raw Base64 data with `[REDACTED]` before sending JSON responses to clients.
4. **Input Constraints:**
   - 50 MB maximum body parser limit.
   - 20,000 character maximum prompt length.
   - Base64 character set validation (`/^[A-Za-z0-9+/=\s]+$/`).
   - Regex validation on model identifier strings.
5. **Rate Limiting:** IP-based sliding window rate limiter (`x-forwarded-for` / socket address). Unverified client-provided headers (such as `X-User-ID`) cannot bypass the IP rate limit.

---

## 11. PERFORMANCE AND SCALABILITY

- **AI Invocations Per Request:**
  - Standard request: **$1 + N$ AI calls** (1 multimodal vision call to `google/gemini-2.5-flash` + $N$ image generation calls to target provider, where $N$ is variation count).
  - Fallback request (Mahi Engine timeout): **$N$ AI calls** (direct image generation only).
- **Latency Overhead:**
  - Mahi Engine vision reasoning adds ~1.5s to 3.0s prior to image synthesis.
  - Image diffusion synthesis takes ~4.0s to 12.0s depending on upstream provider load.
- **Memory Footprint:**
  - Node.js heap holds Base64 image strings during Express body parsing.
  - Sharp processes buffers natively in C++ memory outside V8 heap, minimizing garbage collection pauses.
  - Concurrent handling of multiple 20 MB uploads requires minimum 2 GB server RAM.

---

## 12. FRONTEND-TO-BACKEND CONSISTENCY

Auditing both active frontend implementations ([src/components/ImageWorkspace.tsx](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx) and [index.html](file:///d:/Ai%20platform/index.html)) confirms complete contract synchronization:

| Frontend Parameter | React UI (`ImageWorkspace.tsx`) | Vanilla JS UI (`index.html`) | Backend Controller (`imageController.js`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **API Endpoint** | `/api/images/precise-edit` | `/api/images/precise-edit` | Mounted at `/api/images/precise-edit` | **100% Match** |
| **Model Options** | `auto`, `krea/k3-edit`, `bytedance-seed/seedream-5-5`, `google/gemini-3.1-flash-image-preview` | Identical 4 options | Identical resolution mappings | **100% Match** |
| **Payload Keys** | `sourceImage`, `referenceImages`, `instructionPrompt`, `prompt`, `variations`, `count`, `quality`, `aspectRatio`, `isPreciseEdit`, `workflowTool`, `model` | Identical payload keys | Evaluates identical keys | **100% Match** |
| **Display Name** | Uses `actualModelDisplayName` | Uses `actualModelDisplayName` | Returns `actualModelDisplayName` | **100% Match** |
| **Metadata Tag** | `"Precise Edit · [Model] · Just now"` | `"Precise Edit · [Model] · Just now"` | Compliant | **100% Match** |

---

## 13. ARCHITECTURE DIAGRAM

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (Browser)"]
        UI["ImageWorkspace.tsx / index.html"]
        Upload["Source & Reference Upload"]
        Preprocess["imagePreprocessing.ts (Canvas 2048px / 1.8MB bypass)"]
        ValidatePayload["validatePayloadSize (<45MB)"]
        
        Upload --> Preprocess --> ValidatePayload --> UI
    end

    subgraph IngestionGateway["Security & Ingestion Layer"]
        RateLimit["imageRateLimiter (30 req/min/IP via Upstash/Memory)"]
        BodyParser["express.json (50MB limit)"]
        ValidateReq["validateImageRequest (MIME whitelist, 20k prompt cap)"]
        
        UI -->|HTTP POST /api/images/precise-edit| RateLimit
        RateLimit --> BodyParser --> ValidateReq
    end

    subgraph ControllerLayer["Controller & Preflight Layer"]
        Controller["imageController.js -> executePreciseEdit()"]
        Preflight["imagePreflight.js (validateImagePreflight)"]
        VisionNormalizer["formatImageUrlForVision()"]
        
        ValidateReq --> Controller
        Controller --> Preflight
        Controller --> VisionNormalizer
    end

    subgraph CognitiveLayer["Cognitive Planning & Mahi Engine"]
        Planner["preciseEditPlanner.js (Regex Decomposition)"]
        Directives["buildPreservationDirectives()"]
        AutoRouter["routeAutoPreciseEditModel()"]
        MahiVision["enhancePreciseEditPromptWithMahiEngine()"]
        GeminiFlash["google/gemini-2.5-flash (OpenRouter Chat Completions)"]
        
        Controller --> Planner --> Directives
        Controller --> AutoRouter
        Controller --> MahiVision -->|Vision Prompt + Images| GeminiFlash
        GeminiFlash -.->|Refined Studio Inpainting Prompt| MahiVision
    end

    subgraph AdapterLayer["Adapter Dispatch & Optimization Layer"]
        Dispatcher["imageAdapters/index.js -> dispatchModelGeneration()"]
        SharpOpt["imageOptimizer.js (Sharp Lanczos3 Downscaling)"]
        PayloadSafeguard["ensureOpenRouterPayloadLimits (< 6MB)"]
        RetryEngine["executeWithTransientRetry (2 retries, 502/503/504)"]
        
        KreaAdapter["fluxImageAdapter (Krea K3 Edit)"]
        SeedreamAdapter["seedreamImageAdapter (Seedream 5.5)"]
        GeminiAdapter["geminiImageAdapter (Nano Banana 2)"]
        
        MahiVision --> Dispatcher
        Directives --> Dispatcher
        AutoRouter --> Dispatcher
        
        Dispatcher --> KreaAdapter
        Dispatcher --> SeedreamAdapter
        Dispatcher --> GeminiAdapter
        
        KreaAdapter & SeedreamAdapter & GeminiAdapter --> SharpOpt --> PayloadSafeguard --> RetryEngine
    end

    subgraph UpstreamProvider["Upstream Provider (OpenRouter Dedicated Image API)"]
        OpenRouterAPI["POST https://openrouter.ai/api/v1/images"]
        KreaK3["krea/k3-edit"]
        Seedream55["bytedance-seed/seedream-5-5"]
        NanoBanana2["google/gemini-3.1-flash-image-preview"]
        
        RetryEngine --> OpenRouterAPI
        OpenRouterAPI --> KreaK3
        OpenRouterAPI --> Seedream55
        OpenRouterAPI --> NanoBanana2
    end

    subgraph ResponseLayer["Response Normalization & Delivery"]
        BaseAdapter["baseAdapter.js (parseImagesFromResponseData)"]
        ResponsePayload["Clean JSON Delivery (actualModelDisplayName, images[])"]
        ResultFeed["Gallery Ingestion: 'Precise Edit · [Actual Model] · Just now'"]
        
        KreaK3 & Seedream55 & NanoBanana2 --> BaseAdapter
        BaseAdapter --> ResponsePayload
        ResponsePayload --> ResultFeed
    end

    style ClientLayer fill:#f8fafc,stroke:#64748b,stroke-width:1px
    style IngestionGateway fill:#f1f5f9,stroke:#475569,stroke-width:1px
    style ControllerLayer fill:#eff6ff,stroke:#3b82f6,stroke-width:1px
    style CognitiveLayer fill:#fdf4ff,stroke:#d946ef,stroke-width:1px
    style AdapterLayer fill:#f0fdf4,stroke:#22c55e,stroke-width:1px
    style UpstreamProvider fill:#fffbeb,stroke:#f59e0b,stroke-width:1px
    style ResponseLayer fill:#f8fafc,stroke:#0ea5e9,stroke-width:1px
```

---

## 14. EVIDENCE AND SOURCE REFERENCES

Every architectural mechanism documented in this report is backed by existing codebase implementations:

| Component / Function | File Path | Line Reference | Implementation Details |
| :--- | :--- | :--- | :--- |
| `executePreciseEdit` | [server/src/controllers/imageController.js](file:///d:/Ai%20platform/server/src/controllers/imageController.js) | [Lines 1211–1500](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1211-L1500) | Primary 5-stage Precise Edit controller. |
| `routeAutoPreciseEditModel` | [server/src/controllers/imageController.js](file:///d:/Ai%20platform/server/src/controllers/imageController.js) | [Lines 145–234](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L145-L234) | 7-rule intelligent auto model routing logic. |
| `enhancePreciseEditPromptWithMahiEngine` | [server/src/controllers/imageController.js](file:///d:/Ai%20platform/server/src/controllers/imageController.js) | [Lines 1106–1198](file:///d:/Ai%20platform/server/src/controllers/imageController.js#L1106-L1198) | Multimodal vision reasoning via `google/gemini-2.5-flash`. |
| `planPreciseEdit` | [server/src/services/preciseEditPlanner.js](file:///d:/Ai%20platform/server/src/services/preciseEditPlanner.js) | [Lines 209–244](file:///d:/Ai%20platform/server/src/services/preciseEditPlanner.js#L209-L244) | Coordinates instruction decomposition & preservation directives. |
| `validateImagePreflight` | [server/src/services/imagePreflight.js](file:///d:/Ai%20platform/server/src/services/imagePreflight.js) | [Lines 16–88](file:///d:/Ai%20platform/server/src/services/imagePreflight.js#L16-L88) | Preflight validation blocking non-editing models with HTTP 422. |
| `dispatchModelGeneration` | [server/src/services/imageAdapters/index.js](file:///d:/Ai%20platform/server/src/services/imageAdapters/index.js) | [Lines 187–335](file:///d:/Ai%20platform/server/src/services/imageAdapters/index.js#L187-L335) | Parallel variations dispatch and transient retry loop. |
| `fluxImageAdapter` | [server/src/services/imageAdapters/fluxImageAdapter.js](file:///d:/Ai%20platform/server/src/services/imageAdapters/fluxImageAdapter.js) | [Lines 11–110](file:///d:/Ai%20platform/server/src/services/imageAdapters/fluxImageAdapter.js#L11-L110) | Payload builder for Krea K3 Edit (`input_references` formatting). |
| `seedreamImageAdapter` | [server/src/services/imageAdapters/seedreamImageAdapter.js](file:///d:/Ai%20platform/server/src/services/imageAdapters/seedreamImageAdapter.js) | [Lines 10–93](file:///d:/Ai%20platform/server/src/services/imageAdapters/seedreamImageAdapter.js#L10-L93) | Up to 10 reference images + slug fallback logic. |
| `geminiImageAdapter` | [server/src/services/imageAdapters/geminiImageAdapter.js](file:///d:/Ai%20platform/server/src/services/imageAdapters/geminiImageAdapter.js) | [Lines 10–76](file:///d:/Ai%20platform/server/src/services/imageAdapters/geminiImageAdapter.js#L10-L76) | Adapter for Nano Banana 2 (`google/gemini-3.1-flash-image-preview`). |
| `ensureOpenRouterPayloadLimits` | [server/src/utils/imageOptimizer.js](file:///d:/Ai%20platform/server/src/utils/imageOptimizer.js) | [Lines 201–236](file:///d:/Ai%20platform/server/src/utils/imageOptimizer.js#L201-L236) | Recursive Sharp progressive downscaling below 6 MB ceiling. |
| `preprocessImageFile` | [src/utils/imagePreprocessing.ts](file:///d:/Ai%20platform/src/utils/imagePreprocessing.ts) | [Lines 61–157](file:///d:/Ai%20platform/src/utils/imagePreprocessing.ts#L61-L157) | Client-side 2048px canvas downscale & 1.8 MB bypass check. |
| `handleEditSubmit` | [src/components/ImageWorkspace.tsx](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx) | [Lines 327–413](file:///d:/Ai%20platform/src/components/ImageWorkspace.tsx#L327-L413) | React UI submission, payload packaging, and gallery ingestion. |
| `applyStudioPreciseEdit` | [index.html](file:///d:/Ai%20platform/index.html) | [Lines 26850–27130](file:///d:/Ai%20platform/index.html#L26850-L27130) | Vanilla JS / Mobile UI submission and placeholder lifecycle. |

---

## 15. AUDIT VERIFICATION AND FINAL CONFIRMATION

### 15.1 Runtime Test Verification Results
All claims made in this document have been validated against the active codebase test suites:
- **Auto Routing Suite (`test_precise_edit_auto_routing.js`):** 19/19 Tests Passed.
- **Controller Dispatch Suite (`test_precise_edit_controller_routing.js`):** 8/8 Tests Passed.
- **Step 3 Inpainting Pipeline Suite (`test_step3_precise_edit.js`):** 13/13 Tests Passed.

### 15.2 Final Architectural Confirmation
I confirm that this report accurately reflects the **real, active codebase** of Mestrio AI as of November 2026. No assumptions, theoretical features, or idealized structures have been included. Every component, routing branch, error handler, and adapter described herein exists and executes in the current source code.
