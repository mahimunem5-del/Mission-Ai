const fs = require('fs');
const path = require('path');
const vm = require('vm');

let html = fs.readFileSync('index.html', 'utf8');

// 1. UPDATE HERO PROMPT BOX HTML
// Extract the model popover inner options to ensure they are 100% preserved
const modelPopStartStr = '<div id="image-home-model-popover"';
const modelPopStart = html.indexOf(modelPopStartStr);
const modelPopEndStr = '</div>\n                                </div>\n                            </div>\n<!-- Bottom-Right Circular Send Button -->';
let modelPopEnd = html.indexOf(modelPopEndStr);

if (modelPopStart === -1 || modelPopEnd === -1) {
    console.error('Could not locate model popover bounds');
    // Try alternate search
    const mWrapperStart = html.indexOf('id="image-home-model-wrapper"');
    console.log('mWrapperStart:', mWrapperStart);
    process.exit(1);
}

// Find the content inside <div id="image-home-model-popover" ...>
const modelPopContentStart = html.indexOf('<div class="space-y-0.5">', modelPopStart);
const modelPopContentEnd = html.indexOf('</div>\n                                    </div>\n                                </div>\n                            </div>', modelPopContentStart);

const modelOptionsInner = html.slice(modelPopContentStart, modelPopContentEnd + '</div>'.length);

console.log('Preserved model options length:', modelOptionsInner.length);

const row3FullStart = html.indexOf('<!-- Row 3: Bottom Bar (Aspect Ratio, Model Selection, Circular Send) -->');
const row3FullEnd = html.indexOf('<!-- Creative Workflows Bento Grid Section -->');

const row3Old = html.slice(row3FullStart, row3FullEnd);

const newRow3 = `<!-- Row 3: Bottom Bar (Aspect Ratio, Variations, Model Selection, Circular Send) -->
                        <div class="flex items-center justify-between pt-2 mt-auto shrink-0 relative z-40">
                            <!-- Bottom-Left Minimal Controls (Two Bordered Boxes Side-by-Side, NO Chevrons) -->
                            <div class="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                <!-- 1. Aspect Ratio Trigger & Popover (Bordered Box, default 1:1, NO chevron) -->
                                <div class="relative z-50" id="image-home-ratio-wrapper">
                                    <button type="button" id="image-home-ratio-btn"
                                        class="h-8 px-2.5 rounded-lg border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-neutral-50 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 text-xs font-normal inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                                        title="Aspect Ratio: 1:1">
                                        <span id="image-home-ratio-icon"
                                            class="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-400">
                                            <div class="studio-ratio-wireframe w-3.5 h-3.5 border-1.5 border-[1.5px] border-current rounded-xs shrink-0"></div>
                                        </span>
                                        <span id="image-home-ratio-label">1:1</span>
                                    </button>

                                    <!-- Aspect Ratio Popover (Clean Downward Floating Dropdown, No Uppercase Header) -->
                                    <div id="image-home-ratio-popover"
                                        class="hidden absolute left-0 top-full mt-2 w-max min-w-[104px] bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200 max-h-64 overflow-y-auto ideogram-custom-scroll">
                                        <div class="space-y-0.5">
                                            <!-- 1. 1:1 - DEFAULT -->
                                            <button type="button" data-ratio="1:1" data-label="1:1"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 font-medium text-slate-900 dark:text-white text-xs cursor-pointer transition-colors text-left group">
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
                                            <!-- 2. 2:3 -->
                                            <button type="button" data-ratio="2:3" data-label="2:3"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
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
                                            <!-- 3. 3:2 -->
                                            <button type="button" data-ratio="3:2" data-label="3:2"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
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
                                            <!-- 4. 3:4 -->
                                            <button type="button" data-ratio="3:4" data-label="3:4"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
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
                                            <!-- 5. 4:3 -->
                                            <button type="button" data-ratio="4:3" data-label="4:3"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
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
                                            <!-- 6. 9:16 -->
                                            <button type="button" data-ratio="9:16" data-label="9:16"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
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
                                            <!-- 7. 16:9 -->
                                            <button type="button" data-ratio="16:9" data-label="16:9"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
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
                                            <!-- 8. Auto -->
                                            <button type="button" data-ratio="auto" data-label="Auto"
                                                class="image-home-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
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
                                        </div>
                                    </div>
                                </div>

                                <!-- 2. Variations Trigger & Popover (Bordered Box, default 1, NO chevron) -->
                                <div class="relative z-50" id="image-home-count-wrapper">
                                    <button type="button" id="image-home-count-btn"
                                        class="h-8 px-2.5 rounded-lg border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:bg-neutral-50 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 text-xs font-normal inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                                        title="Variations: 1">
                                        <span id="image-home-count-icon"
                                            class="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-400">
                                            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                <circle cx="9" cy="9" r="2"/>
                                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                            </svg>
                                        </span>
                                        <span id="image-home-count-label">1</span>
                                    </button>

                                    <!-- Variations Popover (Clean Downward Floating Dropdown, No Uppercase Header) -->
                                    <div id="image-home-count-popover"
                                        class="hidden absolute left-0 top-full mt-2 w-max min-w-[76px] bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200">
                                        <div class="space-y-0.5">
                                            <!-- 1 -->
                                            <button type="button" data-count="1"
                                                class="image-home-count-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 font-medium text-slate-900 dark:text-white text-xs cursor-pointer transition-colors text-left group">
                                                <span>1</span>
                                                <svg class="image-home-count-check w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 2 -->
                                            <button type="button" data-count="2"
                                                class="image-home-count-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <span>2</span>
                                                <svg class="image-home-count-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 3 -->
                                            <button type="button" data-count="3"
                                                class="image-home-count-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <span>3</span>
                                                <svg class="image-home-count-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                            <!-- 4 -->
                                            <button type="button" data-count="4"
                                                class="image-home-count-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300">
                                                <span>4</span>
                                                <svg class="image-home-count-check hidden w-3.5 h-3.5 text-slate-700 dark:text-slate-200 shrink-0"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Bottom-Right Group (Model Selector Placed Directly Left of Send Button) -->
                            <div class="flex items-center gap-2.5">
                                <!-- 3. Model Selection Trigger & Popover (Plain, borderless, WITH chevron) -->
                                <div class="relative z-50" id="image-home-model-wrapper">
                                    <button type="button" id="image-home-model-btn"
                                        class="h-8 px-2 text-xs font-normal text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
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
                                        class="hidden absolute right-0 top-full mt-2 w-max min-w-[180px] bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-[999] backdrop-blur-2xl text-slate-700 dark:text-slate-200 max-h-72 overflow-y-auto ideogram-custom-scroll">
                                        ${modelOptionsInner}
                                    </div>
                                </div>

                                <!-- Bottom-Right Circular Send Button -->
                                <button type="button" id="image-home-submit-btn" disabled
                                    class="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
                                    title="Generate">
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="12" y1="19" x2="12" y2="5"></line>
                                        <polyline points="5 12 12 5 19 12"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                `;

html = html.slice(0, row3FullStart) + newRow3 + html.slice(row3FullEnd);

console.log('Row 3 replaced successfully!');

// 2. JS: Add imageHomeSelectedCount = 1
const ratioModelVarTarget = "let imageHomeSelectedRatio = '1:1';\n        let imageHomeSelectedModel = 'auto';";
const ratioModelVarReplacement = "let imageHomeSelectedRatio = '1:1';\n        let imageHomeSelectedModel = 'auto';\n        let imageHomeSelectedCount = 1;";

if (!html.includes(ratioModelVarTarget)) {
    console.error('Target ratioModelVarTarget not found in JS!');
    process.exit(1);
}
html = html.replace(ratioModelVarTarget, ratioModelVarReplacement);

// 3. JS: Update submitHomePrompt to pass count & imageCount
const submitHomeOld = `            function submitHomePrompt() {
                const promptText = (homePrompt ? homePrompt.value : '').trim();
                if (!promptText) return;

                const activeRatio = imageHomeSelectedRatio || 'auto';
                const activeModel = imageHomeSelectedModel || 'auto';
                const refData = imageHomeRefDataUrl;
                const refName = imageHomeRefName;

                setImageStudioMode('workspace', {
                    prompt: promptText,
                    referenceImage: refData,
                    referenceImageName: refName,
                    aspectRatio: activeRatio,
                    model: activeModel,
                    autoGenerate: true
                });
            }`;

const submitHomeNew = `            function submitHomePrompt() {
                const promptText = (homePrompt ? homePrompt.value : '').trim();
                if (!promptText) return;

                const activeRatio = imageHomeSelectedRatio || '1:1';
                const activeModel = imageHomeSelectedModel || 'auto';
                const activeCount = parseInt(imageHomeSelectedCount, 10) || 1;
                const refData = imageHomeRefDataUrl;
                const refName = imageHomeRefName;

                setImageStudioMode('workspace', {
                    prompt: promptText,
                    referenceImage: refData,
                    referenceImageName: refName,
                    aspectRatio: activeRatio,
                    model: activeModel,
                    count: activeCount,
                    imageCount: activeCount,
                    autoGenerate: true
                });
            }`;

if (!html.includes(submitHomeOld)) {
    console.error('submitHomeOld not found!');
    process.exit(1);
}
html = html.replace(submitHomeOld, submitHomeNew);

// 4. JS: Add homeCountBtn, homeCountPop and syncHomeCountDisplay
const popoversOld = `            // Aspect Ratio & Model Popovers (Parity with Workspace)
            const homeRatioBtn = document.getElementById('image-home-ratio-btn');
            const homeRatioPop = document.getElementById('image-home-ratio-popover');
            const homeModelBtn = document.getElementById('image-home-model-btn');
            const homeModelPop = document.getElementById('image-home-model-popover');`;

const popoversNew = `            // Aspect Ratio, Variations & Model Popovers (Parity with Workspace)
            const homeRatioBtn = document.getElementById('image-home-ratio-btn');
            const homeRatioPop = document.getElementById('image-home-ratio-popover');
            const homeCountBtn = document.getElementById('image-home-count-btn');
            const homeCountPop = document.getElementById('image-home-count-popover');
            const homeModelBtn = document.getElementById('image-home-model-btn');
            const homeModelPop = document.getElementById('image-home-model-popover');

            function syncHomeCountDisplay(selectedCount) {
                if (!homeCountPop) return;
                const active = String(selectedCount || imageHomeSelectedCount || 1);
                homeCountPop.querySelectorAll('.image-home-count-option').forEach(opt => {
                    const c = String(opt.dataset.count);
                    const isSelected = c === active;
                    const chk = opt.querySelector('.image-home-count-check');
                    if (chk) chk.classList.toggle('hidden', !isSelected);
                    if (isSelected) {
                        opt.className = 'image-home-count-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 font-medium text-slate-900 dark:text-white text-xs cursor-pointer transition-colors text-left group';
                    } else {
                        opt.className = 'image-home-count-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300';
                    }
                });

                const countLabelEl = document.getElementById('image-home-count-label');
                if (countLabelEl) countLabelEl.textContent = active;
                if (homeCountBtn) homeCountBtn.title = \`Variations: \${active}\`;
            }`;

if (!html.includes(popoversOld)) {
    console.error('popoversOld not found!');
    process.exit(1);
}
html = html.replace(popoversOld, popoversNew);

// 5. JS: Connect event listeners for homeCountBtn and update homeRatioBtn/homeModelBtn to close other popovers
const listenersOld = `            if (homeRatioBtn && homeRatioPop) {
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
            });

            // Initial display synchronization
            syncHomeRatioDisplay(imageHomeSelectedRatio);
            syncHomeModelDisplay(imageHomeSelectedModel);`;

const listenersNew = `            if (homeRatioBtn && homeRatioPop) {
                homeRatioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = homeRatioPop.classList.contains('hidden');
                    if (homeCountPop) {
                        homeCountPop.classList.add('hidden');
                        if (homeCountBtn) homeCountBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
                    if (homeModelPop) {
                        homeModelPop.classList.add('hidden');
                        if (homeModelBtn) homeModelBtn.classList.remove('text-neutral-950', 'dark:text-white');
                    }
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

            if (homeCountBtn && homeCountPop) {
                homeCountBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = homeCountPop.classList.contains('hidden');
                    if (homeRatioPop) {
                        homeRatioPop.classList.add('hidden');
                        if (homeRatioBtn) homeRatioBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
                    if (homeModelPop) {
                        homeModelPop.classList.add('hidden');
                        if (homeModelBtn) homeModelBtn.classList.remove('text-neutral-950', 'dark:text-white');
                    }
                    if (isHidden) {
                        syncHomeCountDisplay(imageHomeSelectedCount);
                        homeCountPop.classList.remove('hidden');
                        homeCountBtn.classList.add('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    } else {
                        homeCountPop.classList.add('hidden');
                        homeCountBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
                });

                homeCountPop.querySelectorAll('.image-home-count-option').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const c = parseInt(opt.dataset.count, 10) || 1;
                        imageHomeSelectedCount = c;
                        syncHomeCountDisplay(c);
                        homeCountPop.classList.add('hidden');
                        homeCountBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                        showStudioToast(\`Variations set to \${c}\`);
                    });
                });
            }

            if (homeModelBtn && homeModelPop) {
                homeModelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = homeModelPop.classList.contains('hidden');
                    if (homeRatioPop) {
                        homeRatioPop.classList.add('hidden');
                        if (homeRatioBtn) homeRatioBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
                    if (homeCountPop) {
                        homeCountPop.classList.add('hidden');
                        if (homeCountBtn) homeCountBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
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
                if (homeCountPop && !homeCountPop.classList.contains('hidden')) {
                    if (!homeCountPop.contains(e.target) && !homeCountBtn?.contains(e.target)) {
                        homeCountPop.classList.add('hidden');
                        if (homeCountBtn) homeCountBtn.classList.remove('border-neutral-300', 'bg-neutral-50', 'dark:bg-white/[0.08]');
                    }
                }
                if (homeModelPop && !homeModelPop.classList.contains('hidden')) {
                    if (!homeModelPop.contains(e.target) && !homeModelBtn?.contains(e.target)) {
                        homeModelPop.classList.add('hidden');
                        if (homeModelBtn) homeModelBtn.classList.remove('text-neutral-950', 'dark:text-white');
                    }
                }
            });

            // Initial display synchronization
            syncHomeRatioDisplay(imageHomeSelectedRatio);
            syncHomeCountDisplay(imageHomeSelectedCount);
            syncHomeModelDisplay(imageHomeSelectedModel);`;

if (!html.includes(listenersOld)) {
    console.error('listenersOld not found!');
    process.exit(1);
}
html = html.replace(listenersOld, listenersNew);

// 6. JS: In setImageStudioMode, handle options.count / options.imageCount and syncStudioRatioDropdown
const studioModeRatioOld = `                if (options.aspectRatio) {
                    imageStudioState.aspectRatio = options.aspectRatio;
                    const ratioLabel = document.getElementById('ideogram-ratio-select-label');
                    const studioRatioLabel = document.getElementById('studio-ratio-label');
                    const studioRatioIcon = document.getElementById('studio-ratio-icon');
                    const displayRatio = options.aspectRatio === 'auto' ? 'Auto' : options.aspectRatio;
                    if (ratioLabel) ratioLabel.textContent = displayRatio;
                    if (studioRatioLabel) studioRatioLabel.textContent = displayRatio;
                    if (studioRatioIcon && typeof getStudioRatioWireframeHtml === 'function') {
                        studioRatioIcon.innerHTML = getStudioRatioWireframeHtml(options.aspectRatio);
                    }
                    if (typeof syncRatioGridSelection === 'function') syncRatioGridSelection(options.aspectRatio);
                    const ratioDrop = document.getElementById('studio-ratio-dropdown');
                    if (ratioDrop) {
                        ratioDrop.querySelectorAll('.studio-ratio-option').forEach(opt => {
                            const optRatio = opt.dataset.ratio;
                            const isMatch = optRatio === options.aspectRatio;
                            const chk = opt.querySelector('.studio-ratio-check');
                            if (chk) chk.classList.toggle('hidden', !isMatch);
                        });
                    }
                }`;

const studioModeRatioNew = `                if (options.count || options.imageCount) {
                    const c = parseInt(options.count || options.imageCount, 10) || 1;
                    imageStudioState.imageCount = c;
                    const countLabel = document.getElementById('studio-count-label');
                    if (countLabel) countLabel.textContent = String(c);
                    if (typeof syncStudioCountDropdown === 'function') syncStudioCountDropdown(c);
                    if (typeof syncCountGridSelection === 'function') syncCountGridSelection(c);
                }

                if (options.aspectRatio) {
                    imageStudioState.aspectRatio = options.aspectRatio;
                    const ratioLabel = document.getElementById('ideogram-ratio-select-label');
                    const studioRatioLabel = document.getElementById('studio-ratio-label');
                    const studioRatioIcon = document.getElementById('studio-ratio-icon');
                    const displayRatio = options.aspectRatio === 'auto' ? 'Auto' : options.aspectRatio;
                    if (ratioLabel) ratioLabel.textContent = displayRatio;
                    if (studioRatioLabel) studioRatioLabel.textContent = displayRatio;
                    if (studioRatioIcon && typeof getStudioRatioWireframeHtml === 'function') {
                        studioRatioIcon.innerHTML = getStudioRatioWireframeHtml(options.aspectRatio);
                    }
                    if (typeof syncRatioGridSelection === 'function') syncRatioGridSelection(options.aspectRatio);
                    if (typeof syncStudioRatioDropdown === 'function') syncStudioRatioDropdown(options.aspectRatio);
                }`;

if (!html.includes(studioModeRatioOld)) {
    console.error('studioModeRatioOld not found!');
    process.exit(1);
}
html = html.replace(studioModeRatioOld, studioModeRatioNew);

// 7. JS: Define syncStudioRatioDropdown and wire it up
const studioRatioDropdownOld = `            const ratioDrop = document.getElementById('studio-ratio-dropdown');
            const ratioLabel = document.getElementById('studio-ratio-label');
            const ratioIcon = document.getElementById('studio-ratio-icon');
            if (ratioBtn && ratioDrop) {
                ratioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isClosed = ratioDrop.classList.contains('hidden');
                    closeAllStudioDropdowns();
                    if (isClosed) ratioDrop.classList.remove('hidden');
                });

                ratioDrop.querySelectorAll('.studio-ratio-option').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const ratio = opt.dataset.ratio;
                        const labelText = opt.dataset.label || ratio;
                        imageStudioState.aspectRatio = ratio === 'auto' ? '1:1' : ratio;
                        if (ratioLabel) ratioLabel.textContent = labelText;
                        if (ratioIcon) {
                            ratioIcon.innerHTML = getStudioRatioWireframeHtml(ratio);
                        }
                        ratioDrop.querySelectorAll('.studio-ratio-check').forEach(chk => chk.classList.add('hidden'));
                        const myCheck = opt.querySelector('.studio-ratio-check');
                        if (myCheck) myCheck.classList.remove('hidden');
                        syncRatioGridSelection(ratio);
                        ratioDrop.classList.add('hidden');
                        updateIdeogramApiSnippet();
                    });
                });
            }`;

const studioRatioDropdownNew = `            const ratioDrop = document.getElementById('studio-ratio-dropdown');
            const ratioLabel = document.getElementById('studio-ratio-label');
            const ratioIcon = document.getElementById('studio-ratio-icon');

            // Dynamic Dropdown Sync for Aspect Ratio
            function syncStudioRatioDropdown(selectedRatio) {
                const ratioDrop = document.getElementById('studio-ratio-dropdown');
                if (!ratioDrop) return;
                const active = selectedRatio || imageStudioState.aspectRatio || '1:1';
                ratioDrop.querySelectorAll('.studio-ratio-option').forEach(opt => {
                    const optRatio = opt.dataset.ratio;
                    const isSelected = optRatio === active;
                    const check = opt.querySelector('.studio-ratio-check');
                    if (check) {
                        if (isSelected) check.classList.remove('hidden');
                        else check.classList.add('hidden');
                    }
                    const labelSpan = opt.querySelector('.truncate');
                    if (isSelected) {
                        opt.className = 'studio-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 font-medium cursor-pointer transition-colors text-left group';
                        if (labelSpan) labelSpan.className = 'truncate font-semibold text-slate-800 dark:text-slate-100';
                    } else {
                        opt.className = 'studio-ratio-option w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-normal cursor-pointer transition-colors text-left group text-slate-700 dark:text-slate-300';
                        if (labelSpan) labelSpan.className = 'truncate';
                    }
                });
            }

            if (ratioBtn && ratioDrop) {
                ratioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isClosed = ratioDrop.classList.contains('hidden');
                    closeAllStudioDropdowns();
                    if (isClosed) {
                        syncStudioRatioDropdown(imageStudioState.aspectRatio);
                        ratioDrop.classList.remove('hidden');
                    }
                });

                ratioDrop.querySelectorAll('.studio-ratio-option').forEach(opt => {
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const ratio = opt.dataset.ratio;
                        const labelText = opt.dataset.label || ratio;
                        imageStudioState.aspectRatio = ratio === 'auto' ? '1:1' : ratio;
                        if (ratioLabel) ratioLabel.textContent = labelText;
                        if (ratioIcon) {
                            ratioIcon.innerHTML = getStudioRatioWireframeHtml(ratio);
                        }
                        syncStudioRatioDropdown(ratio);
                        syncRatioGridSelection(ratio);
                        ratioDrop.classList.add('hidden');
                        updateIdeogramApiSnippet();
                    });
                });
            }`;

if (!html.includes(studioRatioDropdownOld)) {
    console.error('studioRatioDropdownOld not found!');
    process.exit(1);
}
html = html.replace(studioRatioDropdownOld, studioRatioDropdownNew);

// Also syncStudioRatioDropdown when ratio grid is clicked or when ratio set in quick presets
const ratioGridOld = `                btn.addEventListener('click', () => {
                    const ratio = btn.dataset.ratio;
                    imageStudioState.aspectRatio = ratio;
                    if (ratioLabel) ratioLabel.textContent = ratio;
                    syncRatioGridSelection(ratio);
                    updateIdeogramApiSnippet();
                });`;
const ratioGridNew = `                btn.addEventListener('click', () => {
                    const ratio = btn.dataset.ratio;
                    imageStudioState.aspectRatio = ratio;
                    if (ratioLabel) ratioLabel.textContent = ratio;
                    syncRatioGridSelection(ratio);
                    if (typeof syncStudioRatioDropdown === 'function') syncStudioRatioDropdown(ratio);
                    updateIdeogramApiSnippet();
                });`;
if (html.includes(ratioGridOld)) {
    html = html.replace(ratioGridOld, ratioGridNew);
}

// Write to index.html
fs.writeFileSync('index.html', html, 'utf8');
console.log('All changes successfully applied to index.html!');
