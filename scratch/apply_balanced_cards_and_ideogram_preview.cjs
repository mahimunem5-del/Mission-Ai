const fs = require('fs');

console.log('================================================================');
console.log('APPLYING BALANCED CARDS, CLEAN FEED METADATA & FULL-BLEED MODAL');
console.log('================================================================\n');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Update 4 Tool Cards to min-h-[64px] py-2.5 px-3 gap-3 with w-10 h-10 rounded-xl thumbnails
const oldCardsTarget = `<div class="px-4 mt-2 w-full select-none">
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

const newCardsReplacement = `<div class="px-4 mt-2 w-full select-none">
                    <div class="grid grid-cols-2 gap-2.5 w-full">
                        <!-- Card 1: Generate Image -->
                        <button type="button" id="mobile-card-generate"
                            class="flex items-center gap-3 py-2.5 px-3 min-h-[64px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('generate');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'generate'});}">
                            <img src="/workflows/generate-image.jpeg" alt="Generate Image"
                                class="w-10 h-10 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Generate Image</span>
                        </button>

                        <!-- Card 2: Remove Background -->
                        <button type="button" id="mobile-card-remove-bg"
                            class="flex items-center gap-3 py-2.5 px-3 min-h-[64px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('remove-bg');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'remove-bg'});}">
                            <img src="/workflows/remove-bg.jpeg" alt="Remove Background"
                                class="w-10 h-10 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Remove Background</span>
                        </button>

                        <!-- Card 3: Precise Edit -->
                        <button type="button" id="mobile-card-precise-edit"
                            class="flex items-center gap-3 py-2.5 px-3 min-h-[64px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof studioPreciseEditState!=='undefined'&&studioPreciseEditState){studioPreciseEditState.sourceItem=null;}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('edit');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'edit'});}">
                            <img src="/workflows/precise-edit.jpeg" alt="Precise Edit"
                                class="w-10 h-10 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Precise Edit</span>
                        </button>

                        <!-- Card 4: Upscale Image -->
                        <button type="button" id="mobile-card-upscale"
                            class="flex items-center gap-3 py-2.5 px-3 min-h-[64px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();event.stopPropagation();if(typeof setSelectedTemplate==='function'){setSelectedTemplate(null);}if(typeof openMobileWorkspaceDrawer==='function'){openMobileWorkspaceDrawer('upscale');}else if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'upscale'});}">
                            <img src="/workflows/upscale-image.jpeg" alt="Upscale Image"
                                class="w-10 h-10 rounded-xl overflow-hidden shrink-0 object-cover"
                                onerror="if(!this.src.includes('/public/')){this.src='/public'+(this.getAttribute('src')||'');}">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Upscale Image</span>
                        </button>
                    </div>
                </div>`;

if (indexHtml.includes(oldCardsTarget)) {
    indexHtml = indexHtml.replace(oldCardsTarget, newCardsReplacement);
    console.log('✓ 1. Updated 4 tool cards to min-h-[64px] py-2.5 px-3 gap-3 with w-10 h-10 icons');
} else {
    console.error('✗ 1. oldCardsTarget NOT found');
    process.exit(1);
}

// 2. Update Modal HTML to Ideogram-style full-screen borderless #FFFFFF layout with full-bleed image
const oldModalHtmlTarget = `    <div id="template-white-preview-modal" class="hidden fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/65 backdrop-blur-sm transition-all duration-200">
        <!-- Click backdrop to dismiss -->
        <div id="tmpl-modal-backdrop" class="absolute inset-0 -z-10"></div>

        <div class="relative bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-5xl max-h-[92vh] flex flex-col md:flex-row overflow-hidden">
            <!-- Top-left close (×) button -->
            <button type="button" id="tmpl-modal-close-btn" class="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer shadow-sm" title="Close preview">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <!-- Left Image Stage: Thin Sleek Frame (p-2.5 / 10px padding, subtle rounded-lg image corners) -->
            <div id="tmpl-modal-img-container" class="flex-1 flex items-center justify-center p-2.5 bg-neutral-100/40 overflow-hidden min-h-[300px] md:min-h-[520px] relative">
                <!-- Graceful fallback card if template image fails to load -->
                <div id="tmpl-modal-fallback" class="hidden absolute inset-0 flex flex-col items-center justify-center p-6 text-neutral-400 bg-gradient-to-br from-neutral-100 via-neutral-100 to-neutral-200 select-none">
                    <svg class="w-12 h-12 mb-2 opacity-40 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span id="tmpl-modal-fallback-title" class="text-sm font-semibold text-neutral-700 text-center px-4"></span>
                    <span class="text-xs text-neutral-400 mt-1">Template Preview</span>
                </div>
                <img id="tmpl-modal-img" src="" alt="Template Preview" class="max-h-[82vh] w-auto max-w-full rounded-lg object-contain shadow-xs relative z-10" />
            </div>

            <!-- Right Details Panel: Unified Plain White Background & Clean Hierarchy -->
            <div class="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-neutral-200 p-6 flex flex-col justify-between bg-white shrink-0">
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
            </div>
        </div>
    </div>`;

const newModalHtmlReplacement = `    <div id="template-white-preview-modal" class="hidden fixed inset-0 z-[90] md:z-[10000] bg-[#FFFFFF] md:bg-black/65 md:backdrop-blur-sm flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-8 overflow-y-auto md:overflow-hidden transition-all duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
        <!-- Click backdrop to dismiss (Desktop only) -->
        <div id="tmpl-modal-backdrop" class="hidden md:block absolute inset-0 -z-10"></div>

        <div class="relative w-full min-h-full md:min-h-0 bg-[#FFFFFF] md:bg-white text-neutral-900 rounded-none md:rounded-2xl shadow-none md:shadow-2xl border-0 md:border md:border-neutral-200 md:max-w-5xl md:max-h-[92vh] flex flex-col md:flex-row overflow-visible md:overflow-hidden">
            <!-- Top-left circular close (×) button -->
            <button type="button" id="tmpl-modal-close-btn" class="fixed top-3.5 left-4 z-40 md:absolute md:top-4 md:left-4 md:z-20 w-9 h-9 md:w-8 md:h-8 rounded-full bg-[#FFFFFF] md:bg-white/90 border border-slate-200/80 md:border-neutral-200 text-slate-800 md:text-neutral-700 hover:bg-slate-50 md:hover:bg-neutral-100 flex items-center justify-center transition-all cursor-pointer shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:shadow-sm" title="Close preview">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <!-- Image Stage: Full-bleed edge-to-edge on mobile (p-0, w-full, rounded-none), framed on desktop -->
            <div id="tmpl-modal-img-container" class="w-full md:flex-1 flex items-center justify-center p-0 md:p-2.5 bg-[#FFFFFF] md:bg-neutral-100/40 overflow-hidden min-h-0 md:min-h-[520px] relative">
                <!-- Graceful fallback card if template image fails to load -->
                <div id="tmpl-modal-fallback" class="hidden absolute inset-0 flex flex-col items-center justify-center p-6 text-neutral-400 bg-gradient-to-br from-neutral-100 via-neutral-100 to-neutral-200 select-none">
                    <svg class="w-12 h-12 mb-2 opacity-40 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span id="tmpl-modal-fallback-title" class="text-sm font-semibold text-neutral-700 text-center px-4"></span>
                    <span class="text-xs text-neutral-400 mt-1">Template Preview</span>
                </div>
                <img id="tmpl-modal-img" src="" alt="Template Preview" class="w-full max-h-[75vh] md:max-h-[82vh] md:w-auto md:max-w-full rounded-none md:rounded-lg object-contain relative z-10" />
            </div>

            <!-- Details Panel: Clean surface-matched below image (px-5 pt-4 pb-8) on mobile, right panel (p-6) on desktop -->
            <div class="w-full md:w-[360px] border-t-0 md:border-l border-neutral-200 px-5 pt-4 pb-8 md:p-6 flex flex-col justify-between bg-[#FFFFFF] md:bg-white shrink-0">
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
            </div>
        </div>
    </div>`;

if (indexHtml.includes(oldModalHtmlTarget)) {
    indexHtml = indexHtml.replace(oldModalHtmlTarget, newModalHtmlReplacement);
    console.log('✓ 2. Updated modal HTML to Ideogram-style full-screen borderless #FFFFFF layout');
} else {
    console.error('✗ 2. oldModalHtmlTarget NOT found');
    process.exit(1);
}

// 3. Update openTemplateWhitePreviewModal and closeTemplateWhitePreviewModal JS logic
const oldModalJsStart = `        function openTemplateWhitePreviewModal(tmpl, onPreciseEdit, onGenerate) {`;
const oldModalJsEnd = `            activePreviewModalTemplate = null;
            window.selectedTemplate = null;

            // Reset modal sections to default
            document.getElementById('tmpl-modal-title')?.classList.remove('hidden');
            document.getElementById('tmpl-modal-prompt-section')?.classList.remove('hidden');
            document.getElementById('tmpl-modal-scale-section')?.classList.add('hidden');
            document.getElementById('tmpl-modal-cta-btn')?.classList.remove('hidden');
        }`;

const startModalJsIdx = indexHtml.indexOf(oldModalJsStart);
const endModalJsIdx = indexHtml.indexOf(oldModalJsEnd, startModalJsIdx);

if (startModalJsIdx === -1 || endModalJsIdx === -1) {
    console.error('✗ 3. Modal JS block markers NOT found', startModalJsIdx, endModalJsIdx);
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

                // Single Full-Width Download Button (Iconless, clean text-only "Download")
                if (downloadBtn) {
                    downloadBtn.className = 'w-full h-11 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold flex items-center justify-center cursor-pointer shadow-sm active:scale-[0.99] transition-all';
                    downloadBtn.innerHTML = 'Download';
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
                    downloadBtn.innerHTML = '<svg class="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Download</span>';
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
            const downloadBtn = document.getElementById('tmpl-modal-download-btn');
            if (downloadBtn) {
                downloadBtn.className = 'h-10 px-4 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-sm font-medium inline-flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer';
                downloadBtn.innerHTML = '<svg class="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Download</span>';
            }
        }`;

indexHtml = indexHtml.substring(0, startModalJsIdx) + newModalJsCode + indexHtml.substring(endModalJsIdx + oldModalJsEnd.length);
console.log('✓ 3. Updated openTemplateWhitePreviewModal & closeTemplateWhitePreviewModal JS logic with iconless Download');

// 4. Splice new mobile workspace snippet into index.html
const snippet = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

const startMarker = '    <!-- ============================================================ -->\r\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const startMarkerLf = '    <!-- ============================================================ -->\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const endMarker = '<!-- Secret Template Admin Studio (100% Invisible to Public Users) -->';

const startIndex = indexHtml.indexOf(startMarker) !== -1 ? indexHtml.indexOf(startMarker) : indexHtml.indexOf(startMarkerLf);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('✗ 4. Snippet markers not found! start:', startIndex, 'end:', endIndex);
    process.exit(1);
}

console.log('Replacing mobile workspace snippet from index', startIndex, 'to', endIndex);
indexHtml = indexHtml.substring(0, startIndex) + snippet + '\n\n    ' + indexHtml.substring(endIndex);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('✓ 4. Successfully wrote updated index.html, final length:', indexHtml.length);
