const fs = require('fs');

console.log('================================================================');
console.log('APPLYING MOBILE CREATIONS BUTTON, COMPACT CARDS, PREVIEW MODAL & SNIPPET');
console.log('================================================================\n');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Add Top-Right Borderless Creations Button opposite #mobile-image-sidebar-btn
const oldSidebarBtn = `                <!-- 1. Persistent Top-Left Sidebar Toggle Button (ChatGPT-style 2-line staggered icon) -->
                <button type="button" id="mobile-image-sidebar-btn"
                    class="fixed top-3.5 left-4 z-40 w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer md:hidden"
                    aria-label="Open sidebar menu" title="Open Menu">
                    <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="4" y1="7.5" x2="20" y2="7.5"></line>
                        <line x1="4" y1="14.5" x2="13" y2="14.5"></line>
                    </svg>
                </button>`;

const newSidebarAndCreationsBtn = `                <!-- 1. Persistent Top-Left Sidebar Toggle Button (ChatGPT-style 2-line staggered icon) -->
                <button type="button" id="mobile-image-sidebar-btn"
                    class="fixed top-3.5 left-4 z-40 w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer md:hidden"
                    aria-label="Open sidebar menu" title="Open Menu">
                    <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="4" y1="7.5" x2="20" y2="7.5"></line>
                        <line x1="4" y1="14.5" x2="13" y2="14.5"></line>
                    </svg>
                </button>

                <!-- Top-Right Borderless Creations Button -->
                <button type="button" id="mobile-image-creations-btn"
                    class="fixed top-3.5 right-4 z-40 text-[13.5px] font-medium text-slate-700 hover:text-slate-900 bg-transparent border-0 px-2.5 py-1.5 rounded-full active:scale-95 transition-all md:hidden cursor-pointer"
                    onclick="event.preventDefault();event.stopPropagation();if(typeof setMobileWorkspaceView==='function'){setMobileWorkspaceView('results');}">
                    Creations
                </button>`;

if (indexHtml.includes(oldSidebarBtn)) {
    indexHtml = indexHtml.replace(oldSidebarBtn, newSidebarAndCreationsBtn);
    console.log('✓ 1. Added Creations button on top-right of mobile image landing page');
} else {
    console.error('✗ 1. oldSidebarBtn NOT found');
    process.exit(1);
}

// 2. Update 4 Tool Cards to compact height (min-h-[54px] py-2 px-2.5), #FFFFFF surface match, w-9 h-9 icons
const oldCardsTarget = `<div class="px-4 mt-2 w-full select-none">
                    <div class="grid grid-cols-2 gap-2.5 w-full">
                        <!-- Card 1: Generate Image -->
                        <button type="button" id="mobile-card-generate"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('generate');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'generate'});}">
                            <img src="/workflows/generate-image.jpeg" alt="Generate Image"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Generate Image</span>
                        </button>

                        <!-- Card 2: Remove Background -->
                        <button type="button" id="mobile-card-remove-bg"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('remove-bg');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'remove-bg'});}">
                            <img src="/workflows/remove-bg.jpeg" alt="Remove Background"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Remove Background</span>
                        </button>

                        <!-- Card 3: Precise Edit -->
                        <button type="button" id="mobile-card-precise-edit"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof studioPreciseEditState!=='undefined'&&studioPreciseEditState){studioPreciseEditState.sourceItem=null;}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('edit');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'edit'});}">
                            <img src="/workflows/precise-edit.jpeg" alt="Precise Edit"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Precise Edit</span>
                        </button>

                        <!-- Card 4: Upscale Image -->
                        <button type="button" id="mobile-card-upscale"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('upscale');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'upscale'});}">
                            <img src="/workflows/upscale-image.jpeg" alt="Upscale Image"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Upscale Image</span>
                        </button>
                    </div>
                </div>`;

const newCardsReplacement = `<div class="px-4 mt-2 w-full select-none">
                    <div class="grid grid-cols-2 gap-2.5 w-full">
                        <!-- Card 1: Generate Image -->
                        <button type="button" id="mobile-card-generate"
                            class="flex items-center gap-2.5 py-2 px-2.5 min-h-[54px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('generate');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'generate'});}">
                            <img src="/workflows/generate-image.jpeg" alt="Generate Image"
                                class="w-9 h-9 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Generate Image</span>
                        </button>

                        <!-- Card 2: Remove Background -->
                        <button type="button" id="mobile-card-remove-bg"
                            class="flex items-center gap-2.5 py-2 px-2.5 min-h-[54px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('remove-bg');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'remove-bg'});}">
                            <img src="/workflows/remove-bg.jpeg" alt="Remove Background"
                                class="w-9 h-9 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Remove Background</span>
                        </button>

                        <!-- Card 3: Precise Edit -->
                        <button type="button" id="mobile-card-precise-edit"
                            class="flex items-center gap-2.5 py-2 px-2.5 min-h-[54px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof studioPreciseEditState!=='undefined'&&studioPreciseEditState){studioPreciseEditState.sourceItem=null;}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('edit');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'edit'});}">
                            <img src="/workflows/precise-edit.jpeg" alt="Precise Edit"
                                class="w-9 h-9 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Precise Edit</span>
                        </button>

                        <!-- Card 4: Upscale Image -->
                        <button type="button" id="mobile-card-upscale"
                            class="flex items-center gap-2.5 py-2 px-2.5 min-h-[54px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('upscale');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'upscale'});}">
                            <img src="/workflows/upscale-image.jpeg" alt="Upscale Image"
                                class="w-9 h-9 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Upscale Image</span>
                        </button>
                    </div>
                </div>`;

if (indexHtml.includes(oldCardsTarget)) {
    indexHtml = indexHtml.replace(oldCardsTarget, newCardsReplacement);
    console.log('✓ 2. Updated 4 mobile workspace cards to min-h-[54px] and #FFFFFF surface match');
} else {
    console.error('✗ 2. oldCardsTarget NOT found');
    process.exit(1);
}

// 3. Update Modal HTML right panel: include tmpl-modal-scale-section and tmpl-modal-prompt-section
const oldModalRightPanel = `<div class="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-neutral-200 p-6 flex flex-col justify-between bg-white shrink-0">
                <div class="flex flex-col flex-1 min-h-0">
                    <!-- 1. Template Name at top in clean prominent typography -->
                    <h3 id="tmpl-modal-title" class="text-lg font-semibold text-neutral-900 leading-snug mb-4">Template</h3>

                    <!-- 2. Prompt Section directly underneath: compact "Prompt" header with inline Copy button + plain prompt text directly on white surface -->
                    <div class="flex flex-col flex-1 min-h-0">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-neutral-900">Prompt</span>
                            <button type="button" id="tmpl-modal-copy-prompt-btn" class="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer flex items-center gap-1 text-[11px]" title="Copy prompt">
                                <svg class="copy-icon w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                </svg>
                                <svg class="check-icon hidden w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span class="copy-label">Copy</span>
                            </button>
                        </div>
                        <p id="tmpl-modal-prompt-text" class="text-xs text-neutral-700 leading-relaxed break-words select-text overflow-y-auto pr-1 max-h-[50vh]"></p>
                    </div>
                </div>

                <!-- 3. Bottom Side-by-Side Action Row (mt-auto pt-4 flex items-center gap-2.5) -->
                <div class="mt-auto pt-4 flex items-center gap-2.5">
                    <!-- Primary monochrome CTA button (Try with Photo or Use Prompt) in sleek compact height -->
                    <button type="button" id="tmpl-modal-cta-btn" class="h-10 px-5 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-medium transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm flex-1">
                        <span id="tmpl-modal-cta-text">Try with Photo</span>
                    </button>
                    <!-- Download button right next to it on the same horizontal row -->
                    <button type="button" id="tmpl-modal-download-btn" class="h-10 px-4 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-sm font-medium inline-flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer">
                        <svg class="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span>Download</span>
                    </button>
                </div>
            </div>`;

const newModalRightPanel = `<div class="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-neutral-200 p-6 flex flex-col justify-between bg-white shrink-0">
                <div class="flex flex-col flex-1 min-h-0">
                    <!-- 1. Template / Workspace Name at top in clean prominent typography -->
                    <h3 id="tmpl-modal-title" class="text-lg font-semibold text-neutral-900 leading-snug mb-4">Template</h3>

                    <!-- Scale Section for Upscale Image -->
                    <div id="tmpl-modal-scale-section" class="hidden flex items-center gap-2 mb-4">
                        <span class="text-xs font-semibold text-neutral-500">Scale:</span>
                        <span id="tmpl-modal-scale-badge" class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">2x</span>
                    </div>

                    <!-- 2. Prompt Section directly underneath: compact "Prompt" header with inline Copy button + plain prompt text directly on white surface -->
                    <div id="tmpl-modal-prompt-section" class="flex flex-col flex-1 min-h-0">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-neutral-900">Prompt</span>
                            <button type="button" id="tmpl-modal-copy-prompt-btn" class="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer flex items-center gap-1 text-[11px]" title="Copy prompt">
                                <svg class="copy-icon w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                </svg>
                                <svg class="check-icon hidden w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span class="copy-label">Copy</span>
                            </button>
                        </div>
                        <p id="tmpl-modal-prompt-text" class="text-xs text-neutral-700 leading-relaxed break-words select-text overflow-y-auto pr-1 max-h-[50vh]"></p>
                    </div>
                </div>

                <!-- 3. Bottom Action Row (Single full-width Download button for Result items, or CTA + Download for Templates) -->
                <div class="mt-auto pt-4 flex items-center gap-2.5">
                    <!-- Primary monochrome CTA button (Try with Photo or Use Prompt) in sleek compact height -->
                    <button type="button" id="tmpl-modal-cta-btn" class="h-10 px-5 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-medium transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm flex-1">
                        <span id="tmpl-modal-cta-text">Try with Photo</span>
                    </button>
                    <!-- Download button right next to it on the same horizontal row -->
                    <button type="button" id="tmpl-modal-download-btn" class="h-10 px-4 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-sm font-medium inline-flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer">
                        <svg class="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span>Download</span>
                    </button>
                </div>
            </div>`;

if (indexHtml.includes(oldModalRightPanel)) {
    indexHtml = indexHtml.replace(oldModalRightPanel, newModalRightPanel);
    console.log('✓ 3. Updated modal right panel HTML with prompt-section and scale-section');
} else {
    console.error('✗ 3. oldModalRightPanel NOT found');
    process.exit(1);
}

// 4. Update openTemplateWhitePreviewModal and closeTemplateWhitePreviewModal JS logic
const oldModalJsStart = `        function openTemplateWhitePreviewModal(tmpl, onPreciseEdit, onGenerate) {`;
const oldModalJsEnd = `            activePreviewModalTemplate = null;
            window.selectedTemplate = null;
        }`;

const startModalJsIdx = indexHtml.indexOf(oldModalJsStart);
const endModalJsIdx = indexHtml.indexOf(oldModalJsEnd, startModalJsIdx);

if (startModalJsIdx === -1 || endModalJsIdx === -1) {
    console.error('✗ 4. Modal JS block markers NOT found', startModalJsIdx, endModalJsIdx);
    process.exit(1);
}

const newModalJsCode = `        function openTemplateWhitePreviewModal(tmpl, onPreciseEdit, onGenerate) {
            const modal = document.getElementById('template-white-preview-modal');
            if (!modal) return;
            activePreviewModalTemplate = tmpl;
            window.selectedTemplate = tmpl;

            // Ensure floating bottom sheet drawer is closed whenever template preview opens
            if (typeof setIsMobileDrawerOpen === 'function') {
                setIsMobileDrawerOpen(false);
            }

            const modalImg = document.getElementById('tmpl-modal-img');
            const modalFallback = document.getElementById('tmpl-modal-fallback');
            const modalFallbackTitle = document.getElementById('tmpl-modal-fallback-title');
            const promptTextEl = document.getElementById('tmpl-modal-prompt-text');
            const ctaBtn = document.getElementById('tmpl-modal-cta-btn');
            const ctaText = document.getElementById('tmpl-modal-cta-text');
            const downloadBtn = document.getElementById('tmpl-modal-download-btn');
            const copyBtn = document.getElementById('tmpl-modal-copy-prompt-btn');
            const modalTitleEl = document.getElementById('tmpl-modal-title');
            const promptSection = document.getElementById('tmpl-modal-prompt-section');
            const scaleSection = document.getElementById('tmpl-modal-scale-section');
            const scaleBadge = document.getElementById('tmpl-modal-scale-badge');

            const isPreciseEdit = tmpl.targetWorkflow === 'precise-edit';
            const imgUrl = tmpl.imageUrl || tmpl.img || '';
            const promptText = tmpl.prompt || '';
            const title = tmpl.title || 'Template';

            if (modalFallbackTitle) modalFallbackTitle.textContent = title;
            if (promptTextEl) promptTextEl.textContent = promptText;

            // Image loading with graceful fallback and /public resolution
            if (modalImg) {
                modalImg.style.display = 'block';
                if (modalFallback) modalFallback.classList.add('hidden');

                modalImg.onload = () => {
                    modalImg.style.display = 'block';
                    if (modalFallback) modalFallback.classList.add('hidden');
                };
                modalImg.onerror = function () {
                    if (!this.dataset.triedPublic && imgUrl && !this.src.includes('/public/')) {
                        this.dataset.triedPublic = '1';
                        this.src = '/public' + (imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl);
                    } else {
                        this.style.display = 'none';
                        if (modalFallback) modalFallback.classList.remove('hidden');
                    }
                };
                modalImg.dataset.triedPublic = '';
                modalImg.src = imgUrl;
            }

            // Copy prompt button (clean inline Copied! feedback, ZERO toasts)
            if (copyBtn) {
                copyBtn.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(promptText).then(() => {
                        const copyIcon = copyBtn.querySelector('.copy-icon');
                        const checkIcon = copyBtn.querySelector('.check-icon');
                        const copyLabel = copyBtn.querySelector('.copy-label');
                        if (copyIcon && checkIcon) {
                            copyIcon.classList.add('hidden');
                            checkIcon.classList.remove('hidden');
                            if (copyLabel) copyLabel.textContent = 'Copied!';
                            setTimeout(() => {
                                copyIcon.classList.remove('hidden');
                                checkIcon.classList.add('hidden');
                                if (copyLabel) copyLabel.textContent = 'Copy';
                            }, 1800);
                        }
                    }).catch(() => {});
                };
            }

            // Context-Aware Tailoring by Workspace Type for Result Feed items
            if (tmpl.isFeedResult || tmpl.isResultItem) {
                // Rule: Remove "Use Prompt" button completely on feed results
                if (ctaBtn) ctaBtn.classList.add('hidden');

                // Single Full-Width Download Button
                if (downloadBtn) {
                    downloadBtn.className = 'w-full h-10 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] transition-all';
                    downloadBtn.onclick = (e) => {
                        e.stopPropagation();
                        const dlTitle = tmpl.title || 'image';
                        const dlName = dlTitle.toLowerCase().replace(/\\s+/g, '-') + '-' + Date.now() + '.png';
                        triggerSilentTemplateDownload(imgUrl, dlName);
                    };
                }

                const ws = tmpl.workspaceType || (tmpl.isRemoveBg ? 'remove-background' : (tmpl.isUpscale ? 'upscale-image' : (tmpl.isPreciseEdit ? 'precise-edit' : 'generate-image')));

                if (ws === 'generate-image') {
                    // 1. Generate Image: Top Heading "Generate Image" + Prompt Section + Download CTA
                    if (modalTitleEl) {
                        modalTitleEl.textContent = 'Generate Image';
                        modalTitleEl.classList.remove('hidden');
                    }
                    if (promptSection) promptSection.classList.remove('hidden');
                    if (scaleSection) scaleSection.classList.add('hidden');
                } else if (ws === 'precise-edit') {
                    // 2. Precise Edit: Top Heading "Precise Edit" + Prompt Section + Download CTA
                    if (modalTitleEl) {
                        modalTitleEl.textContent = 'Precise Edit';
                        modalTitleEl.classList.remove('hidden');
                    }
                    if (promptSection) promptSection.classList.remove('hidden');
                    if (scaleSection) scaleSection.classList.add('hidden');
                } else if (ws === 'upscale-image') {
                    // 3. Upscale Image: Top Heading "Upscale Image" + Scale Section ONLY (No prompt) + Download CTA
                    if (modalTitleEl) {
                        modalTitleEl.textContent = 'Upscale Image';
                        modalTitleEl.classList.remove('hidden');
                    }
                    if (promptSection) promptSection.classList.add('hidden');
                    if (scaleSection) {
                        scaleSection.classList.remove('hidden');
                        if (scaleBadge) scaleBadge.textContent = tmpl.scale || '2x';
                    }
                } else if (ws === 'remove-background') {
                    // 4. Remove Background: Minimal Image-Only Preview (NO heading, NO prompt) + Download CTA
                    if (modalTitleEl) modalTitleEl.classList.add('hidden');
                    if (promptSection) promptSection.classList.add('hidden');
                    if (scaleSection) scaleSection.classList.add('hidden');
                }
            } else {
                // Regular Landing Page Template Preview: Restore Standard Template Details & Dual Buttons
                if (modalTitleEl) {
                    modalTitleEl.textContent = title;
                    modalTitleEl.classList.remove('hidden');
                }
                if (promptSection) promptSection.classList.remove('hidden');
                if (scaleSection) scaleSection.classList.add('hidden');

                if (ctaBtn) {
                    ctaBtn.classList.remove('hidden');
                    if (ctaText) ctaText.textContent = isPreciseEdit ? 'Try with Photo' : 'Use Prompt';
                    ctaBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeTemplateWhitePreviewModal();

                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                        const targetTool = isPreciseEdit ? 'precise-edit' : 'generate-image';

                        if (isMobile) {
                            if (typeof openMobileWorkspaceDrawer === 'function') {
                                openMobileWorkspaceDrawer(targetTool, {
                                    prompt: promptText,
                                    aspectRatio: tmpl.aspectRatio,
                                    stylePreset: tmpl.stylePreset
                                });
                            }
                            return;
                        }

                        // Desktop
                        if (isPreciseEdit) {
                            if (typeof onPreciseEdit === 'function') onPreciseEdit();
                            else if (typeof setImageStudioMode === 'function') setImageStudioMode('workspace', { tool: 'precise-edit' });
                        } else {
                            if (typeof onGenerate === 'function') onGenerate();
                            else if (typeof setImageStudioMode === 'function') setImageStudioMode('workspace', { tool: 'generate' });
                        }
                    };
                }

                if (downloadBtn) {
                    downloadBtn.className = 'h-10 px-4 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-sm font-medium inline-flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer';
                    downloadBtn.onclick = (e) => {
                        e.stopPropagation();
                        triggerSilentTemplateDownload(imgUrl, title);
                    };
                }
            }

            modal.classList.remove('hidden');
        }

        function closeTemplateWhitePreviewModal() {
            const modal = document.getElementById('template-white-preview-modal');
            if (modal) modal.classList.add('hidden');
            activePreviewModalTemplate = null;
            window.selectedTemplate = null;

            // Reset modal sections to default
            document.getElementById('tmpl-modal-title')?.classList.remove('hidden');
            document.getElementById('tmpl-modal-prompt-section')?.classList.remove('hidden');
            document.getElementById('tmpl-modal-scale-section')?.classList.add('hidden');
            document.getElementById('tmpl-modal-cta-btn')?.classList.remove('hidden');
        }`;

indexHtml = indexHtml.substring(0, startModalJsIdx) + newModalJsCode + indexHtml.substring(endModalJsIdx + oldModalJsEnd.length);
console.log('✓ 4. Updated openTemplateWhitePreviewModal & closeTemplateWhitePreviewModal JS logic');

// 5. Splice new mobile workspace snippet into index.html
const snippet = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

const startMarker = '    <!-- ============================================================ -->\r\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const startMarkerLf = '    <!-- ============================================================ -->\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const endMarker = '<!-- Secret Template Admin Studio (100% Invisible to Public Users) -->';

const startIndex = indexHtml.indexOf(startMarker) !== -1 ? indexHtml.indexOf(startMarker) : indexHtml.indexOf(startMarkerLf);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('✗ 5. Snippet markers not found! start:', startIndex, 'end:', endIndex);
    process.exit(1);
}

console.log('Replacing mobile workspace snippet from index', startIndex, 'to', endIndex);
indexHtml = indexHtml.substring(0, startIndex) + snippet + '\n\n    ' + indexHtml.substring(endIndex);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('✓ 5. Successfully wrote updated index.html, final length:', indexHtml.length);
