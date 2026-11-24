# MESTRIO AI — TECHNICAL ARCHITECTURE AUDIT REPORT
# FACE IDENTITY & BODY CONSISTENCY IN THE GENERATE IMAGE PIPELINE

**Audit Mode:** Strictly Read-Only Forensic Architecture Investigation  
**Target Subsystem:** Image Generation Pipeline (`POST /api/generate-image` & `POST /api/images/generate`)  
**Scope:** Face Identity Preservation, Body Proportions, Anatomical Alignment, Prompt Intelligence, Model Adapters, and Auto Routing  
**Code Changes Made:** 0 (Zero existing files modified; strictly read-only)

---

## EXECUTIVE SUMMARY

This investigation examines the root architectural and algorithmic causes of quality inconsistencies in the Mestrio AI **Generate Image** workflow, specifically:
> **The Problem:** When a user uploads a single personal portrait as a reference image and writes a text prompt describing a desired scene, outfit, pose, body composition, and environment (with no separate template image), the generated face and AI-generated body sometimes fail to look naturally integrated (e.g. "pasted on" head appearance, mismatched lighting, conflicting skin tones, awkward neck angles, or head-to-body proportion anomalies).

### Key Audit Findings

1. **Zero Facial Biometric / Geometric Extraction:**  
   The backend does **not** extract facial landmarks, facial embeddings (e.g. ArcFace, InsightFace, FaceNet), 3D head pose angles (pitch, yaw, roll), or skin tone color vectors. Reference analysis is purely a high-level semantic role classifier (`classifyReferenceRoleByPrompt` or `classifyReferenceImageWithVision` via `gemini-2.5-flash-lite`) returning an enum string (`"face_character"`). The original image file is passed in its entirety to the model.

2. **100% Delegation of Anatomical Consistency to the Image Model:**  
   The platform performs **no backend calculations, geometric anchoring, or post-generation blending** for:
   - Head-to-body proportions
   - Face and neck alignment
   - Skin-tone harmonization
   - Lighting and shadow continuity
   - Camera lens perspective (focal length matching)
   - Head-to-body pose compatibility  
   All of these critical physical parameters are left 100% to the diffusion model's latent cross-attention layers.

3. **Prompt Dilution & Semantic Competition:**  
   The prompt intelligence engine (`refinePrompt` in `promptIntelligence.js`) sends the user prompt along with identity guidance (`CRITICAL IDENTITY PRESERVATION...`) to an LLM (`google/gemini-2.5-flash`). The LLM synthesizes a verbose, 150–250 word visual description heavily emphasizing scene, garments, lighting, atmosphere, and environmental textures. In diffusion attention mechanisms, this verbose scene expansion competes directly with and diffuses the identity tokens. Furthermore, the prompt never instructs the model that the reference is a tight portrait that must be disentangled from the full-body pose.

4. **Hardcoded Auto-Routing Override:**  
   When Auto is selected with reference images attached, `resolveAutoModelForReferences` unconditionally and blindly routes **100% of requests to `google/gemini-3-pro-image` (Nano Banana Pro)**. It completely ignores whether the prompt requests a full-body fashion shot, photorealistic DSLR portrait, anime, or 3D render.

5. **Fundamental OpenRouter API & Latent Space Limitations:**  
   OpenRouter's `/api/v1/images` endpoint is a black-box REST API that accepts an `input_references` array without reference weighting, bounding boxes, or regional conditioning. In full-body generations at $1024 \times 1024$, the face occupies merely $100 \times 100$ pixels ($\sim 12 \times 12$ latent patches in an $8\times$ latent diffusion model). Without a second-stage face inpainting/restoration pass, severe identity degradation and boundary artifacts are mathematically inevitable.

---

## 1. END-TO-END EXECUTION FLOW

```
[User Browser]
  │
  ├─ 1. User uploads 1 personal portrait (File)
  │     └─ Preprocessed via Canvas in `imagePreprocessing.ts` (or `index.html`)
  │        (downscales >2048px to 0.90 JPEG; bypasses if <=1.8MB & <=2048px)
  │
  ├─ 2. User enters text prompt: Scene, outfit, pose, full-body composition
  │
  ├─ 3. User selects Model ("Auto" or specific model)
  │
  └─ 4. Submits payload to POST /api/generate-image
        Payload: { prompt, model, aspectRatio, count, referenceImages: [dataUrl] }
        │
[Express Server: server/src/routes/image.js]
  │
  ├─ 5. Middleware: `imageRateLimiter` (30 req/min) & `validateImageRequest` (<=50MB)
  │
[Controller: server/src/controllers/imageController.js - generateImage()]
  │
  ├─ 6. Normalization: `formatImageUrlForVision(referenceImages[0])`
  │
  ├─ 7. Preflight Check: `validateImagePreflight()` in `imagePreflight.js`
  │     (Guarantees chosen model supports reference images; Auto always passes)
  │
  ├─ 8. Model Routing:
  │     IF model is 'auto' AND referenceImages.length > 0:
  │       Calls `resolveAutoModelForReferences(prompt, referenceImages)`
  │       --> FORCED ROUTE: ALWAYS `google/gemini-3-pro-image`
  │     ELSE IF specific model selected:
  │       `resolveOpenRouterImageModel(model)`
  │
  ├─ 9. Reference Intelligence: `buildReferenceConditioning()` in `referenceIntelligence.js`
  │     Calls `classifyReferenceImageWithVision()` (gemini-2.5-flash-lite via OpenRouter)
  │     --> Returns role: "face_character", anchoringInstruction text
  │
  ├─ 10. Prompt Intelligence: `refinePrompt()` in `promptIntelligence.js`
  │      Sends rawPrompt + anchoringInstruction to `google/gemini-2.5-flash`
  │      --> Returns enhancedPrompt (blended, expanded visual description)
  │
  ├─ 11. Model Adapter Dispatch: `dispatchModelGeneration()` in `imageAdapters/index.js`
  │      Retrieves adapter (`geminiImageAdapter.js`, `openaiImageAdapter.js`, etc.)
  │      `preparePayload()`:
  │        - Optimizes reference image via Sharp mozjpeg (`optimizeBase64DataUrl`)
  │        - Enforces < 6 MB OpenRouter payload limit (`ensureOpenRouterPayloadLimits`)
  │        - Maps to `{ model, prompt, aspect_ratio, width, height, input_references: [...] }`
  │
  ├─ 12. Upstream Network Call:
  │      Axios POST https://openrouter.ai/api/v1/images (timeout 60s, transient retries)
  │
  ├─ 13. Response Parsing: `parseImagesFromResponseData()` in `baseAdapter.js`
  │
  └─ 14. Response to Client:
         JSON { success: true, images: [{ id, url, prompt, originalPrompt, enhancedPrompt, model... }] }
```

---

## 2. INVESTIGATION AREA 1: IDENTITY REFERENCE PROCESSING

### 1.1 How is the uploaded portrait analyzed?
In `server/src/controllers/imageController.js` (lines 578–585):
```javascript
let referenceConditioning = null;
if (effectiveReferenceImages.length > 0) {
  referenceConditioning = await buildReferenceConditioning(effectiveReferenceImages, rawPrompt, {
    apiKey,
    requestId,
    useVision: true
  });
}
```

In `server/src/services/referenceIntelligence.js` (lines 325–334):
```javascript
const firstRef = refs[0];
let roleClassification;

if (options.useVision && typeof firstRef === 'string' && firstRef.startsWith('data:image/')) {
  roleClassification = await classifyReferenceImageWithVision(firstRef, prompt, options);
} else {
  roleClassification = classifyReferenceRoleByPrompt(prompt);
}
```

In `classifyReferenceImageWithVision` (lines 200–248):
The system makes a low-cost, 5-second call to `google/gemini-2.5-flash-lite` via OpenRouter Chat Completions:
```text
System: "You are a high-speed computer vision classifier. Analyze the attached reference image and user prompt. Classify the primary role of this reference image into exactly one category:
- face_character: if the image contains a person or character face that should maintain identity
- product_object: ...
- style: ...
- composition: ...
- clothing_material: ...
- environment: ...
Return ONLY a valid JSON object matching this schema:
{"role":"face_character"|"product_object"|..., "confidence":0.95}"
```

### 1.2 Is facial identity actually extracted or only the original image passed to the model?
* **Facial identity is NOT extracted by the backend.**
* There is no facial embedding generation (no InsightFace, ArcFace, or FaceNet vector).
* There is no landmark localization (eyes, nose, mouth coordinates).
* There is no 3D mesh reconstruction, head orientation calculation, or skin reflectance profiling.
* The backend simply receives the classification string `"face_character"`, looks up a static text prompt template in `REFERENCE_ROLE_CONFIGS[REFERENCE_ROLES.FACE_CHARACTER]`, and **forwards the entire raw reference image** in `input_references` to OpenRouter's `/api/v1/images` endpoint.

### 1.3 How is the `face_character` reference role assigned?
The role is assigned either through:
1. **Vision Classifier (`classifyReferenceImageWithVision`):** If the image is a valid Data URL and the vision call succeeds within 5 seconds.
2. **Prompt Heuristic Fallback (`classifyReferenceRoleByPrompt`):** Regex search for keywords:
   `['face', 'person', 'character', 'man', 'woman', 'girl', 'boy', 'guy', 'lady', 'model', 'me', 'myself', 'him', 'her', 'portrait', 'headshot', 'selfie', 'actor', 'cosplay', 'avatar', 'same person', 'this person', 'identical face', 'look like', 'resemble', 'likeness']`.
   If a match is found, role is set to `face_character` with confidence `0.88`.

Once assigned, it attaches the following static instructions:
* `mustPreserve`: `"Exact facial structure, eyes, nose, lips, jawline, skin tone, hairstyle, facial hair, and biometric likeness"`
* `canChange`: `"Clothing, posture, lighting atmosphere, background setting, camera perspective"`
* `anchoringInstruction`: `"CRITICAL IDENTITY PRESERVATION: Maintain the exact facial identity, biometric facial geometry, eye shape, nose structure, mouth, skin tone, and facial likeness of the person in the reference image. Place this exact person naturally into the requested scene without altering their recognizable facial features."`

### 1.4 Does reference preprocessing preserve important facial details?
* In `src/utils/imagePreprocessing.ts`:
  - If the image file is $\le 1.8\text{ MB}$ and dimensions are $\le 2048\text{px}$, it passes through without re-compression.
  - If oversized, it is downscaled proportionally to max $2048\text{px}$ using HTML5 Canvas `imageSmoothingQuality = 'high'` and encoded as JPEG at $0.90$ quality (`processImageViaCanvas`).
* In `index.html`:
  - `handleRefFileUpload` calls `preprocessImageUpload(file)` and then `setStudioReferenceImage` calls `compressImageDataUrl(dataUrl)` which re-invokes `preprocessImageUpload(dataUrl)`. This creates a potential **double-compression cycle**.
* In `server/src/utils/imageOptimizer.js`:
  - `optimizeImageBuffer` applies Sharp's `lanczos3` kernel for resizing and `mozjpeg` with `trellisQuantisation: true` and `overshootDeringing: true` at quality 90.
  - However, if the overall OpenRouter payload exceeds $6\text{ MB}$, `ensureOpenRouterPayloadLimits` triggers **progressive compression**, aggressively dropping dimensions to $1536\text{px}$ ($q85$), $1280\text{px}$ ($q80$), and finally $1024\text{px}$ ($q75$).

### 1.5 Does image compression reduce identity-related information?
* **Yes, in specific high-impact scenarios:**
  1. **Whole-image compression without face-preserving priority:** Because the entire photo (including clothes and background) is compressed uniformly, the face—which might occupy only a small fraction of a loose portrait—loses high-frequency micro-textures (iris details, eyelid crease geometry, philtrum contour, skin pores).
  2. **Double canvas/sharp JPEG compression:** Successive quantization passes round off discrete cosine transform (DCT) coefficients, softening subtle facial bone structure definition.

---

## 3. INVESTIGATION AREA 2: FACE AND BODY CONSISTENCY

Below is the forensic audit of which physiological and photographic consistency parameters are handled by the platform vs. left to the external model:

| Parameter | Handled by Backend? | Left to External Model? | Evidence in Codebase | Consequence / Visual Failure Mode |
| :--- | :---: | :---: | :--- | :--- |
| **Head-to-body proportions** | ❌ NO | ✅ 100% | No skeletal / pose landmarking anywhere in `server/src/`. | Head appears oversized (bobblehead effect) or undersized relative to shoulders and torso. |
| **Face and neck alignment** | ❌ NO | ✅ 100% | No anatomical joint tracking or trapezius alignment. | "Twisted neck" or floating head where cervical spine vector does not match torso vector. |
| **Natural skin-tone consistency** | ❌ NO | ✅ 100% | Only mentioned as text in `anchoringInstruction` ("skin tone"). | Face retains portrait's white balance (e.g. warm indoor) while AI body has cold outdoor skin tones. |
| **Lighting consistency between face & body** | ❌ NO | ✅ 100% | No lighting direction detection or relighting pass. | Face exhibits flat frontal flash/ambient light while body exhibits strong side rim lighting or sunset backlighting. |
| **Camera perspective & focal length** | ❌ NO | ✅ 100% | No lens intrinsic estimation or perspective warping. | Face has $28\text{mm}$ smartphone selfie barrel distortion, while body is rendered in flat $85\text{mm}$ telephoto compression. |
| **Head orientation & body pose compatibility** | ❌ NO | ✅ 100% | No 3D head pose estimation (pitch/yaw/roll). | Head faces directly toward camera while body is turned 45 degrees, creating an unnatural stiffness. |
| **Natural facial integration into compositions** | ❌ NO | ✅ 100% | No boundary inpainting, feathering, or post-process blending. | Visible seam or stylistic disconnect at collar/neckline; face looks pasted onto a stock AI body. |

### Summary of Backend vs. Model Responsibility:
* **The backend handles 0% of the anatomical, geometric, and photographic synthesis.**
* The backend acts solely as a **prompt-enricher and payload forwarder**.
* All physical consistency is delegated entirely to the external model via a single multimodal forward pass.

---

## 4. INVESTIGATION AREA 3: PROMPT INTELLIGENCE

### 4.1 Does the system distinguish identity preservation from scene generation?
* **Partially in intent, but NOT in prompt architecture:**
* `referenceIntelligence.js` defines `mustPreserve` and `canChange`:
  - `mustPreserve`: Face, eyes, nose, lips, jawline, skin tone, hairstyle.
  - `canChange`: Clothing, posture, lighting atmosphere, background setting, camera perspective.
* However, when these instructions reach `promptIntelligence.js`, they are simply combined into a single text prompt string. The diffusion model receives one continuous text prompt containing both the identity mandate and the scene description.

### 4.2 Does it understand that the uploaded portrait is the identity source, not the composition source?
* **The backend recognizes this conceptually, but fails to communicate it clearly to the image model:**
* In `referenceIntelligence.js`, `REFERENCE_ROLE_CONFIGS[FACE_CHARACTER]` sets:
  `"Place this exact person naturally into the requested scene without altering their recognizable facial features."`
* **Critical Flaw:** The prompt **never explicitly informs the model about the framing disparity**:
  - It does NOT state: *"The reference image is a close-up portrait. Ignore its framing, crop, background, and head tilt. Generate a complete, anatomically proportional full-length body as requested in the scene."*
* Because this instruction is missing, multimodal models often interpret the reference image as both an **identity anchor AND a framing bias**.

### 4.3 How are identity instructions combined with outfit, pose, and scene instructions?
In `server/src/services/promptIntelligence.js` (lines 250–278):
```javascript
const systemPrompt = buildIntelligenceSystemPrompt(styleInfo);
let userPromptText = `Original Prompt: "${trimmed}"`;

if (options.referenceAnchorPrompt) {
  userPromptText += `\nReference Guidance to integrate: ${options.referenceAnchorPrompt}`;
}

const response = await axios.post(
  'https://openrouter.ai/api/v1/chat/completions',
  {
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPromptText }
    ],
    temperature: 0.6,
    max_tokens: 450
  }, ...
);
```
1. In the primary LLM path (`google/gemini-2.5-flash`), the LLM receives the user prompt and the identity guidance, and merges them into a **single coherent descriptive paragraph**.
2. In the heuristic fallback (`applyHeuristicEnrichment` lines 160–169):
```javascript
if (options.referenceAnchorPrompt) {
  const anchorText = options.referenceAnchorPrompt;
  const isFaceAnchor = anchorText.includes('IDENTITY PRESERVATION') || anchorText.includes('facial identity');
  if (isFaceAnchor) {
    return `${anchorText} ${trimmed}${enhancements.length > 0 ? ', ' + enhancements.join(', ') : ''}`;
  }
}
```
Here, the anchor is prepended to the front of the prompt.

### 4.4 Can prompt enhancements accidentally weaken identity preservation?
* **YES, significantly.**
* When `google/gemini-2.5-flash` enriches the prompt, it expands a simple prompt into an elaborate visual description (adding 100–200 words covering fabrics, lighting reflections, background architecture, weather atmosphere, and color grading).
* In diffusion models (such as Gemini 3 Pro Image or GPT Image 2.5):
  1. **Token Attention Decay:** Attention in transformer-based text encoders (like T5-XXL or CLIP) is finite. When the prompt is crowded with dozens of competing adjectives describing the scene and clothes, the relative attention weight allocated to facial identity tokens diminishes.
  2. **Lighting Contradiction:** If the LLM generates *"dramatic golden sunset backlighting with strong orange rim light on the subject"*, while the reference portrait has flat indoor fluorescent lighting, the diffusion model encounters an unresolvable contradiction: either change the facial lighting (which alters likeness) or keep the reference lighting (which causes the face to look pasted onto the backlit body).

---

## 5. INVESTIGATION AREA 4: MODEL-LEVEL INVESTIGATION

Every supported image generation model in `server/src/config/imageModelRegistry.js` was evaluated against its actual OpenRouter API implementation and identity conditioning capabilities:

| Model ID | Frontend Display Name | Adapter | Declared Reference Support | Actual OpenRouter Reference Behavior | Identity Preservation Strength | Face / Body Consistency Quality | Key Limitations & Failure Points |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **`google/gemini-3-pro-image`** | Nano Banana Pro (Gemini 3 Pro Image) | `gemini` | `true` (max 3) | **Supported** via `input_references` on `/api/v1/images`. | **High** | **Moderate to Weak on Full-Body** | Global cross-attention without local face crop causes face-body disconnect; tends to inherit reference portrait's crop/lighting. |
| **`openai/gpt-image-2.5-sunburst`** | GPT Image 2.5 Sunburst | `openai` | `true` (max 2) | **Partial/Unreliable** via `input_references`. OpenRouter passes it, but standard OpenAI image endpoints have no official reference image parameter in t2i. | **Moderate to Low** | **Poor** | Often treats reference as general style or produces a loose caricature; frequently hallucinates a completely new face. |
| **`black-forest-labs/flux.2-pro`** | FLUX.2 Pro | `flux` | `false` (max 0) | **REJECTED** by OpenRouter `/images` endpoint for multimodal parameters. Preflight blocks with HTTP 422. | **None** | **N/A (Text-only)** | Cannot use reference images. If forced via fallback, generates a random AI face matching only prompt text. |
| **`bytedance-seed/seedream-5.0-pro`** | Seedream 5.0 Pro | `seedream` | `true` (max 1) | **Supported** via `input_references` on `/api/v1/images` (requires slug fallbacks). | **Moderate** | **Inconsistent** | Tends to bias heavily toward reference composition; if reference is portrait and prompt is full-body, either crops to bust or loses face likeness. |
| **`meta/muse-image`** | Meta: Muse Image | `textOnly` | `false` (max 0) | **REJECTED** for multimodal inputs. Preflight blocks with HTTP 422; adapter strips images. | **None** | **N/A (Text-only)** | Pure text-to-image model. Zero reference image support. |
| **`google/gemini-3.1-flash-image-preview`** | Nano Banana 2 (Gemini 3.1 Flash Image) | `gemini` | `true` (max 2) | **Supported** via `input_references` on `/api/v1/images`. | **Moderate** | **Weak** | Fast drafting model; low latent resolution causes severe facial blurring and feature distortion when face is small in frame. |
| **`black-forest-labs/flux.2-flex`** *(Supplementary)* | FLUX.2 Flex | `flux` | `true` (max 1) | **Supported** primarily for inpainting/precise-edit. | **Moderate** | **Fair** | Primarily tuned for inpainting; weak standalone text+reference identity synthesis. |
| **`krea/k3-edit`** *(Supplementary)* | Krea K3 Edit | `flux` | `true` (max 2) | Dedicated to `precise-edit` mode (requires source canvas). | **Moderate** | **N/A for Generate** | Not available in standard text-to-image generate mode. |

### Does OpenRouter correctly support the required reference-image behavior?
* **No, not for professional photographic identity integration.**
* OpenRouter provides a generic, unified `input_references: [{ type: "image_url", image_url: { url } }]` parameter.
* It does **not** provide:
  - Role-conditioned tags (`role: "face_identity"`, `role: "pose"`, `role: "style"`).
  - Conditioning weights (e.g. `identity_weight: 0.85`, `denoising_strength: 0.4`).
  - Face bounding-box coordinates or facial landmark alignment.
  - Two-stage high-resolution face restoration (Face Detailer / CodeFormer / GFPGAN).
* As a result, OpenRouter passes the image as a global visual prompt to the upstream model, leaving the model to guess which elements (face vs. background vs. lighting) to preserve.

---

## 6. INVESTIGATION AREA 5: AUTO MODEL ROUTING

### 6.1 The Actual Routing Decision in Code
In `server/src/controllers/imageController.js` (lines 556–574):
```javascript
const isAuto = !model || model === 'auto' || (typeof model === 'string' && model.toLowerCase() === 'auto');
let selectedModelId;
let displayName;
let autoRoutingMeta = null;

if (isAuto && effectiveReferenceImages.length > 0) {
  // Auto mode with reference images dynamically routes to high-identity multimodal model
  const autoRoute = resolveAutoModelForReferences(rawPrompt, effectiveReferenceImages);
  selectedModelId = autoRoute.model;
  displayName = autoRoute.modelName;
  autoRoutingMeta = autoRoute;
} else if (isAuto) {
  selectedModelId = routeAutoImageModel(rawPrompt, isEditMode);
  displayName = resolveModelDisplayName(selectedModelId);
} else {
  selectedModelId = resolveOpenRouterImageModel(model);
  displayName = resolveModelDisplayName(selectedModelId);
}
```

Now look at `resolveAutoModelForReferences` in `server/src/services/referenceIntelligence.js` (lines 285–303):
```javascript
export function resolveAutoModelForReferences(prompt = '', referenceImages = [], options = {}) {
  const hasRefs = Array.isArray(referenceImages) && referenceImages.length > 0;

  if (hasRefs) {
    // google/gemini-3-pro-image provides high-strength identity preservation with native multimodal conditioning
    const targetModelConfig = getImageModelConfig('google/gemini-3-pro-image');
    return {
      model: targetModelConfig.id,
      modelName: targetModelConfig.displayName,
      modelConfig: targetModelConfig,
      isAuto: true,
      routedReason: 'High-identity multimodal conditioning for reference images',
      identityPreservationStrength: targetModelConfig.identityPreservationStrength || 'high'
    };
  }

  // Fall back to text-only auto routing
  return null;
}
```

### 6.2 Analysis of Auto Routing Decisions
1. **Hardcoded Monolithic Routing:**  
   The moment `effectiveReferenceImages.length > 0`, `resolveAutoModelForReferences` **always returns `google/gemini-3-pro-image`**.
2. **Total Blindness to Prompt Context:**
   - **Portrait-to-full-body generation?** $\rightarrow$ Routes to `google/gemini-3-pro-image`.
   - **Identity-preserving fashion portraits?** $\rightarrow$ Routes to `google/gemini-3-pro-image`.
   - **Different outfits and poses?** $\rightarrow$ Routes to `google/gemini-3-pro-image`.
   - **Photorealistic DSLR photography?** $\rightarrow$ Routes to `google/gemini-3-pro-image` (does NOT route to Seedream 5.0 Pro).
   - **Anime / Cartoon character face?** $\rightarrow$ Routes to `google/gemini-3-pro-image` (does NOT route to GPT Image 2.5 Sunburst).
3. **Contrast with Text-Only Auto Routing:**  
   When NO reference images are uploaded, `routeAutoImageModel(rawPrompt)` actively inspects regex patterns and routes between 3 different models:
   - Typography $\rightarrow$ `black-forest-labs/flux.2-pro`
   - Cartoon/Anime $\rightarrow$ `openai/gpt-image-2.5-sunburst`
   - Photorealistic/DSLR $\rightarrow$ `bytedance-seed/seedream-5.0-pro`  
   **With reference images, this intelligence is completely disabled in favor of a hardcoded override to Gemini 3 Pro Image.**

---

## 7. INVESTIGATION AREA 6: ROOT CAUSE ANALYSIS

The lack of natural integration between face and body stems from 5 distinct, compounding layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. BACKEND IMPLEMENTATION                                              │
│    - Zero biometric facial landmarking or embedding extraction.        │
│    - Single monolithic pass (no 2-stage generation + face inpainting). │
│    - No face crop or multi-scale conditioning.                         │
│    - Blind hardcoded Auto routing to Gemini 3 Pro.                     │
├────────────────────────────────────────────────────────────────────────┤
│ 2. PROMPT ENGINEERING                                                  │
│    - LLM expands scene details, diluting identity prompt weight.       │
│    - No anatomical bridge instruction (portrait crop vs full body).    │
│    - Conflicting lighting instructions (scene lighting vs ref photo).  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. REFERENCE IMAGE INPUT                                               │
│    - Single 2D portrait lacks 3D head pose and multi-angle data.       │
│    - Multiple canvas / sharp compression passes soften micro-features. │
│    - Smartphone wide-angle lens distortion baked into reference.       │
├────────────────────────────────────────────────────────────────────────┤
│ 4. EXTERNAL FOUNDATION MODELS                                          │
│    - Global cross-attention bleeds reference background into scene.    │
│    - In full-body shots, face occupies only ~12x12 latent patches.     │
│    - Black-box API offers zero control over conditioning strength.     │
├────────────────────────────────────────────────────────────────────────┤
│ 5. PROVIDER / API INTEGRATION (OPENROUTER)                             │
│    - Generic /api/v1/images endpoint lacks role-specific conditioning. │
│    - FLUX.2 Pro and Muse Image reject reference images entirely.       │
│    - GPT Image 2.5 treats input_references as loose guidance.          │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Backend Implementation Problems
* **Lack of Multi-Stage Architecture:** Professional AI image generators never attempt to generate a full body and an exact personal face in a single text-to-image step. They generate the body first, detect the face bounding box, and perform an inpainting face swap with alignment. The backend treats image generation as a single black-box RPC.
* **Absence of Facial Pre-Extraction:** The backend does not crop the face. Passing the full portrait (with its own clothing and background) forces the diffusion model to decide what to ignore and what to use.

### 7.2 Prompt Engineering Limitations
* **Verbose LLM Hallucination:** `refinePrompt` expands prompts into rich prose. While this improves standalone backgrounds, it acts as noise for face identity preservation.
* **No Perspective / Lens Harmonization Prompt:** The system never instructs the model: *"Render the subject with a unified 50mm portrait lens perspective, matching neck thickness and shoulder posture to the facial gaze."*

### 7.3 Reference Image Limitations
* **Perspective Mismatch:** The user's portrait is typically a front-facing smartphone selfie ($28\text{mm}$ focal length, slight barrel distortion, chin-up angle). The requested prompt is often a standing fashion shot ($85\text{mm}$ focal length, eye-level or low-angle). Merging these two perspectives without 3D geometric warping causes the head to look unnatural on the shoulders.

### 7.4 External Model Limitations
* **Latent Resolution Bottleneck:** In a standard $1024 \times 1024$ image with an 8x VAE downsampling factor, the latent space is $128 \times 128$. For a full-body character, the head is approximately $12 \times 12$ latent pixels. Attempting to encode high-fidelity biometric likeness, eye gaze, and lip geometry in a $12 \times 12$ latent grid is mathematically prone to degradation.

### 7.5 Provider / API Integration Limitations
* **OpenRouter Abstraction Layer:** OpenRouter standardizes requests to `/api/v1/images`. While convenient, this abstraction strips away specialized provider features (such as Midjourney's `--cref`, ComfyUI's IP-Adapter FaceID, InsightFace InstantID, or Fal.ai's dedicated portrait trainers).

---

## 8. RECOMMENDED ARCHITECTURAL IMPROVEMENTS (FOR FUTURE CONSIDERATION)

The following architectural solutions are proposed for future implementation to achieve studio-grade face and body consistency, without modifying any current code:

### Improvement 1: Decoupled Two-Pass Generation Pipeline (Scene $\rightarrow$ Face Inpaint)
Instead of attempting full-body generation and face conditioning in a single shot:
1. **Pass 1 (Scene & Body Generation):** Generate the requested scene, pose, and outfit using the prompt, conditioning only on general demographics (e.g., gender, hair color, build).
2. **Pass 2 (Automated Face Alignment & Inpaint):**
   - Automatically detect the generated face bounding box via Sharp / lightweight vision.
   - Expand bounding box by 30% to include neck and hairline.
   - Inpaint the user's reference face into that region using a face-conditioned inpainting model (e.g. FLUX.2 Flex or Krea K3 Edit), preserving the surrounding body lighting and neck angle.

### Improvement 2: Automated Face Cropping & Multi-Scale Reference Injection
Before sending the reference image to the model:
- Detect and extract a tight square crop of the face (from crown to lower neck).
- Send **two** reference images in `input_references`:
  1. *Ref 1 (Cropped Face):* High-resolution face crop for fine biometric geometry.
  2. *Ref 2 (Original Portrait):* For skin tone, hair texture, and natural coloring.
- This prevents the model from being confused by the original photo's background and clothing.

### Improvement 3: Anatomical Bridge & Lens Prompt Directives
Upgrade `promptIntelligence.js` with explicit anatomical bridging rules when `role === 'face_character'`:
- Inject:
  > *"ANATOMICAL INTEGRATION DIRECTIVE: The attached reference image is strictly a facial identity reference. Disentangle the facial identity from the reference image's framing and neck crop. Synthesize a complete, anatomically proportional body with correct 1:7.5 head-to-body ratio. Seamlessly connect the neck muscles and trapezius to the shoulders. Harmonize all facial lighting, skin undertones, and shadows to match the environmental lighting of the scene."*

### Improvement 4: Multi-Model Contextual Auto Routing
Upgrade `resolveAutoModelForReferences` from a hardcoded single-model route to an intelligent multi-model selector:
- Full-body fashion / photorealism $\rightarrow$ Route to a model with superior anatomical coherence and detail (or two-stage pipeline).
- Stylized / Anime character reference $\rightarrow$ Route to `openai/gpt-image-2.5-sunburst`.
- Fast drafting $\rightarrow$ `google/gemini-3.1-flash-image-preview`.

### Improvement 5: Dedicated Identity-Preserving Provider Integration
Explore integrating dedicated identity-conditioning endpoints (such as Fal.ai InstantID / FaceID or specialized face-swap inpainting microservices) alongside OpenRouter, allowing true biometric feature vector guidance rather than relying solely on black-box visual tokens.

---

## 9. CONFIRMATION OF UNCHANGED WORKSPACE

In accordance with strict read-only audit instructions:
* **No existing source code files were modified.**
* **No model adapters were altered.**
* **No prompt intelligence or model routing logic was edited.**
* **No dependencies or packages were installed.**
* **No environment variables were changed.**
* **Only this markdown audit document (`FACE_BODY_CONSISTENCY_AUDIT.md`) was generated.**

*(End of Audit Report)*
