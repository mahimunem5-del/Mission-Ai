const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const originalLength = html.length;

function replaceExact(searchStr, replaceStr, label) {
  if (!html.includes(searchStr)) {
    console.error(`ERROR: [${label}] search string not found!`);
    console.error('Search snippet was:\n', searchStr.substring(0, 150));
    process.exit(1);
  }
  html = html.replace(searchStr, replaceStr);
  console.log(`[PASS] Replaced ${label}`);
}

function replaceAllExact(searchStr, replaceStr, label) {
  if (!html.includes(searchStr)) {
    console.error(`ERROR: [${label}] search string not found!`);
    process.exit(1);
  }
  const count = html.split(searchStr).length - 1;
  html = html.replaceAll(searchStr, replaceStr);
  console.log(`[PASS] Replaced all ${count} occurrences of ${label}`);
}

console.log('--- 1. Google Fonts 800 Weight ---');
replaceAllExact(
  'Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  'Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'Google Fonts 800 weight'
);

console.log('--- 2. Main Hero Headline ---');
replaceExact(
  `<h1 class="flex items-baseline justify-center flex-wrap leading-tight">
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">Imagine it.</span>
                            <span class="font-['Instrument_Serif',serif] italic font-normal text-[34px] sm:text-[38px] tracking-[-0.01em] bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent ml-1.5">Craft it.</span>
                        </h1>`,
  `<h1 class="flex items-baseline justify-center flex-wrap leading-tight">
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-bold tracking-[-0.03em] text-neutral-900 dark:text-white">Imagine it.</span>
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-extrabold tracking-[-0.035em] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent ml-2">Craft it.</span>
                        </h1>`,
  'Main Hero Headline'
);

console.log('--- 3. Workspace Font Family ---');
replaceExact(
  `<div id="image-studio-workspace"
            class="hidden flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden min-w-0 bg-white dark:bg-[#191919] text-slate-900 dark:text-slate-100 select-none relative font-sans">`,
  `<div id="image-studio-workspace"
            class="hidden flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden min-w-0 bg-white dark:bg-[#191919] text-slate-900 dark:text-slate-100 select-none relative font-['Plus_Jakarta_Sans',sans-serif]">`,
  'image-studio-workspace base font-family'
);

replaceExact(
  `<aside id="ideogram-left-panel"
                class="w-full md:w-[380px] shrink-0 h-full flex flex-col bg-white dark:bg-[#191919] z-20 overflow-hidden"`,
  `<aside id="ideogram-left-panel"
                class="w-full md:w-[380px] shrink-0 h-full flex flex-col bg-white dark:bg-[#191919] z-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"`,
  'ideogram-left-panel font-family'
);

replaceExact(
  `<main id="ideogram-right-panel"
                class="flex-1 w-full h-full min-w-0 flex flex-col bg-white dark:bg-[#191919] overflow-hidden relative">`,
  `<main id="ideogram-right-panel"
                class="flex-1 w-full h-full min-w-0 flex flex-col bg-white dark:bg-[#191919] overflow-hidden relative font-['Plus_Jakarta_Sans',sans-serif]">`,
  'ideogram-right-panel font-family'
);

console.log('--- 4. Left Sidebar Header & Action Link ---');
replaceExact(
  `<div id="ideogram-header-generate"
                        class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white relative">`,
  `<div id="ideogram-header-generate"
                        class="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white relative">`,
  'ideogram-header-generate class'
);

replaceExact(
  `<button type="button" id="workspace-tool-switcher-btn"
                                class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800/80 px-2 py-1.5 rounded-lg transition cursor-pointer select-none">`,
  `<button type="button" id="workspace-tool-switcher-btn"
                                class="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 px-2 py-1.5 rounded-lg transition cursor-pointer select-none">`,
  'workspace-tool-switcher-btn class'
);

replaceExact(
  `<div id="ideogram-header-edit"
                        class="hidden items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">`,
  `<div id="ideogram-header-edit"
                        class="hidden items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white">`,
  'ideogram-header-edit class'
);

replaceExact(
  `<button type="button" id="ideogram-reset-composer-btn"
                            class="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Clear all">
                            Clear all
                        </button>`,
  `<button type="button" id="ideogram-reset-composer-btn"
                            class="text-[12.5px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                            title="Clear all">
                            Clear all
                        </button>`,
  'ideogram-reset-composer-btn Clear all'
);

console.log('--- 5. Workspace 1: Generate Image Controls ---');
// 5.1 Model label & button & label
replaceExact(
  `<label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Model</label>
                            <div class="relative">
                                <button id="studio-model-btn" type="button"
                                    class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                    <div class="flex items-center gap-2.5 min-w-0">
                                        <span id="studio-model-icon"
                                            class="w-4 h-4 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <svg class="w-4 h-4 shrink-0 text-slate-900 dark:text-white"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="m16 3 4 4-4 4" />
                                                <path d="M20 7H4" />
                                                <path d="m8 21-4-4 4-4" />
                                                <path d="M4 17h16" />
                                            </svg>
                                        </span>
                                        <span id="studio-model-label"
                                            class="truncate font-semibold text-slate-800 dark:text-slate-100">Auto</span>
                                    </div>`,
  `<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Model</label>
                            <div class="relative">
                                <button id="studio-model-btn" type="button"
                                    class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-200 shadow-2xs">
                                    <div class="flex items-center gap-2.5 min-w-0">
                                        <span id="studio-model-icon"
                                            class="w-4 h-4 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <svg class="w-4 h-4 shrink-0 text-slate-900 dark:text-white"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="m16 3 4 4-4 4" />
                                                <path d="M20 7H4" />
                                                <path d="m8 21-4-4 4-4" />
                                                <path d="M4 17h16" />
                                            </svg>
                                        </span>
                                        <span id="studio-model-label"
                                            class="truncate text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100">Auto</span>
                                    </div>`,
  'Generate Model Label and Button'
);

// 5.2 Reference Images label & counter
replaceExact(
  `<div class="flex items-center justify-between text-xs">
                                <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Reference
                                    images</label>
                                <span id="ideogram-ref-status" class="text-[11px] text-slate-400 font-mono">0/10</span>
                            </div>`,
  `<div class="flex items-center justify-between">
                                <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Reference images</label>
                                <span id="ideogram-ref-status" class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">0/10</span>
                            </div>`,
  'Generate Reference images label & counter'
);

// 5.3 Style Presets label & Pills
replaceExact(
  `<div class="space-y-1.5">
                            <div class="flex items-center justify-between text-xs">
                                <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Style Presets</label>
                            </div>`,
  `<div class="space-y-1.5">
                            <div class="flex items-center justify-between">
                                <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Style Presets</label>
                            </div>`,
  'Style Presets Label'
);

// Update all 9 style pills from text-[11px] to text-[13px] font-medium tracking-[-0.005em]
replaceExact(
  `class="ideogram-style-pill active px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-2xs transition-all cursor-pointer">
                                    Auto`,
  `class="ideogram-style-pill active px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-2xs transition-all cursor-pointer">
                                    Auto`,
  'Style pill Auto'
);

replaceAllExact(
  `class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">`,
  `class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">`,
  'Style pills (General, Realistic, Design, etc.)'
);

// 5.4 Prompt label & textarea
replaceExact(
  `<!-- 4. PROMPT COMPOSER -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Prompt</label>`,
  `<!-- 4. PROMPT COMPOSER -->
                        <div class="space-y-1.5">
                            <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Prompt</label>`,
  'Generate Prompt Label'
);

replaceExact(
  `<textarea id="studio-prompt-input" rows="10"
                                    placeholder="Describe the image you want to create..."
                                    class="w-full min-h-[240px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-[13.5px] bg-transparent leading-relaxed"></textarea>`,
  `<textarea id="studio-prompt-input" rows="10"
                                    placeholder="Describe the image you want to create..."
                                    class="w-full min-h-[240px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent"></textarea>`,
  'Generate Prompt Textarea Input & Placeholder'
);

// 5.5 Ratio & Count Buttons
replaceExact(
  `<button id="studio-ratio-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span id="studio-ratio-icon"
                                            class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <div class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0"></div>
                                        </span>
                                        <span id="studio-ratio-label" class="font-medium truncate">1:1</span>
                                    </div>`,
  `<button id="studio-ratio-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span id="studio-ratio-icon"
                                            class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <div class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0"></div>
                                        </span>
                                        <span id="studio-ratio-label" class="text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100 truncate">1:1</span>
                                    </div>`,
  'Generate Ratio Button'
);

replaceExact(
  `<button id="studio-count-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="w-4 h-4 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                <line x1="12" x2="12" y1="3" y2="21"/>
                                            </svg>
                                        </span>
                                        <span id="studio-count-label" class="font-medium truncate">1</span>
                                    </div>`,
  `<button id="studio-count-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="w-4 h-4 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                <line x1="12" x2="12" y1="3" y2="21"/>
                                            </svg>
                                        </span>
                                        <span id="studio-count-label" class="text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100 truncate">1</span>
                                    </div>`,
  'Generate Count Button'
);

// 5.6 Advanced settings label
replaceExact(
  `<button type="button" id="ideogram-advanced-toggle"
                                class="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group">
                                <span class="text-xs font-semibold">Advanced settings</span>`,
  `<button type="button" id="ideogram-advanced-toggle"
                                class="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group">
                                <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Advanced settings</span>`,
  'Generate Advanced Settings Label'
);

// 5.7 Generate Primary Button
replaceExact(
  `<button id="studio-generate-btn" type="button"
                                class="w-full h-10 py-2 px-4 rounded-lg bg-[#111111] hover:bg-[#262626] active:bg-black text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E5E7EB] dark:disabled:bg-neutral-800 disabled:text-[#9CA3AF] dark:disabled:text-neutral-500 disabled:cursor-not-allowed">`,
  `<button id="studio-generate-btn" type="button"
                                class="w-full h-10 py-2 px-4 rounded-lg bg-[#111111] hover:bg-[#262626] active:bg-black text-white text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E5E7EB] dark:disabled:bg-neutral-800 disabled:text-[#9CA3AF] dark:disabled:text-neutral-500 disabled:cursor-not-allowed">`,
  'Generate Submit Button'
);

console.log('--- 6. Workspace 2: Remove Background Controls ---');
replaceExact(
  `<div id="ideogram-remove-bg-controls" class="hidden space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-medium text-neutral-500 block mb-2">Source image</label>

                            <!-- Hidden File Input -->
                            <input type="file" id="remove-bg-file-input" accept="image/png,image/jpeg,image/webp"
                                class="hidden">

                            <!-- Dropzone (Empty State) -->
                            <div id="remove-bg-upload-zone"
                                class="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                                <span class="text-sm text-neutral-600 dark:text-neutral-400 font-normal">Upload or
                                    choose an image</span>
                                <button type="button" id="remove-bg-add-btn"
                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer">
                                    <span>+ Add</span>
                                </button>
                            </div>

                            <!-- Uploaded Image Preview (Filled State) -->
                            <div id="remove-bg-preview-wrapper"
                                class="hidden relative w-full aspect-[4/3] max-h-[380px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:8px_8px] flex items-center justify-center p-2">
                                <img id="remove-bg-preview-img" src="" alt="Source preview"
                                    class="w-full h-full object-contain rounded-xl">
                                <button type="button" id="remove-bg-remove-file-btn"
                                    class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs transition cursor-pointer z-20 shadow-md"
                                    title="Change image">✕</button>
                            </div>
                        </div>

                        <!-- Action Button -->
                        <button type="button" id="btn-do-remove-bg" disabled
                            class="w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed">
                            <span id="btn-do-remove-bg-text">Remove background</span>
                        </button>
                    </div>`,
  `<div id="ideogram-remove-bg-controls" class="hidden space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-2">Source image</label>

                            <!-- Hidden File Input -->
                            <input type="file" id="remove-bg-file-input" accept="image/png,image/jpeg,image/webp"
                                class="hidden">

                            <!-- Dropzone (Empty State) -->
                            <div id="remove-bg-upload-zone"
                                class="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                                <span class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">Upload or choose an image</span>
                                <button type="button" id="remove-bg-add-btn"
                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-[13px] font-medium tracking-[-0.005em] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer">
                                    <span>+ Add</span>
                                </button>
                            </div>

                            <!-- Uploaded Image Preview (Filled State) -->
                            <div id="remove-bg-preview-wrapper"
                                class="hidden relative w-full aspect-[4/3] max-h-[380px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:8px_8px] flex items-center justify-center p-2">
                                <img id="remove-bg-preview-img" src="" alt="Source preview"
                                    class="w-full h-full object-contain rounded-xl">
                                <button type="button" id="remove-bg-remove-file-btn"
                                    class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs transition cursor-pointer z-20 shadow-md"
                                    title="Change image">✕</button>
                            </div>
                        </div>

                        <!-- Action Button -->
                        <button type="button" id="btn-do-remove-bg" disabled
                            class="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed">
                            <span id="btn-do-remove-bg-text">Remove background</span>
                        </button>
                    </div>`,
  'Remove Background Controls'
);

// Dynamic JS states for remove bg button
replaceAllExact(
  "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100';",
  "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100';",
  'btnDoRemoveBg active state in JS'
);

replaceAllExact(
  "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed';",
  "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed';",
  'btnDoRemoveBg disabled state in JS'
);

replaceAllExact(
  "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed';",
  "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed';",
  'btnDoRemoveBg loading state in JS'
);

console.log('--- 7. Workspace 3: Precise Edit Controls ---');
replaceExact(
  `<div class="space-y-1.5">
                            <label class="text-xs font-medium text-neutral-500 block mb-2">Image</label>

                            <!-- Hidden File Input -->
                            <input type="file" id="studio-precise-edit-file-input"
                                accept="image/png,image/jpeg,image/webp" class="hidden">

                            <!-- Dropzone (Empty State) -->
                            <div id="studio-precise-edit-dropzone"
                                class="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                                <span class="text-sm text-neutral-600 dark:text-neutral-400 font-normal">Upload or
                                    choose an image</span>
                                <button type="button" id="studio-precise-edit-add-btn"
                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer">
                                    <span>+ Add</span>
                                </button>
                            </div>`,
  `<div class="space-y-1.5">
                            <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-2">Source image</label>

                            <!-- Hidden File Input -->
                            <input type="file" id="studio-precise-edit-file-input"
                                accept="image/png,image/jpeg,image/webp" class="hidden">

                            <!-- Dropzone (Empty State) -->
                            <div id="studio-precise-edit-dropzone"
                                class="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none">
                                <span class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">Upload or choose an image</span>
                                <button type="button" id="studio-precise-edit-add-btn"
                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-[13px] font-medium tracking-[-0.005em] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer">
                                    <span>+ Add</span>
                                </button>
                            </div>`,
  'Precise Edit Source Image Dropzone'
);

replaceExact(
  `<div class="space-y-1.5">
                            <label for="studio-precise-edit-input"
                                class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">What should
                                change?</label>
                            <div
                                class="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 relative transition-all focus-within:border-slate-400 dark:focus-within:border-white/20 focus-within:ring-1 focus-within:ring-blue-500/20">
                                <textarea id="studio-precise-edit-input" rows="4"
                                    placeholder="Describe the change you want..."
                                    class="w-full min-h-[110px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-[13.5px] bg-transparent leading-relaxed"></textarea>
                            </div>`,
  `<div class="space-y-1.5">
                            <label for="studio-precise-edit-input"
                                class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">What should change?</label>
                            <div
                                class="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 relative transition-all focus-within:border-slate-400 dark:focus-within:border-white/20 focus-within:ring-1 focus-within:ring-blue-500/20">
                                <textarea id="studio-precise-edit-input" rows="4"
                                    placeholder="Describe the change you want..."
                                    class="w-full min-h-[110px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent"></textarea>
                            </div>`,
  'Precise Edit What should change? & Prompt Textarea'
);

replaceExact(
  `<div class="flex items-center justify-between text-xs">
                                <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Reference
                                    images</label>
                                <span id="studio-precise-edit-ref-status"
                                    class="text-[11px] text-slate-400 font-mono">0/10</span>
                            </div>`,
  `<div class="flex items-center justify-between">
                                <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Reference images</label>
                                <span id="studio-precise-edit-ref-status"
                                    class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">0/10</span>
                            </div>`,
  'Precise Edit Reference images label & counter'
);

replaceExact(
  `<label
                                    class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Quality</label>
                                <div class="relative" id="studio-precise-weight-wrapper">
                                    <button id="studio-precise-weight-btn" type="button"
                                        class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <span class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <line x1="4" x2="4" y1="21" y2="14"/>
                                                    <line x1="4" x2="4" y1="10" y2="3"/>
                                                    <line x1="12" x2="12" y1="21" y2="12"/>
                                                    <line x1="12" x2="12" y1="8" y2="3"/>
                                                    <line x1="20" x2="20" y1="21" y2="16"/>
                                                    <line x1="20" x2="20" y1="12" y2="3"/>
                                                    <line x1="2" x2="6" y1="14" y2="14"/>
                                                    <line x1="10" x2="14" y1="8" y2="8"/>
                                                    <line x1="18" x2="22" y1="16" y2="16"/>
                                                </svg>
                                            </span>
                                            <span id="studio-precise-weight-label"
                                                class="font-medium truncate">Medium</span>
                                        </div>`,
  `<label
                                    class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-1">Quality</label>
                                <div class="relative" id="studio-precise-weight-wrapper">
                                    <button id="studio-precise-weight-btn" type="button"
                                        class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-200 shadow-2xs">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <span class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <line x1="4" x2="4" y1="21" y2="14"/>
                                                    <line x1="4" x2="4" y1="10" y2="3"/>
                                                    <line x1="12" x2="12" y1="21" y2="12"/>
                                                    <line x1="12" x2="12" y1="8" y2="3"/>
                                                    <line x1="20" x2="20" y1="21" y2="16"/>
                                                    <line x1="20" x2="20" y1="12" y2="3"/>
                                                    <line x1="2" x2="6" y1="14" y2="14"/>
                                                    <line x1="10" x2="14" y1="8" y2="8"/>
                                                    <line x1="18" x2="22" y1="16" y2="16"/>
                                                </svg>
                                            </span>
                                            <span id="studio-precise-weight-label"
                                                class="text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100 truncate">Medium</span>
                                        </div>`,
  'Precise Edit Quality Button Section'
);

replaceExact(
  `<label
                                    class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Variations</label>
                                <div class="relative" id="studio-precise-count-wrapper">
                                    <button id="studio-precise-count-btn" type="button"
                                        class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <span class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                    <line x1="12" x2="12" y1="3" y2="21"/>
                                                </svg>
                                            </span>
                                            <span id="studio-precise-count-label"
                                                class="font-medium truncate">1</span>
                                        </div>`,
  `<label
                                    class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-1">Variations</label>
                                <div class="relative" id="studio-precise-count-wrapper">
                                    <button id="studio-precise-count-btn" type="button"
                                        class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-200 shadow-2xs">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <span class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                    <line x1="12" x2="12" y1="3" y2="21"/>
                                                </svg>
                                            </span>
                                            <span id="studio-precise-count-label"
                                                class="text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100 truncate">1</span>
                                        </div>`,
  'Precise Edit Variations Button Section'
);

replaceExact(
  `<button id="studio-apply-precise-edit-btn" type="button" disabled
                                class="w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed">`,
  `<button id="studio-apply-precise-edit-btn" type="button" disabled
                                class="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed">`,
  'Apply Edit Button HTML'
);

replaceAllExact(
  'applyBtn.className = "w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100";',
  'applyBtn.className = "w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100";',
  'applyBtn active state in JS'
);

replaceAllExact(
  'applyBtn.className = "w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed";',
  'applyBtn.className = "w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed";',
  'applyBtn disabled state in JS'
);

replaceAllExact(
  'applyBtn.className = "w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed";',
  'applyBtn.className = "w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed";',
  'applyBtn loading state in JS'
);

console.log('--- 8. Workspace 4: Upscale Image Controls ---');
replaceExact(
  `<div id="ideogram-upscale-controls" class="hidden space-y-4">
                        <div class="space-y-1.5">
                            <div class="text-xs font-medium text-neutral-500 mb-2">Source image</div>

                            <!-- Hidden File Input -->
                            <input type="file" id="upscaleFileInput" accept="image/*" class="hidden">

                            <!-- Proportional Dropzone (Empty State) -->
                            <div id="upscale-upload-zone"
                                class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
                                style="aspect-ratio: 4 / 3; width: 100%;">
                                <span class="text-sm text-neutral-500 dark:text-neutral-400">Upload or choose an image</span>
                                <button type="button" id="upscale-add-btn"
                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shadow-sm cursor-pointer">+ Add</button>
                            </div>

                            <!-- Uploaded Image Preview (Populated State) -->
                            <div id="upscale-preview-wrapper"
                                class="hidden relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:8px_8px] flex items-center justify-center p-2"
                                style="aspect-ratio: 4 / 3; width: 100%;">
                                <img id="upscale-preview-img" src="" alt="Source preview"
                                    class="w-full h-full object-contain rounded-xl">
                                <button type="button" id="upscale-remove-file-btn"
                                    class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs transition cursor-pointer z-20 shadow-md"
                                    title="Change image">✕</button>
                            </div>
                        </div>

                        <!-- Target Scale Selector -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Target Scale</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" data-scale="2" data-upscale-factor="2" id="upscale-scale-2x-btn"
                                    class="upscale-factor-btn btn-upscale-factor py-2 px-3 rounded-xl border border-[#111111] dark:border-white/30 bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition">
                                    <span>2x</span>
                                </button>
                                <button type="button" data-scale="4" data-upscale-factor="4" id="upscale-scale-4x-btn"
                                    class="upscale-factor-btn btn-upscale-factor py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition">
                                    <span>4x</span>
                                </button>
                            </div>
                        </div>

                        <!-- Footer Action Button: Single Solid High-Contrast Button -->
                        <button 
                            type="button" 
                            id="upscaleSubmitBtn" 
                            disabled 
                            class="w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <span id="upscaleSubmitBtnText">Upscale</span>
                        </button>`,
  `<div id="ideogram-upscale-controls" class="hidden space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block mb-2">Source image</label>

                            <!-- Hidden File Input -->
                            <input type="file" id="upscaleFileInput" accept="image/*" class="hidden">

                            <!-- Proportional Dropzone (Empty State) -->
                            <div id="upscale-upload-zone"
                                class="relative w-full aspect-[4/3] rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
                                style="aspect-ratio: 4 / 3; width: 100%;">
                                <span class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400">Upload or choose an image</span>
                                <button type="button" id="upscale-add-btn"
                                    class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[13px] font-medium tracking-[-0.005em] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shadow-sm cursor-pointer">+ Add</button>
                            </div>

                            <!-- Uploaded Image Preview (Populated State) -->
                            <div id="upscale-preview-wrapper"
                                class="hidden relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:8px_8px] flex items-center justify-center p-2"
                                style="aspect-ratio: 4 / 3; width: 100%;">
                                <img id="upscale-preview-img" src="" alt="Source preview"
                                    class="w-full h-full object-contain rounded-xl">
                                <button type="button" id="upscale-remove-file-btn"
                                    class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs transition cursor-pointer z-20 shadow-md"
                                    title="Change image">✕</button>
                            </div>
                        </div>

                        <!-- Target Scale Selector -->
                        <div class="space-y-1.5">
                            <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Target Scale</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" data-scale="2" data-upscale-factor="2" id="upscale-scale-2x-btn"
                                    class="upscale-factor-btn btn-upscale-factor py-2 px-3 rounded-xl border border-[#111111] dark:border-white/30 bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white text-[13px] font-medium tracking-[-0.005em] flex items-center justify-center gap-1.5 cursor-pointer transition">
                                    <span>2x</span>
                                </button>
                                <button type="button" data-scale="4" data-upscale-factor="4" id="upscale-scale-4x-btn"
                                    class="upscale-factor-btn btn-upscale-factor py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400 text-[13px] font-medium tracking-[-0.005em] flex items-center justify-center gap-1.5 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition">
                                    <span>4x</span>
                                </button>
                            </div>
                        </div>

                        <!-- Footer Action Button: Single Solid High-Contrast Button -->
                        <button 
                            type="button" 
                            id="upscaleSubmitBtn" 
                            disabled 
                            class="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <span id="upscaleSubmitBtnText">Upscale</span>
                        </button>`,
  'Upscale Controls Section'
);

replaceAllExact(
  "upscaleSubmitBtn.className = 'w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed shadow-sm';",
  "upscaleSubmitBtn.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed shadow-sm';",
  'upscaleSubmitBtn loading state in JS'
);

replaceAllExact(
  "upscaleSubmitBtn.className = 'w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm';",
  "upscaleSubmitBtn.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm';",
  'upscaleSubmitBtn reset state in JS'
);

console.log('--- 9. In-Progress Skeleton Card in HTML ---');
replaceExact(
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="font-semibold text-slate-700 dark:text-neutral-200">Generate Image</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span id="ideogram-progress-model-pill"
                                            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-sans font-medium">
                                            <span id="ideogram-progress-model-icon"></span>
                                            <span id="ideogram-progress-model-badge">Auto</span>
                                        </span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span id="ideogram-progress-status-text">Generating...</span>
                                        </span>
                                    </div>
                                    <!-- User's Prompt Row -->
                                    <div class="flex items-center gap-2 pt-0.5">
                                        <h3 id="ideogram-progress-prompt-text"
                                            class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug cursor-pointer select-text truncate">
                                        </h3>
                                    </div>`,
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Generate Image</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span id="ideogram-progress-model-pill"
                                            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                                            <span id="ideogram-progress-model-icon"></span>
                                            <span id="ideogram-progress-model-badge">Auto</span>
                                        </span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[12px] font-normal text-neutral-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span id="ideogram-progress-status-text">Generating...</span>
                                        </span>
                                    </div>
                                    <!-- User's Prompt Row -->
                                    <div class="flex items-center gap-2 pt-0.5">
                                        <h3 id="ideogram-progress-prompt-text"
                                            class="text-[14.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white leading-snug cursor-pointer select-text truncate">
                                        </h3>
                                    </div>`,
  'HTML In-Progress Skeleton Card'
);

console.log('--- 10. Placeholder Cards in JS: Remove BG, Upscale, Precise Edit ---');
replaceExact(
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="font-semibold text-slate-700 dark:text-neutral-200">Remove Background</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Processing...</span>
                                        </span>
                                    </div>`,
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Remove Background</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[12px] font-normal text-neutral-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Processing...</span>
                                        </span>
                                    </div>`,
  'Remove BG In-Progress Card in JS'
);

replaceExact(
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="font-semibold text-slate-700 dark:text-neutral-200">Upscale Image</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-sans font-medium">
                                            <span>Scale \${escapeHtml(targetScale)}</span>
                                        </span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Upscaling...</span>
                                        </span>
                                    </div>`,
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Upscale Image</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                                            <span>Scale \${escapeHtml(targetScale)}</span>
                                        </span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[12px] font-normal text-neutral-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Upscaling...</span>
                                        </span>
                                    </div>`,
  'Upscale In-Progress Card in JS'
);

replaceExact(
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="font-semibold text-slate-700 dark:text-neutral-200">Precise Edit</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Applying edit...</span>
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2 pt-0.5">
                                        <h3 class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug cursor-pointer select-text truncate">
                                            \${escapeHtml(instruction)}
                                        </h3>
                                    </div>`,
  `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Precise Edit</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[12px] font-normal text-neutral-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Applying edit...</span>
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2 pt-0.5">
                                        <h3 class="text-[14.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white leading-snug cursor-pointer select-text truncate">
                                            \${escapeHtml(instruction)}
                                        </h3>
                                    </div>`,
  'Precise Edit In-Progress Card in JS'
);

console.log('--- 11. Right Result Canvas (renderStudioAssetsGallery) ---');
// 11.1 Remove BG & Upscale Headers
replaceExact(
  `const headerContentHtml = isRemoveBg ? \`
                    <div class="space-y-1 flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="font-semibold text-slate-700 dark:text-neutral-200">Remove Background</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[11px] text-slate-500 dark:text-neutral-400">\${formattedTime || 'Just now'}</span>
                        </div>
                    </div>
                \` : isUpscale ? \`
                    <div class="space-y-1 flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="font-semibold text-slate-700 dark:text-neutral-200">Upscale Image</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[11px] text-slate-500 dark:text-neutral-400">\${formattedTime || 'Just now'}</span>
                        </div>
                    </div>
                \``,
  `const headerContentHtml = isRemoveBg ? \`
                    <div class="space-y-1 flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Remove Background</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[12px] font-normal text-neutral-400">\${formattedTime || 'Just now'}</span>
                        </div>
                    </div>
                \` : isUpscale ? \`
                    <div class="space-y-1 flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Upscale Image</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[12px] font-normal text-neutral-400">\${formattedTime || 'Just now'}</span>
                        </div>
                    </div>
                \``,
  'Gallery Remove BG & Upscale Headers'
);

// 11.2 Precise Edit Header
replaceExact(
  `\` : isPreciseEdit ? \`
                    <div class="space-y-1 flex-1 min-w-0">
                        <!-- Row 1: Metadata: ONLY Precise Edit • [Relative Time] -->
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="font-semibold text-slate-700 dark:text-neutral-200">Precise Edit</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[11px] text-slate-500 dark:text-neutral-400">\${formattedTime || 'Just now'}</span>
                        </div>
                        <!-- Row 2: Clean User Edit Prompt + Copy button -->
                        <div class="flex items-center gap-2 pt-0.5 group/prompt-row">
                            <h3 class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-text group-prompt-title truncate">
                                \${escapeHtml(editPromptText || displayPrompt || 'Precise Edit Image')}
                            </h3>`,
  `\` : isPreciseEdit ? \`
                    <div class="space-y-1 flex-1 min-w-0">
                        <!-- Row 1: Metadata: ONLY Precise Edit • [Relative Time] -->
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Precise Edit</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[12px] font-normal text-neutral-400">\${formattedTime || 'Just now'}</span>
                        </div>
                        <!-- Row 2: Clean User Edit Prompt + Copy button -->
                        <div class="flex items-center gap-2 pt-0.5 group/prompt-row">
                            <h3 class="text-[14.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-text group-prompt-title truncate">
                                \${escapeHtml(editPromptText || displayPrompt || 'Precise Edit Image')}
                            </h3>`,
  'Gallery Precise Edit Header'
);

// 11.3 Generate Image Header
replaceExact(
  `<!-- Line 1: Metadata Row: Generate Image • [Model Icon] [Model Name] • [Relative Time] -->
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="font-semibold text-slate-700 dark:text-neutral-200">Generate Image</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-sans font-medium">
                                \${getModelIconSvg(group.model || modelObj.id)}
                                <span>\${escapeHtml(modelObj.name)}</span>
                            </span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[11px] text-slate-500 dark:text-neutral-400">\${formattedTime}</span>
                        </div>
                        <!-- Line 2: User Prompt Row: Prompt text in clean dark typography + Copy Prompt icon button -->
                        <div class="flex items-center gap-2 pt-0.5 group/prompt-row">
                            <h3 class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-text group-prompt-title truncate">
                                \${escapeHtml(displayPrompt)}
                            </h3>`,
  `<!-- Line 1: Metadata Row: Generate Image • [Model Icon] [Model Name] • [Relative Time] -->
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                            <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Generate Image</span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                                \${getModelIconSvg(group.model || modelObj.id)}
                                <span>\${escapeHtml(modelObj.name)}</span>
                            </span>
                            <span class="text-slate-300 dark:text-neutral-600">•</span>
                            <span class="text-[12px] font-normal text-neutral-400">\${formattedTime}</span>
                        </div>
                        <!-- Line 2: User Prompt Row: Prompt text in clean dark typography + Copy Prompt icon button -->
                        <div class="flex items-center gap-2 pt-0.5 group/prompt-row">
                            <h3 class="text-[14.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-text group-prompt-title truncate">
                                \${escapeHtml(displayPrompt)}
                            </h3>`,
  'Gallery Generate Image Header'
);

// 11.4 Aspect Ratio Pill on Variation Image Cards
replaceExact(
  `<span class="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white pointer-events-none">
                                \${isVectorCard ? 'SVG' : (isRemoveBg ? 'PNG' : escapeHtml(group.aspectRatio))}
                            </span>`,
  `<span class="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11.5px] font-semibold tracking-wide text-white pointer-events-none font-['Plus_Jakarta_Sans',sans-serif]">
                                \${isVectorCard ? 'SVG' : (isRemoveBg ? 'PNG' : escapeHtml(group.aspectRatio))}
                            </span>`,
  'Aspect Ratio Pill on Variation Cards'
);

console.log('Writing updated index.html...');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully written index.html! New length:', html.length, 'Original:', originalLength);

