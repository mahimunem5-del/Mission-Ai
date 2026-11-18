const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const originalLength = html.length;

function replaceExact(searchStr, replaceStr, label) {
  if (!html.includes(searchStr)) {
    console.error(`ERROR: [${label}] search string not found!`);
    console.error('Search was:\n', searchStr);
    process.exit(1);
  }
  html = html.replace(searchStr, replaceStr);
  console.log(`[PASS] Replaced ${label}`);
}

// 1. Google Fonts Link (add 800 weight for Plus Jakarta Sans)
const oldFontLink = 'Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
const newFontLink = 'Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
html = html.replaceAll(oldFontLink, newFontLink);
console.log('[PASS] Updated Google Fonts links with 800 weight');

// 2. Main Hero Headline
const oldHero = `<h1 class="flex items-baseline justify-center flex-wrap leading-tight">
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">Imagine it.</span>
                            <span class="font-['Instrument_Serif',serif] italic font-normal text-[34px] sm:text-[38px] tracking-[-0.01em] bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent ml-1.5">Craft it.</span>
                        </h1>`;

const newHero = `<h1 class="flex items-baseline justify-center flex-wrap leading-tight">
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-bold tracking-[-0.03em] text-neutral-900 dark:text-white">Imagine it.</span>
                            <span class="font-['Plus_Jakarta_Sans',sans-serif] text-[30px] sm:text-[34px] font-extrabold tracking-[-0.035em] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent ml-2">Craft it.</span>
                        </h1>`;
replaceExact(oldHero, newHero, 'Main Hero Headline');

// 3. Workspace base container font-family
const oldWorkspaceBase = `<div id="image-studio-workspace"
            class="hidden flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden min-w-0 bg-white dark:bg-[#191919] text-slate-900 dark:text-slate-100 select-none relative font-sans">`;
const newWorkspaceBase = `<div id="image-studio-workspace"
            class="hidden flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden min-w-0 bg-white dark:bg-[#191919] text-slate-900 dark:text-slate-100 select-none relative font-['Plus_Jakarta_Sans',sans-serif]">`;
replaceExact(oldWorkspaceBase, newWorkspaceBase, 'Workspace Base Container font-family');

// Left and Right panel explicit font-family
const oldLeftPanel = `<aside id="ideogram-left-panel"
                class="w-full md:w-[380px] shrink-0 h-full flex flex-col bg-white dark:bg-[#191919] z-20 overflow-hidden"`;
const newLeftPanel = `<aside id="ideogram-left-panel"
                class="w-full md:w-[380px] shrink-0 h-full flex flex-col bg-white dark:bg-[#191919] z-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"`;
replaceExact(oldLeftPanel, newLeftPanel, 'Left Panel font-family');

const oldRightPanel = `<main id="ideogram-right-panel"
                class="flex-1 w-full h-full min-w-0 flex flex-col bg-white dark:bg-[#191919] overflow-hidden relative">`;
const newRightPanel = `<main id="ideogram-right-panel"
                class="flex-1 w-full h-full min-w-0 flex flex-col bg-white dark:bg-[#191919] overflow-hidden relative font-['Plus_Jakarta_Sans',sans-serif]">`;
replaceExact(oldRightPanel, newRightPanel, 'Right Panel font-family');

// 4. Left Panel Header & Action Link
const oldHeaderGen = `<div id="ideogram-header-generate"
                        class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white relative">
                        <button type="button" id="ideogram-back-to-home-btn"
                            class="p-1 -ml-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1"
                            title="Back to Image Home">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        <!-- Ideogram-Style Breadcrumb App Switcher Dropdown -->
                        <div class="relative" id="workspace-tool-switcher-wrapper">
                            <button type="button" id="workspace-tool-switcher-btn"
                                class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800/80 px-2 py-1.5 rounded-lg transition cursor-pointer select-none">
                                <span
                                    class="text-neutral-400 dark:text-neutral-500 font-normal hidden sm:inline">Creative
                                    Workflows /</span>
                                <span id="workspace-active-tool-label">Generate Image</span>
                                <svg class="w-3.5 h-3.5 text-neutral-400 transition-transform duration-200"
                                    id="workspace-tool-switcher-chevron" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>`;

const newHeaderGen = `<div id="ideogram-header-generate"
                        class="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white relative">
                        <button type="button" id="ideogram-back-to-home-btn"
                            class="p-1 -ml-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1"
                            title="Back to Image Home">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        <!-- Ideogram-Style Breadcrumb App Switcher Dropdown -->
                        <div class="relative" id="workspace-tool-switcher-wrapper">
                            <button type="button" id="workspace-tool-switcher-btn"
                                class="flex items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 px-2 py-1.5 rounded-lg transition cursor-pointer select-none">
                                <span
                                    class="text-neutral-400 dark:text-neutral-500 font-normal hidden sm:inline text-xs sm:text-[13px]">Creative
                                    Workflows /</span>
                                <span id="workspace-active-tool-label">Generate Image</span>
                                <svg class="w-3.5 h-3.5 text-neutral-400 transition-transform duration-200"
                                    id="workspace-tool-switcher-chevron" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>`;
replaceExact(oldHeaderGen, newHeaderGen, 'Header Generate tool switcher');

const oldHeaderEdit = `<div id="ideogram-header-edit"
                        class="hidden items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        <button type="button" id="ideogram-edit-back-btn"
                            class="p-1 -ml-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                            title="Back to Generate Image">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <span id="ideogram-header-edit-title">Precise Edit</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" id="ideogram-reset-composer-btn"
                            class="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Clear all">
                            Clear all
                        </button>
                    </div>`;

const newHeaderEdit = `<div id="ideogram-header-edit"
                        class="hidden items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white">
                        <button type="button" id="ideogram-edit-back-btn"
                            class="p-1 -ml-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                            title="Back to Generate Image">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <span id="ideogram-header-edit-title">Precise Edit</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" id="ideogram-reset-composer-btn"
                            class="text-[12.5px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                            title="Clear all">
                            Clear all
                        </button>
                    </div>`;
replaceExact(oldHeaderEdit, newHeaderEdit, 'Header Edit & Clear All');

// 5. Workspace 1: Generate Image Controls
// 5.1 Model Label and Button
const oldModelSec = `<label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Model</label>
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
                                    </div>`;

const newModelSec = `<label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Model</label>
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
                                    </div>`;
replaceExact(oldModelSec, newModelSec, 'Generate Model Section');

// 5.2 Reference Images label & counter
const oldRefSec = `<div class="flex items-center justify-between text-xs">
                                <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Reference
                                    images</label>
                                <span id="ideogram-ref-status" class="text-[11px] text-slate-400 font-mono">0/10</span>
                            </div>`;

const newRefSec = `<div class="flex items-center justify-between">
                                <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Reference images</label>
                                <span id="ideogram-ref-status" class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">0/10</span>
                            </div>`;
replaceExact(oldRefSec, newRefSec, 'Generate Reference Images Section');

// 5.3 Style Presets label & Pills
const oldStyleSec = `<div class="space-y-1.5">
                            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Style Presets</label>
                            <div id="ideogram-style-tags" class="flex flex-wrap gap-1.5">
                                <button type="button" data-style="Auto"
                                    class="ideogram-style-pill active px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-2xs transition-all cursor-pointer">
                                    Auto
                                </button>
                                <button type="button" data-style="General"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    General
                                </button>
                                <button type="button" data-style="Realistic"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Realistic
                                </button>
                                <button type="button" data-style="Design"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Design
                                </button>
                                <button type="button" data-style="3D Render"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    3D Render
                                </button>
                                <button type="button" data-style="Anime"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Anime
                                </button>
                                <button type="button" data-style="Cinematic"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Cinematic
                                </button>
                                <button type="button" data-style="Illustration"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Illustration
                                </button>
                                <button type="button" data-style="Typography"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Typography
                                </button>
                            </div>
                        </div>`;

const newStyleSec = `<div class="space-y-1.5">
                            <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Style Presets</label>
                            <div id="ideogram-style-tags" class="flex flex-wrap gap-1.5">
                                <button type="button" data-style="Auto"
                                    class="ideogram-style-pill active px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white shadow-2xs transition-all cursor-pointer">
                                    Auto
                                </button>
                                <button type="button" data-style="General"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    General
                                </button>
                                <button type="button" data-style="Realistic"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Realistic
                                </button>
                                <button type="button" data-style="Design"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Design
                                </button>
                                <button type="button" data-style="3D Render"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    3D Render
                                </button>
                                <button type="button" data-style="Anime"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Anime
                                </button>
                                <button type="button" data-style="Cinematic"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Cinematic
                                </button>
                                <button type="button" data-style="Illustration"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Illustration
                                </button>
                                <button type="button" data-style="Typography"
                                    class="ideogram-style-pill px-2.5 py-1 rounded-lg text-[13px] font-medium tracking-[-0.005em] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer">
                                    Typography
                                </button>
                            </div>
                        </div>`;
replaceExact(oldStyleSec, newStyleSec, 'Generate Style Presets Section');

// 5.4 Prompt Label & Textarea
const oldPromptSec = `<!-- 4. PROMPT INPUT (EXPANDED STUDIO COMPOSER) -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Prompt</label>
                            <div id="studio-composer-box"
                                class="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 relative transition-all focus-within:border-slate-400 dark:focus-within:border-white/20 focus-within:ring-1 focus-within:ring-blue-500/20">
                                
                                <!-- Optional Source / Reference Image Attachment Chip (Ideogram Remix flow) -->
                                <div id="studio-ref-chip"
                                    class="hidden items-center gap-2 mb-2 p-1.5 pr-2.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 w-fit max-w-full">
                                    <img id="studio-ref-thumb" src="" alt="Reference thumbnail"
                                        class="w-7 h-7 rounded-lg object-cover shrink-0 border border-black/10">
                                    <div class="flex flex-col min-w-0 pr-1">
                                        <span class="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Remix</span>
                                        <span id="studio-ref-name"
                                            class="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">image.png</span>
                                    </div>
                                    <button type="button" id="studio-ref-remove-btn"
                                        class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                                        title="Remove attached reference">✕</button>
                                </div>

                                <!-- Prompt Textarea -->
                                <textarea id="studio-prompt-input" rows="10"
                                    placeholder="Describe the image you want to create..."
                                    class="w-full min-h-[240px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-[13.5px] bg-transparent leading-relaxed"></textarea>`;

const newPromptSec = `<!-- 4. PROMPT INPUT (EXPANDED STUDIO COMPOSER) -->
                        <div class="space-y-1.5">
                            <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">Prompt</label>
                            <div id="studio-composer-box"
                                class="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 relative transition-all focus-within:border-slate-400 dark:focus-within:border-white/20 focus-within:ring-1 focus-within:ring-blue-500/20">
                                
                                <!-- Optional Source / Reference Image Attachment Chip (Ideogram Remix flow) -->
                                <div id="studio-ref-chip"
                                    class="hidden items-center gap-2 mb-2 p-1.5 pr-2.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 w-fit max-w-full">
                                    <img id="studio-ref-thumb" src="" alt="Reference thumbnail"
                                        class="w-7 h-7 rounded-lg object-cover shrink-0 border border-black/10">
                                    <div class="flex flex-col min-w-0 pr-1">
                                        <span class="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Remix</span>
                                        <span id="studio-ref-name"
                                            class="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">image.png</span>
                                    </div>
                                    <button type="button" id="studio-ref-remove-btn"
                                        class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                                        title="Remove attached reference">✕</button>
                                </div>

                                <!-- Prompt Textarea -->
                                <textarea id="studio-prompt-input" rows="10"
                                    placeholder="Describe the image you want to create..."
                                    class="w-full min-h-[240px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent"></textarea>`;
replaceExact(oldPromptSec, newPromptSec, 'Generate Prompt Input Section');

// 5.5 Ratio Button & Label and Count Button & Label
const oldRatioSec = `<button id="studio-ratio-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span id="studio-ratio-icon"
                                            class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <div class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0"></div>
                                        </span>
                                        <span id="studio-ratio-label" class="font-medium truncate">1:1</span>
                                    </div>`;

const newRatioSec = `<button id="studio-ratio-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span id="studio-ratio-icon"
                                            class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <div class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0"></div>
                                        </span>
                                        <span id="studio-ratio-label" class="text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100 truncate">1:1</span>
                                    </div>`;
replaceExact(oldRatioSec, newRatioSec, 'Generate Ratio Button Section');

const oldCountSec = `<button id="studio-count-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="w-4 h-4 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                <line x1="12" x2="12" y1="3" y2="21"/>
                                            </svg>
                                        </span>
                                        <span id="studio-count-label" class="font-medium truncate">1</span>
                                    </div>`;

const newCountSec = `<button id="studio-count-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="w-4 h-4 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                <line x1="12" x2="12" y1="3" y2="21"/>
                                            </svg>
                                        </span>
                                        <span id="studio-count-label" class="text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100 truncate">1</span>
                                    </div>`;
replaceExact(oldCountSec, newCountSec, 'Generate Count Button Section');

// 5.6 Advanced settings label
const oldAdvToggle = `<button type="button" id="ideogram-advanced-toggle"
                                class="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group">
                                <span class="text-xs font-semibold">Advanced settings</span>`;
const newAdvToggle = `<button type="button" id="ideogram-advanced-toggle"
                                class="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group">
                                <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Advanced settings</span>`;
replaceExact(oldAdvToggle, newAdvToggle, 'Generate Advanced Settings Toggle');

// 5.7 Generate Button
const oldGenBtn = `<button id="studio-generate-btn" type="button"
                                class="w-full h-10 py-2 px-4 rounded-lg bg-[#111111] hover:bg-[#262626] active:bg-black text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E5E7EB] dark:disabled:bg-neutral-800 disabled:text-[#9CA3AF] dark:disabled:text-neutral-500 disabled:cursor-not-allowed">`;
const newGenBtn = `<button id="studio-generate-btn" type="button"
                                class="w-full h-10 py-2 px-4 rounded-lg bg-[#111111] hover:bg-[#262626] active:bg-black text-white text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#E5E7EB] dark:disabled:bg-neutral-800 disabled:text-[#9CA3AF] dark:disabled:text-neutral-500 disabled:cursor-not-allowed">`;
replaceExact(oldGenBtn, newGenBtn, 'Generate Button CTA');

// 6. Workspace 2: Remove Background Controls
const oldRemoveBgControls = `<div id="ideogram-remove-bg-controls" class="hidden space-y-4">
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
                    </div>`;

const newRemoveBgControls = `<div id="ideogram-remove-bg-controls" class="hidden space-y-4">
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
                    </div>`;
replaceExact(oldRemoveBgControls, newRemoveBgControls, 'Remove Background Controls');

// Update JS for Remove Bg button dynamic states
const oldRmbState1 = "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100';";
const newRmbState1 = "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100';";
html = html.replaceAll(oldRmbState1, newRmbState1);

const oldRmbState2 = "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed';";
const newRmbState2 = "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed';";
html = html.replaceAll(oldRmbState2, newRmbState2);

const oldRmbState3 = "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed';";
const newRmbState3 = "btnDoRemoveBg.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed';";
html = html.replaceAll(oldRmbState3, newRmbState3);
console.log('[PASS] Updated Remove Bg JS button states');

// 7. Workspace 3: Precise Edit Controls
// 7.1 Source image label & dropzone
const oldPreciseDropzone = `<div class="space-y-1.5">
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
                            </div>`;

const newPreciseDropzone = `<div class="space-y-1.5">
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
                            </div>`;
replaceExact(oldPreciseDropzone, newPreciseDropzone, 'Precise Edit Source Image Dropzone');

// 7.2 What should change? and Prompt textarea
const oldPrecisePrompt = `<div class="space-y-1.5">
                            <label for="studio-precise-edit-input"
                                class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">What should
                                change?</label>
                            <div
                                class="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 relative transition-all focus-within:border-slate-400 dark:focus-within:border-white/20 focus-within:ring-1 focus-within:ring-blue-500/20">
                                <textarea id="studio-precise-edit-input" rows="4"
                                    placeholder="Describe the change you want..."
                                    class="w-full min-h-[110px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-[13.5px] bg-transparent leading-relaxed"></textarea>
                            </div>`;

const newPrecisePrompt = `<div class="space-y-1.5">
                            <label for="studio-precise-edit-input"
                                class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200 block">What should change?</label>
                            <div
                                class="w-full bg-white dark:bg-[#161f2b] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-3 relative transition-all focus-within:border-slate-400 dark:focus-within:border-white/20 focus-within:ring-1 focus-within:ring-blue-500/20">
                                <textarea id="studio-precise-edit-input" rows="4"
                                    placeholder="Describe the change you want..."
                                    class="w-full min-h-[110px] resize-none border-none outline-none focus:outline-none focus:ring-0 text-[13.5px] font-normal leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent"></textarea>
                            </div>`;
replaceExact(oldPrecisePrompt, newPrecisePrompt, 'Precise Edit Prompt Section');

// 7.3 Reference images label & counter
const oldPreciseRef = `<div class="flex items-center justify-between text-xs">
                                <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Reference
                                    images</label>
                                <span id="studio-precise-edit-ref-status"
                                    class="text-[11px] text-slate-400 font-mono">0/10</span>
                            </div>`;

const newPreciseRef = `<div class="flex items-center justify-between">
                                <label class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Reference images</label>
                                <span id="studio-precise-edit-ref-status"
                                    class="text-[12.5px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">0/10</span>
                            </div>`;
replaceExact(oldPreciseRef, newPreciseRef, 'Precise Edit Reference Images Section');

// 7.4 Quality and Variations labels & buttons
const oldPreciseQuality = `<label
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
                                        </div>`;

const newPreciseQuality = `<label
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
                                        </div>`;
replaceExact(oldPreciseQuality, newPreciseQuality, 'Precise Edit Quality Button Section');

const oldPreciseVar = `<label
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
                                        </div>`;

const newPreciseVar = `<label
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
                                        </div>`;
replaceExact(oldPreciseVar, newPreciseVar, 'Precise Edit Variations Button Section');

// 7.5 Apply edit CTA button & JS states
const oldApplyBtnHtml = `<button id="studio-apply-precise-edit-btn" type="button" disabled
                                class="w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed">`;
const newApplyBtnHtml = `<button id="studio-apply-precise-edit-btn" type="button" disabled
                                class="w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed">`;
replaceExact(oldApplyBtnHtml, newApplyBtnHtml, 'Apply Edit Button HTML');

const oldApplyState1 = 'applyBtn.className = "w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100";';
const newApplyState1 = 'applyBtn.className = "w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100";';
html = html.replaceAll(oldApplyState1, newApplyState1);

const oldApplyState2 = 'applyBtn.className = "w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed";';
const newApplyState2 = 'applyBtn.className = "w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed";';
html = html.replaceAll(oldApplyState2, newApplyState2);

const oldApplyState3 = 'applyBtn.className = "w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed";';
const newApplyState3 = 'applyBtn.className = "w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 shadow-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed";';
html = html.replaceAll(oldApplyState3, newApplyState3);
console.log('[PASS] Updated Apply Edit JS button states');

// 8. Workspace 4: Upscale Image Controls
const oldUpscaleControls = `<div id="ideogram-upscale-controls" class="hidden space-y-4">
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
                        </button>`;

const newUpscaleControls = `<div id="ideogram-upscale-controls" class="hidden space-y-4">
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
                        </button>`;
replaceExact(oldUpscaleControls, newUpscaleControls, 'Upscale Controls Section');

// Update JS for Upscale button dynamic states
const oldUpscaleState1 = "upscaleSubmitBtn.className = 'w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed shadow-sm';";
const newUpscaleState1 = "upscaleSubmitBtn.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 opacity-80 cursor-not-allowed shadow-sm';";
html = html.replaceAll(oldUpscaleState1, newUpscaleState1);

const oldUpscaleState2 = "upscaleSubmitBtn.className = 'w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm';";
const newUpscaleState2 = "upscaleSubmitBtn.className = 'w-full py-3 px-4 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all flex items-center justify-center gap-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm';";
html = html.replaceAll(oldUpscaleState2, newUpscaleState2);
console.log('[PASS] Updated Upscale JS button states');

// 9. In-Progress Skeleton Card in HTML (Line 6922)
const oldInProgressHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
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
                                    </div>`;

const newInProgressHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
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
                                    </div>`;
replaceExact(oldInProgressHtml, newInProgressHtml, 'HTML In-Progress Skeleton Card');

// 10. Placeholder Cards in JS: Remove BG, Upscale, Precise Edit
// 10.1 Remove BG Placeholder
const oldRmbPlHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="font-semibold text-slate-700 dark:text-neutral-200">Remove Background</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Processing...</span>
                                        </span>
                                    </div>`;
const newRmbPlHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                                        <span class="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-200">Remove Background</span>
                                        <span class="text-slate-300 dark:text-neutral-600">•</span>
                                        <span class="inline-flex items-center gap-1.5 text-[12px] font-normal text-neutral-400">
                                            <span class="relative flex h-2 w-2">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                                            </span>
                                            <span>Processing...</span>
                                        </span>
                                    </div>`;
replaceExact(oldRmbPlHtml, newRmbPlHtml, 'Remove BG In-Progress Card in JS');

// 10.2 Upscale Placeholder
const oldUpscalePlHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
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
                                    </div>`;
const newUpscalePlHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
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
                                    </div>`;
replaceExact(oldUpscalePlHtml, newUpscalePlHtml, 'Upscale In-Progress Card in JS');

// 10.3 Precise Edit Placeholder
const oldPrecisePlHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
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
                                    </div>`;
const newPrecisePlHtml = `<div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
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
                                    </div>`;
replaceExact(oldPrecisePlHtml, newPrecisePlHtml, 'Precise Edit In-Progress Card in JS');

// 11. Right Result Canvas (renderStudioAssetsGallery)
// 11.1 Remove BG & Upscale Headers
const oldGalleryRemoveBg = `const headerContentHtml = isRemoveBg ? \`
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
                \``;

const newGalleryRemoveBg = `const headerContentHtml = isRemoveBg ? \`
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
                \``;
replaceExact(oldGalleryRemoveBg, newGalleryRemoveBg, 'Gallery Remove BG & Upscale Headers');

// 11.2 Precise Edit Header
const oldGalleryPrecise = `\` : isPreciseEdit ? \`
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
                            </h3>`;

const newGalleryPrecise = `\` : isPreciseEdit ? \`
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
                            </h3>`;
replaceExact(oldGalleryPrecise, newGalleryPrecise, 'Gallery Precise Edit Header');

// 11.3 Generate Image Header
const oldGalleryGen = `<!-- Line 1: Metadata Row: Generate Image • [Model Icon] [Model Name] • [Relative Time] -->
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
                            </h3>`;

const newGalleryGen = `<!-- Line 1: Metadata Row: Generate Image • [Model Icon] [Model Name] • [Relative Time] -->
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
                            </h3>`;
replaceExact(oldGalleryGen, newGalleryGen, 'Gallery Generate Image Header');

// 11.4 Aspect Ratio Pill on Variation Image Cards
const oldAspectPill = `<span class="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white pointer-events-none">
                                \${isVectorCard ? 'SVG' : (isRemoveBg ? 'PNG' : escapeHtml(group.aspectRatio))}
                            </span>`;
const newAspectPill = `<span class="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11.5px] font-semibold tracking-wide text-white pointer-events-none font-['Plus_Jakarta_Sans',sans-serif]">
                                \${isVectorCard ? 'SVG' : (isRemoveBg ? 'PNG' : escapeHtml(group.aspectRatio))}
                            </span>`;
replaceExact(oldAspectPill, newAspectPill, 'Aspect Ratio Pill on Variation Cards');

console.log('Writing updated index.html...');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully written index.html! New length:', html.length, 'Original:', originalLength);
