const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('index.html', 'utf8');

// ============================================================================
// 1. IMAGE STUDIO HERO PROMPT BOX (Aspect Ratio & Model Selector + Popovers)
// ============================================================================
const heroTargetStart = '<!-- Bottom-Left Minimal Icons (Ideogram style: Aspect Ratio & Model Selection) -->';
const heroTargetEnd = '<!-- Bottom-Right Circular Send Button -->';

const startIndex = html.indexOf(heroTargetStart);
const endIndex = html.indexOf(heroTargetEnd);

if (startIndex === -1 || endIndex === -1) {
    throw new Error('Hero section boundaries not found');
}

const currentHeroBlock = html.substring(startIndex, endIndex);

// New Hero Block
const newHeroBlock = `<!-- Bottom-Left Minimal Controls (Bordered Aspect Ratio Pill + Plain Model Selector) -->
                            <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                <!-- 1. Aspect Ratio Trigger & Popover (Bordered Box, default 1:1) -->
                                <div class="relative z-50" id="image-home-ratio-wrapper">
                                    <button type="button" id="image-home-ratio-btn"
                                        class="h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-neutral-50 dark:hover:bg-white/[0.08] text-neutral-800 dark:text-neutral-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                                        title="Aspect Ratio: 1:1">
                                        <span id="image-home-ratio-icon"
                                            class="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-neutral-700 dark:text-neutral-300">
                                            <div class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0"></div>
                                        </span>
                                        <span id="image-home-ratio-label" class="font-medium">1:1</span>
                                        <svg class="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </button>

                                    <!-- Aspect Ratio Popover (Clean Downward Floating Dropdown, No Uppercase Header) -->
                                    <div id="image-home-ratio-popover"
                                        class="hidden absolute left-0 top-full mt-2 w-60 bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200 max-h-64 overflow-y-auto ideogram-custom-scroll">
                                        <div class="space-y-0.5">
                                            <!-- 1. Auto -->
                                            <button type="button" data-ratio="auto" data-label="Auto"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24"
                                                            fill="none" stroke="currentColor" stroke-width="2">
                                                            <path d="m16 3 4 4-4 4" />
                                                            <path d="M20 7H4" />
                                                            <path d="m8 21-4-4 4-4" />
                                                            <path d="M4 17h16" />
                                                        </svg>
                                                    </div>
                                                    <span class="truncate">Auto</span>
                                                </div>
                                                <svg class="image-home-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 2. 1:1 - DEFAULT -->
                                            <button type="button" data-ratio="1:1" data-label="1:1"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 font-semibold text-slate-900 dark:text-white text-xs cursor-pointer transition-colors text-left group">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <div
                                                            class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                        </div>
                                                    </div>
                                                    <span class="truncate">1:1</span>
                                                </div>
                                                <svg class="image-home-ratio-check w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 3. 2:3 -->
                                            <button type="button" data-ratio="2:3" data-label="2:3"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <div
                                                            class="studio-ratio-wireframe w-[11px] h-[16px] border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                        </div>
                                                    </div>
                                                    <span class="truncate">2:3</span>
                                                </div>
                                                <svg class="image-home-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 4. 3:4 -->
                                            <button type="button" data-ratio="3:4" data-label="3:4"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <div
                                                            class="studio-ratio-wireframe w-[12px] h-[16px] border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                        </div>
                                                    </div>
                                                    <span class="truncate">3:4</span>
                                                </div>
                                                <svg class="image-home-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 5. 9:16 -->
                                            <button type="button" data-ratio="9:16" data-label="9:16"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <div
                                                            class="studio-ratio-wireframe w-[9px] h-[16px] border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                        </div>
                                                    </div>
                                                    <span class="truncate">9:16</span>
                                                </div>
                                                <svg class="image-home-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 6. 3:2 -->
                                            <button type="button" data-ratio="3:2" data-label="3:2"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <div
                                                            class="studio-ratio-wireframe w-[16px] h-[11px] border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                        </div>
                                                    </div>
                                                    <span class="truncate">3:2</span>
                                                </div>
                                                <svg class="image-home-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 7. 4:3 -->
                                            <button type="button" data-ratio="4:3" data-label="4:3"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <div
                                                            class="studio-ratio-wireframe w-[16px] h-[12px] border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                        </div>
                                                    </div>
                                                    <span class="truncate">4:3</span>
                                                </div>
                                                <svg class="image-home-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 8. 16:9 -->
                                            <button type="button" data-ratio="16:9" data-label="16:9"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <div
                                                            class="studio-ratio-wireframe w-[16px] h-[9px] border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                        </div>
                                                    </div>
                                                    <span class="truncate">16:9</span>
                                                </div>
                                                <svg class="image-home-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- 2. Model Selection Trigger & Popover (Plain, borderless) -->
                                <div class="relative z-50" id="image-home-model-wrapper">
                                    <button type="button" id="image-home-model-btn"
                                        class="h-8 px-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                                        title="Model: Auto">
                                        <span id="image-home-model-icon"
                                            class="hidden w-3.5 h-3.5 items-center justify-center shrink-0">
                                        </span>
                                        <span id="image-home-model-label">Auto</span>
                                        <svg class="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </button>

                                    <!-- Model Selection Popover (Clean Downward Floating Dropdown, No Uppercase Header) -->
                                    <div id="image-home-model-popover"
                                        class="hidden absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200 max-h-72 overflow-y-auto ideogram-custom-scroll">
                                        <div class="space-y-0.5">
                                            <!-- Auto Option -->
                                            <button type="button" data-model="auto" data-name="Auto"
                                                class="image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-white/10 font-semibold text-slate-900 dark:text-white cursor-pointer transition-colors group text-left">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <svg class="w-4 h-4 shrink-0 text-slate-900 dark:text-white"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2">
                                                        <rect width="14" height="14" x="5" y="5" rx="2" />
                                                        <path d="M9 9h6v6H9z" />
                                                        <path
                                                            d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4M19 9h4m-4 6h4" />
                                                    </svg>
                                                    <span
                                                        class="image-home-model-name text-xs font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white truncate">Auto</span>
                                                </div>
                                                <svg class="image-home-model-check w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 1. GPT Image 2.5 Sunburst -->
                                            <button type="button" data-model="openai/gpt-image-2.5-sunburst"
                                                data-name="GPT Image 2.5 Sunburst"
                                                class="image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <svg class="w-4 h-4 shrink-0 text-zinc-900 dark:text-white"
                                                        viewBox="60 60 392 392" fill="currentColor">
                                                        <path fill-rule="nonzero"
                                                            d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z" />
                                                    </svg>
                                                    <span
                                                        class="image-home-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">GPT
                                                        Image 2.5 Sunburst</span>
                                                </div>
                                                <svg class="image-home-model-check hidden w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 2. Nano Banana Pro -->
                                            <button type="button" data-model="google/gemini-3-pro-image"
                                                data-name="Nano Banana Pro"
                                                class="image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                                        <defs>
                                                            <linearGradient id="gemini-sparkle-home-pro" x1="85%"
                                                                y1="15%" x2="15%" y2="85%">
                                                                <stop offset="0%" stop-color="#38BDF8" />
                                                                <stop offset="50%" stop-color="#60A5FA" />
                                                                <stop offset="100%" stop-color="#2563EB" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path
                                                            d="M12 2C12 7.5 7.5 12 2 12c5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z"
                                                            fill="#2563EB"
                                                            style="fill:#2563EB;fill:url(#gemini-sparkle-home-pro);" />
                                                    </svg>
                                                    <span
                                                        class="image-home-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Nano
                                                        Banana Pro</span>
                                                </div>
                                                <svg class="image-home-model-check hidden w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 3. FLUX.2 Pro -->
                                            <button type="button" data-model="black-forest-labs/flux.2-pro"
                                                data-name="FLUX.2 Pro"
                                                class="image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <svg class="w-4 h-4 shrink-0 text-zinc-900 dark:text-white"
                                                        viewBox="0 0 24 24" fill="currentColor">
                                                        <path
                                                            d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.2l7.5 4.1L12 12.4 4.5 8.3 12 4.2zM4 9.8l7 3.8v7.6l-7-3.8V9.8zm16 7.6l-7 3.8v-7.6l7-3.8v7.6z" />
                                                    </svg>
                                                    <span
                                                        class="image-home-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">FLUX.2
                                                        Pro</span>
                                                </div>
                                                <svg class="image-home-model-check hidden w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 4. Seedream 5.0 Pro -->
                                            <button type="button" data-model="bytedance-seed/seedream-5.0-pro"
                                                data-name="Seedream 5.0 Pro"
                                                class="image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                                                        <rect x="2.5" y="6" width="3.2" height="12" rx="1.6"
                                                            fill="#3B82F6" />
                                                        <rect x="7.8" y="3" width="3.2" height="18" rx="1.6"
                                                            fill="#06B6D4" />
                                                        <rect x="13.1" y="6" width="3.2" height="15" rx="1.6"
                                                            fill="#3B82F6" />
                                                        <rect x="18.4" y="8" width="3.2" height="10" rx="1.6"
                                                            fill="#06B6D4" />
                                                    </svg>
                                                    <span
                                                        class="image-home-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Seedream
                                                        5.0 Pro</span>
                                                </div>
                                                <svg class="image-home-model-check hidden w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 5. Meta: Muse Image -->
                                            <button type="button" data-model="meta/muse-image"
                                                data-name="Meta: Muse Image"
                                                class="image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#0081FB">
                                                        <path
                                                            d="M16.995 3C14.636 3 12.748 4.316 12 5.864 11.252 4.316 9.364 3 7.005 3 3.136 3 0 6.136 0 10.005c0 3.869 3.136 7.005 7.005 7.005 2.359 0 4.247-1.316 4.995-2.864.748 1.548 2.636 2.864 4.995 2.864 3.869 0 7.005-3.136 7.005-7.005C24 6.136 20.864 3 16.995 3zm0 11.96c-1.898 0-3.568-1.074-4.39-2.73a.873.873 0 0 0-1.21 0c-.822 1.656-2.492 2.73-4.39 2.73-2.732 0-4.955-2.223-4.955-4.955s2.223-4.955 4.955-4.955c1.898 0 3.568 1.074 4.39 2.73a.873.873 0 0 0 1.21 0c.822-1.656 2.492-2.73 4.39-2.73 2.732 0 4.955 2.223 4.955 4.955s-2.223 4.955-4.955 4.955z" />
                                                    </svg>
                                                    <span
                                                        class="image-home-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Meta:
                                                        Muse Image</span>
                                                </div>
                                                <svg class="image-home-model-check hidden w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 6. Nano Banana 2 -->
                                            <button type="button" data-model="google/gemini-3.1-flash-image-preview"
                                                data-name="Nano Banana 2"
                                                class="image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left">
                                                <div class="flex items-center gap-2.5 min-w-0">
                                                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                                        <defs>
                                                            <linearGradient id="gemini-sparkle-home-flash" x1="85%"
                                                                y1="15%" x2="15%" y2="85%">
                                                                <stop offset="0%" stop-color="#38BDF8" />
                                                                <stop offset="50%" stop-color="#60A5FA" />
                                                                <stop offset="100%" stop-color="#2563EB" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path
                                                            d="M12 2C12 7.5 7.5 12 2 12c5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z"
                                                            fill="#2563EB"
                                                            style="fill:#2563EB;fill:url(#gemini-sparkle-home-flash);" />
                                                    </svg>
                                                    <span
                                                        class="image-home-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Nano
                                                        Banana 2</span>
                                                </div>
                                                <svg class="image-home-model-check hidden w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
`;

html = html.substring(0, startIndex) + newHeroBlock + html.substring(endIndex);

// ============================================================================
// 2. GENERATE IMAGE PANEL: studio-model-dropdown (remove header & clean names)
// ============================================================================
// Header removal
const studioModelHeader = `<div
                                        class="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase px-2.5 py-1.5 border-b border-slate-100 dark:border-white/10">
                                        Generation Model</div>`;
html = html.replace(studioModelHeader, '');

// Clean padding on studio-model-dropdown
html = html.replace(
    'id="studio-model-dropdown"\n                                    class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1.5',
    'id="studio-model-dropdown"\n                                    class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1'
);

// Clean Nano Banana Pro in studio-model-dropdown
html = html.replace(
    'data-name="Nano Banana Pro (Gemini 3 Pro Image)"',
    'data-name="Nano Banana Pro"'
);
html = html.replace(
    `<span
                                                    class="studio-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Nano
                                                    Banana Pro (Gemini 3 Pro Image)</span>`,
    `<span
                                                    class="studio-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Nano Banana Pro</span>`
);

// Clean Nano Banana 2 in studio-model-dropdown
html = html.replace(
    'data-name="Nano Banana 2 (Gemini 3.1 Flash Image)"',
    'data-name="Nano Banana 2"'
);
html = html.replace(
    `<span
                                                    class="studio-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Nano
                                                    Banana 2 (Gemini 3.1 Flash Image)</span>`,
    `<span
                                                    class="studio-model-name text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white truncate">Nano Banana 2</span>`
);

// ============================================================================
// 3. GENERATE IMAGE PANEL: studio-ratio-btn & studio-ratio-dropdown
// ============================================================================
// Change default studio-ratio-btn trigger to 1:1
const studioRatioBtnOld = `<button id="studio-ratio-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span id="studio-ratio-icon"
                                            class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2">
                                                <path d="m16 3 4 4-4 4" />
                                                <path d="M20 7H4" />
                                                <path d="m8 21-4-4 4-4" />
                                                <path d="M4 17h16" />
                                            </svg>
                                        </span>
                                        <span id="studio-ratio-label" class="font-medium truncate">Auto</span>
                                    </div>
                                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>`;

const studioRatioBtnNew = `<button id="studio-ratio-btn" type="button"
                                    class="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span id="studio-ratio-icon"
                                            class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            <div class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0"></div>
                                        </span>
                                        <span id="studio-ratio-label" class="font-medium truncate">1:1</span>
                                    </div>
                                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>`;

html = html.replace(studioRatioBtnOld, studioRatioBtnNew);

// In studio-ratio-dropdown: remove header & clean labels
const studioRatioHeader = `<div
                                        class="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase px-2 py-1 border-b border-slate-100 dark:border-white/10 mb-1">
                                        Aspect Ratio</div>`;
html = html.replace(studioRatioHeader, '');

// Clean padding on studio-ratio-dropdown
html = html.replace(
    'id="studio-ratio-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1.5',
    'id="studio-ratio-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1'
);

// Replace parenthetical words in studio-ratio-dropdown
html = html.replace('<span class="truncate">Auto (AI decides)</span>', '<span class="truncate">Auto</span>');
html = html.replace('<span class="truncate">1:1 (Square)</span>', '<span class="truncate">1:1</span>');
html = html.replace('<span class="truncate">2:3 (Portrait)</span>', '<span class="truncate">2:3</span>');
html = html.replace('<span class="truncate">3:4 (Portrait)</span>', '<span class="truncate">3:4</span>');
html = html.replace('<span class="truncate">9:16 (Mobile)</span>', '<span class="truncate">9:16</span>');
html = html.replace('<span class="truncate">3:2 (Landscape)</span>', '<span class="truncate">3:2</span>');
html = html.replace('<span class="truncate">4:3 (Landscape)</span>', '<span class="truncate">4:3</span>');
html = html.replace('<span class="truncate">16:9 (Widescreen)</span>', '<span class="truncate">16:9</span>');

// Make 1:1 the active check in studio-ratio-dropdown
// The first option (auto) currently has checkmark visible without 'hidden', option 1:1 has 'hidden'
const autoCheckOld = `<svg class="studio-ratio-check w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>`;
const autoCheckNew = `<svg class="studio-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>`;
html = html.replace(autoCheckOld, autoCheckNew);

// And option 1:1 has:
const squareOptionOld = `<button type="button" data-ratio="1:1" data-label="1:1"
                                            class="studio-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group">
                                            <div class="flex items-center gap-2.5 min-w-0">
                                                <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                    <div
                                                        class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                    </div>
                                                </div>
                                                <span class="truncate">1:1</span>
                                            </div>
                                            <svg class="studio-ratio-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </button>`;

const squareOptionNew = `<button type="button" data-ratio="1:1" data-label="1:1"
                                            class="studio-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 font-medium cursor-pointer transition-colors text-left group">
                                            <div class="flex items-center gap-2.5 min-w-0">
                                                <div class="w-5 h-5 flex items-center justify-center shrink-0">
                                                    <div
                                                        class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0">
                                                    </div>
                                                </div>
                                                <span class="truncate font-semibold text-slate-800 dark:text-slate-100">1:1</span>
                                            </div>
                                            <svg class="studio-ratio-check w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </button>`;

html = html.replace(squareOptionOld, squareOptionNew);

// ============================================================================
// 4. GENERATE IMAGE PANEL: studio-count-dropdown (Variations header removal)
// ============================================================================
const studioCountHeader = `<div
                                        class="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase px-2 py-1 border-b border-slate-100 dark:border-white/10 mb-1">
                                        Variations</div>`;
html = html.replace(studioCountHeader, '');
html = html.replace(
    'id="studio-count-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1.5',
    'id="studio-count-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1'
);

// ============================================================================
// 5. PRECISE EDIT PANEL: Quality & Variations header removal
// ============================================================================
// Quality in Precise Edit
const preciseQualityHeader = `<div
                                        class="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase px-2 py-1 border-b border-slate-100 dark:border-white/10 mb-1">
                                        Quality</div>`;
html = html.replace(preciseQualityHeader, '');
html = html.replace(
    'id="studio-precise-edit-weight-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1.5',
    'id="studio-precise-edit-weight-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1'
);

// Variations in Precise Edit
const preciseVariationsHeader = `<div
                                        class="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase px-2 py-1 border-b border-slate-100 dark:border-white/10 mb-1">
                                        Variations</div>`;
html = html.replace(preciseVariationsHeader, '');
html = html.replace(
    'id="studio-precise-edit-count-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1.5',
    'id="studio-precise-edit-count-dropdown"\n                                    class="hidden absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[#0c141c] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1'
);

// ============================================================================
// 6. JAVASCRIPT STATE & LOGIC UPDATES
// ============================================================================
// In IMAGE_MODELS:
html = html.replace(
    'name: "Nano Banana Pro (Gemini 3 Pro Image)",',
    'name: "Nano Banana Pro",'
);
html = html.replace(
    'name: "Nano Banana 2 (Gemini 3.1 Flash Image)",',
    'name: "Nano Banana 2",'
);

// In imageStudioState:
html = html.replace(
    "aspectRatio: 'auto',",
    "aspectRatio: '1:1',"
);

// In imageHomeSelectedRatio:
html = html.replace(
    "let imageHomeSelectedRatio = 'auto';",
    "let imageHomeSelectedRatio = '1:1';"
);

// In syncHomeRatioDisplay and syncHomeModelDisplay and click handlers:
const oldSyncLogic = `            function syncHomeRatioDisplay(selectedRatio) {
                if (!homeRatioPop) return;
                const active = selectedRatio || imageHomeSelectedRatio || 'auto';
                homeRatioPop.querySelectorAll('.image-home-ratio-option').forEach(opt => {
                    const r = opt.dataset.ratio;
                    const isSelected = r === active;
                    const chk = opt.querySelector('.image-home-ratio-check');
                    if (chk) chk.classList.toggle('hidden', !isSelected);
                    if (isSelected) {
                        opt.className = 'image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 font-semibold text-slate-900 dark:text-white text-xs cursor-pointer transition-colors text-left group';
                    } else {
                        opt.className = 'image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300';
                    }
                });

                // Dynamic icon update for Home Aspect Ratio trigger
                const ratioIconEl = document.getElementById('image-home-ratio-icon');
                if (ratioIconEl) {
                    if (active === 'auto') {
                        ratioIconEl.innerHTML = \`<svg class="w-4 h-4 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>\`;
                    } else if (typeof getStudioRatioWireframeHtml === 'function') {
                        ratioIconEl.innerHTML = getStudioRatioWireframeHtml(active);
                    }
                }
                if (homeRatioBtn) {
                    homeRatioBtn.title = active === 'auto' ? 'Aspect Ratio: Auto (AI decides)' : \`Aspect Ratio: \${active}\`;
                }
            }

            function syncHomeModelDisplay(selectedModel) {
                if (!homeModelPop) return;
                const active = (selectedModel || imageHomeSelectedModel || 'auto').toLowerCase();
                homeModelPop.querySelectorAll('.image-home-model-option').forEach(opt => {
                    const m = (opt.dataset.model || '').toLowerCase();
                    const isSelected = m === active;
                    const chk = opt.querySelector('.image-home-model-check');
                    if (chk) chk.classList.toggle('hidden', !isSelected);
                    if (isSelected) {
                        opt.className = 'image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-white/10 font-semibold text-slate-900 dark:text-white cursor-pointer transition-colors group text-left';
                    } else {
                        opt.className = 'image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left';
                    }
                });

                // Dynamic icon update for Home Model trigger
                const modelIconEl = document.getElementById('image-home-model-icon');
                if (modelIconEl) {
                    modelIconEl.innerHTML = getModelIconSvg(active);
                }
                const foundModel = typeof IMAGE_MODELS !== 'undefined' ? IMAGE_MODELS.find(m => m.id === active) : null;
                const modelName = active === 'auto' ? 'Auto' : (foundModel ? foundModel.name : active);
                if (homeModelBtn) {
                    homeModelBtn.title = \`Model: \${modelName}\`;
                }
            }

            if (homeRatioBtn && homeRatioPop) {
                homeRatioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = homeRatioPop.classList.contains('hidden');
                    if (homeModelPop) homeModelPop.classList.add('hidden');
                    if (homeModelBtn) homeModelBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    if (isHidden) {
                        syncHomeRatioDisplay(imageHomeSelectedRatio);
                        homeRatioPop.classList.remove('hidden');
                        homeRatioBtn.classList.add('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    } else {
                        homeRatioPop.classList.add('hidden');
                        homeRatioBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    }
                });

                homeRatioPop.querySelectorAll('.image-home-ratio-option').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const r = opt.dataset.ratio;
                        imageHomeSelectedRatio = r;
                        syncHomeRatioDisplay(r);
                        homeRatioPop.classList.add('hidden');
                        homeRatioBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                        showStudioToast(\`Aspect ratio set to \${opt.dataset.label || r}\`);
                    });
                });
            }

            if (homeModelBtn && homeModelPop) {
                homeModelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = homeModelPop.classList.contains('hidden');
                    if (homeRatioPop) homeRatioPop.classList.add('hidden');
                    if (homeRatioBtn) homeRatioBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    if (isHidden) {
                        syncHomeModelDisplay(imageHomeSelectedModel);
                        homeModelPop.classList.remove('hidden');
                        homeModelBtn.classList.add('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    } else {
                        homeModelPop.classList.add('hidden');
                        homeModelBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    }
                });

                homeModelPop.querySelectorAll('.image-home-model-option').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const m = opt.dataset.model;
                        const name = opt.dataset.name || m;
                        imageHomeSelectedModel = m;
                        syncHomeModelDisplay(m);
                        homeModelPop.classList.add('hidden');
                        homeModelBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                        showStudioToast(\`Model set to \${name}\`);
                    });
                });
            }

            // Outside click to close popovers
            document.addEventListener('click', (e) => {
                if (homeRatioPop && !homeRatioPop.classList.contains('hidden')) {
                    if (!homeRatioPop.contains(e.target) && !homeRatioBtn?.contains(e.target)) {
                        homeRatioPop.classList.add('hidden');
                        if (homeRatioBtn) homeRatioBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    }
                }
                if (homeModelPop && !homeModelPop.classList.contains('hidden')) {
                    if (!homeModelPop.contains(e.target) && !homeModelBtn?.contains(e.target)) {
                        homeModelPop.classList.add('hidden');
                        if (homeModelBtn) homeModelBtn.classList.remove('bg-slate-100', 'dark:bg-white/10', 'text-slate-900', 'dark:text-white');
                    }
                }
            });`;

const newSyncLogic = `            function syncHomeRatioDisplay(selectedRatio) {
                if (!homeRatioPop) return;
                const active = selectedRatio || imageHomeSelectedRatio || '1:1';
                homeRatioPop.querySelectorAll('.image-home-ratio-option').forEach(opt => {
                    const r = opt.dataset.ratio;
                    const isSelected = r === active;
                    const chk = opt.querySelector('.image-home-ratio-check');
                    if (chk) chk.classList.toggle('hidden', !isSelected);
                    if (isSelected) {
                        opt.className = 'image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 font-semibold text-slate-900 dark:text-white text-xs cursor-pointer transition-colors text-left group';
                    } else {
                        opt.className = 'image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300';
                    }
                });

                // Dynamic icon & label update for Home Aspect Ratio trigger
                const ratioIconEl = document.getElementById('image-home-ratio-icon');
                const ratioLabelEl = document.getElementById('image-home-ratio-label');
                const displayLabel = active === 'auto' ? 'Auto' : active;
                if (ratioLabelEl) {
                    ratioLabelEl.textContent = displayLabel;
                }
                if (ratioIconEl) {
                    if (active === 'auto') {
                        ratioIconEl.innerHTML = \`<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>\`;
                    } else if (typeof getStudioRatioWireframeHtml === 'function') {
                        ratioIconEl.innerHTML = getStudioRatioWireframeHtml(active);
                    }
                }
                if (homeRatioBtn) {
                    homeRatioBtn.title = \`Aspect Ratio: \${displayLabel}\`;
                }
            }

            function syncHomeModelDisplay(selectedModel) {
                if (!homeModelPop) return;
                const active = (selectedModel || imageHomeSelectedModel || 'auto').toLowerCase();
                homeModelPop.querySelectorAll('.image-home-model-option').forEach(opt => {
                    const m = (opt.dataset.model || '').toLowerCase();
                    const isSelected = m === active;
                    const chk = opt.querySelector('.image-home-model-check');
                    if (chk) chk.classList.toggle('hidden', !isSelected);
                    if (isSelected) {
                        opt.className = 'image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-white/10 font-semibold text-slate-900 dark:text-white cursor-pointer transition-colors group text-left';
                    } else {
                        opt.className = 'image-home-model-option w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group text-left';
                    }
                });

                // Dynamic icon & label update for Home Model trigger (Plain, borderless)
                const modelIconEl = document.getElementById('image-home-model-icon');
                const modelLabelEl = document.getElementById('image-home-model-label');
                const foundModel = typeof IMAGE_MODELS !== 'undefined' ? IMAGE_MODELS.find(m => m.id.toLowerCase() === active) : null;
                const modelName = active === 'auto' ? 'Auto' : (foundModel ? foundModel.name : active);
                if (modelLabelEl) {
                    modelLabelEl.textContent = modelName;
                }
                if (modelIconEl) {
                    if (active === 'auto') {
                        modelIconEl.classList.add('hidden');
                        modelIconEl.innerHTML = '';
                    } else {
                        modelIconEl.classList.remove('hidden');
                        modelIconEl.innerHTML = getModelIconSvg(active);
                    }
                }
                if (homeModelBtn) {
                    homeModelBtn.title = \`Model: \${modelName}\`;
                }
            }

            if (homeRatioBtn && homeRatioPop) {
                homeRatioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = homeRatioPop.classList.contains('hidden');
                    if (homeModelPop) homeModelPop.classList.add('hidden');
                    if (homeModelBtn) homeModelBtn.classList.remove('text-neutral-950', 'dark:text-white');
                    if (isHidden) {
                        syncHomeRatioDisplay(imageHomeSelectedRatio);
                        homeRatioPop.classList.remove('hidden');
                        homeRatioBtn.classList.add('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    } else {
                        homeRatioPop.classList.add('hidden');
                        homeRatioBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
                });

                homeRatioPop.querySelectorAll('.image-home-ratio-option').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const r = opt.dataset.ratio;
                        imageHomeSelectedRatio = r;
                        syncHomeRatioDisplay(r);
                        homeRatioPop.classList.add('hidden');
                        homeRatioBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                        showStudioToast(\`Aspect ratio set to \${opt.dataset.label || r}\`);
                    });
                });
            }

            if (homeModelBtn && homeModelPop) {
                homeModelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = homeModelPop.classList.contains('hidden');
                    if (homeRatioPop) homeRatioPop.classList.add('hidden');
                    if (homeRatioBtn) homeRatioBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    if (isHidden) {
                        syncHomeModelDisplay(imageHomeSelectedModel);
                        homeModelPop.classList.remove('hidden');
                        homeModelBtn.classList.add('text-neutral-950', 'dark:text-white');
                    } else {
                        homeModelPop.classList.add('hidden');
                        homeModelBtn.classList.remove('text-neutral-950', 'dark:text-white');
                    }
                });

                homeModelPop.querySelectorAll('.image-home-model-option').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const m = opt.dataset.model;
                        const name = opt.dataset.name || m;
                        imageHomeSelectedModel = m;
                        syncHomeModelDisplay(m);
                        homeModelPop.classList.add('hidden');
                        homeModelBtn.classList.remove('text-neutral-950', 'dark:text-white');
                        showStudioToast(\`Model set to \${name}\`);
                    });
                });
            }

            // Outside click to close popovers
            document.addEventListener('click', (e) => {
                if (homeRatioPop && !homeRatioPop.classList.contains('hidden')) {
                    if (!homeRatioPop.contains(e.target) && !homeRatioBtn?.contains(e.target)) {
                        homeRatioPop.classList.add('hidden');
                        if (homeRatioBtn) homeRatioBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
                }
                if (homeModelPop && !homeModelPop.classList.contains('hidden')) {
                    if (!homeModelPop.contains(e.target) && !homeModelBtn?.contains(e.target)) {
                        homeModelPop.classList.add('hidden');
                        if (homeModelBtn) homeModelBtn.classList.remove('text-neutral-950', 'dark:text-white');
                    }
                }
            });`;

if (!html.includes(oldSyncLogic)) {
    console.error('ERROR: oldSyncLogic target string not found in index.html');
} else {
    html = html.replace(oldSyncLogic, newSyncLogic);
    console.log('Successfully replaced oldSyncLogic');
}

// Write to index.html
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully written updated index.html');

// Validate syntax of all script tags
const scriptRegex = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let hasError = false;
while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const scriptContent = match[1];
    const startIndex = match.index;
    const lineNumber = html.substring(0, startIndex).split('\n').length;
    try {
        new vm.Script(scriptContent, { filename: `inline-script-${count}.js`, lineOffset: lineNumber - 1 });
        console.log(`Script #${count} (starts near line ${lineNumber}) is VALID.`);
    } catch (err) {
        hasError = true;
        console.error(`SYNTAX ERROR in script #${count} (starts near line ${lineNumber}):`);
        console.error(err.message);
    }
}
console.log('Any syntax error?', hasError);
