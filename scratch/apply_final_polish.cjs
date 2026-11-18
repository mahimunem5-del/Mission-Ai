const fs = require('fs');

const indexHtmlPath = 'index.html';
let html = fs.readFileSync(indexHtmlPath, 'utf8');

console.log('Original index.html length:', html.length);

// -------------------------------------------------------------
// 1. UPDATE MASONRY GUTTER FROM gap-4 space-y-4 TO gap-1.5 space-y-1.5
// -------------------------------------------------------------
const oldGridTag = `<div id="image-home-templates-grid"
                        class="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">`;
const newGridTag = `<div id="image-home-templates-grid"
                        class="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1.5 space-y-1.5">`;

if (html.includes(oldGridTag)) {
    html = html.replace(oldGridTag, newGridTag);
    console.log('[SUCCESS] Replaced Masonry grid container gap-4 space-y-4 with gap-1.5 space-y-1.5');
} else {
    // Alternative match if whitespace differs
    const altRegex = /<div id="image-home-templates-grid"\s+class="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">/;
    if (altRegex.test(html)) {
        html = html.replace(altRegex, newGridTag);
        console.log('[SUCCESS] Replaced Masonry grid container via regex');
    } else {
        console.warn('[WARN] Could not find oldGridTag directly');
    }
}

// -------------------------------------------------------------
// 2. DEFINE THE HTML FOR WHITE PREVIEW MODAL & ADMIN STUDIO ROOT
// -------------------------------------------------------------
const whitePreviewModalHtml = `
    <!-- White-Theme Template Preview Modal -->
    <div id="template-white-preview-modal" class="hidden fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/65 backdrop-blur-sm transition-all duration-200">
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

            <!-- Left / Center Stage: Natural Aspect Ratio Image -->
            <div class="flex-1 flex items-center justify-center p-6 sm:p-8 bg-neutral-50 overflow-hidden min-h-[300px] md:min-h-[520px]">
                <img id="tmpl-modal-img" src="" alt="Template Preview" class="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-sm border border-neutral-200/60" />
            </div>

            <!-- Right Details Sidebar: w-full md:w-[360px] border-l border-neutral-200 p-6 -->
            <div class="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-neutral-200 p-6 flex flex-col justify-between bg-white shrink-0">
                <div>
                    <!-- 1. Top Download Button -->
                    <button type="button" id="tmpl-modal-download-btn" class="w-full py-2.5 px-4 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer mb-6 shadow-xs">
                        <svg class="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span>Download</span>
                    </button>

                    <!-- 2. Prompt Section with Copy Icon Button -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-neutral-900">Prompt</span>
                            <button type="button" id="tmpl-modal-copy-prompt-btn" class="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer flex items-center gap-1 text-[11px]" title="Copy prompt">
                                <svg class="copy-icon w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                </svg>
                                <svg class="check-icon hidden w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span class="copy-label">Copy</span>
                            </button>
                        </div>
                        <div class="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 max-h-52 overflow-y-auto">
                            <p id="tmpl-modal-prompt-text" class="text-xs text-neutral-700 leading-relaxed break-words select-text"></p>
                        </div>
                    </div>
                </div>

                <!-- 3. Primary Full-Width Monochrome CTA Button -->
                <div class="pt-4 border-t border-neutral-100">
                    <button type="button" id="tmpl-modal-cta-btn" class="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md">
                        <span id="tmpl-modal-cta-text">Try with Photo</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

const adminStudioHtml = `
    <!-- Secret Template Admin Studio (100% Invisible to Public Users) -->
    <div id="mestrio-admin-studio-root" class="hidden fixed inset-0 z-[99999] bg-white text-neutral-900 flex flex-col font-sans overflow-hidden">
        <!-- Security Lock Screen (Visible when unauthenticated) -->
        <div id="admin-security-lock-screen" class="hidden absolute inset-0 z-50 bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
            <div class="max-w-md w-full bg-neutral-900/95 border border-neutral-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl text-center">
                <div class="w-12 h-12 rounded-xl bg-white/10 text-white mx-auto flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <h2 class="text-xl font-bold tracking-tight mb-1 text-white">Mestrio Studio • Template CMS</h2>
                <p class="text-xs text-neutral-400 mb-6">Restricted Administrative Access</p>
                
                <form id="admin-lock-form" class="space-y-4">
                    <div>
                        <input type="password" id="admin-passcode-input" placeholder="Enter Admin Passcode" autocomplete="current-password" class="w-full px-4 py-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 text-center tracking-widest font-mono" />
                        <p id="admin-lock-error" class="hidden text-xs text-rose-400 mt-2">Invalid administrator passcode</p>
                    </div>
                    <button type="submit" id="admin-unlock-submit-btn" class="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 text-sm font-semibold transition-all cursor-pointer shadow-md">
                        Unlock CMS
                    </button>
                </form>
                
                <div class="mt-6 pt-6 border-t border-neutral-800">
                    <button type="button" id="admin-lock-exit-btn" class="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        <span>← Back to Live Studio</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- CMS Top Header Bar -->
        <header class="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">M</div>
                    <h1 class="font-bold text-base tracking-tight text-neutral-900">Mestrio Template CMS</h1>
                </div>
                <span id="admin-template-count-badge" class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                    0 Published Templates
                </span>
            </div>

            <div class="flex items-center gap-3">
                <div class="relative w-64">
                    <input type="text" id="admin-search-input" placeholder="Search templates..." class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900" />
                    <svg class="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <select id="admin-category-select" class="px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs focus:bg-white focus:outline-none">
                    <option value="All">All Categories</option>
                    <option value="Portrait & Photo">Portrait & Photo</option>
                    <option value="Avatar & Stylized">Avatar & Stylized</option>
                    <option value="Product & Branding">Product & Branding</option>
                    <option value="Logo & Typography">Logo & Typography</option>
                    <option value="Architecture & Scenery">Architecture & Scenery</option>
                </select>
                <button type="button" id="admin-btn-new-template" class="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <span>+ New Template</span>
                </button>
                <button type="button" id="admin-btn-export-json" class="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium cursor-pointer">
                    <span>Export JSON</span>
                </button>
                <button type="button" id="admin-btn-import-json" class="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium cursor-pointer">
                    <span>Import JSON</span>
                </button>
                <input type="file" id="admin-import-file-input" accept=".json" class="hidden" />
                <button type="button" id="admin-btn-exit-studio" class="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-medium cursor-pointer">
                    <span>Exit to Live Studio</span>
                </button>
            </div>
        </header>

        <!-- CMS Workspace Content -->
        <main class="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
            <div class="max-w-7xl mx-auto">
                <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
                    <div class="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                        <h2 class="text-sm font-semibold text-neutral-900">Published Design Templates</h2>
                        <span class="text-xs text-neutral-500">Live synchronized with Image Studio Masonry</span>
                    </div>
                    <!-- Streamlined Table List: thumbnail, category pill, workflow badge, prompt snippet, reorder/action buttons -->
                    <div id="admin-templates-list" class="divide-y divide-neutral-100">
                        <!-- Populated dynamically via renderAdminTemplatesList() -->
                    </div>
                </div>
            </div>
        </main>

        <!-- Composer Modal (Publish & Edit Template) -->
        <div id="admin-composer-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div class="relative bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
                    <h3 id="composer-modal-title" class="font-bold text-base text-neutral-900">Publish Design Template</h3>
                    <button type="button" id="composer-close-btn" class="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex items-center justify-center cursor-pointer">✕</button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <!-- Left Form: Streamlined (Image, Category, Target Workflow, Prompt) -->
                    <div class="md:col-span-7 space-y-5">
                        <!-- Hidden inputs for backward compatibility and auto-generation -->
                        <input type="hidden" id="composer-title-input" value="" />
                        <input type="hidden" id="composer-style-select" value="Realistic" />
                        <div id="composer-ratio-pills" class="hidden" data-ratio="1:1" data-ratio="9:16" data-ratio="16:9" data-ratio="3:4" data-ratio="4:3"></div>

                        <!-- 1. Template Image Asset -->
                        <div>
                            <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Template Image Asset</label>
                            <div id="composer-dropzone" class="border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-xl p-4 text-center cursor-pointer bg-neutral-50/60 transition-colors">
                                <input type="file" id="composer-file-input" accept="image/*" class="hidden" />
                                <div class="flex flex-col items-center justify-center gap-1.5">
                                    <svg class="w-6 h-6 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                    <span class="text-xs font-medium text-neutral-700">Drop template image here or <span class="text-neutral-900 font-semibold underline">browse</span></span>
                                    <span class="text-[11px] text-neutral-400">WebP auto-compression & natural ratio detection</span>
                                </div>
                            </div>
                            <div class="mt-2 flex items-center gap-2">
                                <span class="text-[11px] text-neutral-500">Or path/URL:</span>
                                <input type="text" id="composer-image-url-input" placeholder="/templates/my-template.jpg or https://..." class="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none" />
                            </div>
                        </div>

                        <!-- 2. Category Select -->
                        <div>
                            <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Category</label>
                            <select id="composer-category-select" class="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:bg-white focus:outline-none">
                                <option value="Portrait & Photo">Portrait & Photo</option>
                                <option value="Avatar & Stylized">Avatar & Stylized</option>
                                <option value="Product & Branding">Product & Branding</option>
                                <option value="Logo & Typography">Logo & Typography</option>
                                <option value="Architecture & Scenery">Architecture & Scenery</option>
                            </select>
                        </div>

                        <!-- 3. Smart Target Workflow Toggle -->
                        <div>
                            <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Target Workflow</label>
                            <div class="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
                                <button type="button" id="composer-workflow-edit-btn" class="py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer">
                                    Precise Edit (Try with Photo)
                                </button>
                                <button type="button" id="composer-workflow-gen-btn" class="py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer">
                                    Generate Image (Use Prompt)
                                </button>
                            </div>
                            <div class="mt-2 flex items-center justify-end">
                                <button type="button" id="composer-insert-prefix-btn" class="text-[11px] text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1 cursor-pointer">
                                    <span>+ Insert Identity-Preserving Prefix</span>
                                </button>
                            </div>
                        </div>

                        <!-- 4. Production Prompt Textarea -->
                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="text-xs font-semibold text-neutral-700">Production Prompt</label>
                                <span id="composer-prompt-char-count" class="text-[11px] text-neutral-400">0 chars</span>
                            </div>
                            <textarea id="composer-prompt-input" rows="4" placeholder="Enter full template generation or edit prompt..." class="w-full p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:bg-white focus:outline-none leading-relaxed resize-y"></textarea>
                        </div>
                    </div>

                    <!-- Right Stage: Live Interactive Masonry Card Preview (Ultra-clean style) -->
                    <div class="md:col-span-5 flex flex-col">
                        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Live Card Preview</label>
                        <div class="flex-1 bg-neutral-100 rounded-xl p-4 flex items-center justify-center">
                            <div id="composer-live-card" class="group relative rounded-lg overflow-hidden bg-white border border-neutral-200 shadow-md w-full max-w-[260px] aspect-square transition-all duration-300">
                                <img id="composer-preview-img" src="/templates/editorial-portrait.jpg" alt="Preview" class="w-full h-full object-cover block" />
                                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none">
                                    <div class="flex items-center justify-between">
                                        <span id="composer-preview-badge" class="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white border border-white/20">Photo Edit</span>
                                        <span id="composer-preview-ratio-badge" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white border border-white/20">1:1</span>
                                    </div>
                                    <div class="flex flex-col items-center gap-1 pb-1">
                                        <div id="composer-preview-title" class="hidden text-xs text-white">Title</div>
                                        <div id="composer-preview-prompt" class="hidden text-xs text-white">Prompt</div>
                                        <button type="button" id="composer-preview-cta" class="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-semibold shadow-md">
                                            Try with Photo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Buttons -->
                <div class="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3 shrink-0 bg-neutral-50/50">
                    <button type="button" id="composer-cancel-btn" class="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer">
                        Cancel
                    </button>
                    <button type="button" id="composer-save-btn" class="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-sm">
                        Publish Template
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

// Insert the modals right before </body>
if (!html.includes('id="template-white-preview-modal"') && !html.includes('id="mestrio-admin-studio-root"')) {
    html = html.replace('</body>', `${whitePreviewModalHtml}\n${adminStudioHtml}\n</body>`);
    console.log('[SUCCESS] Inserted White Preview Modal and Admin Studio HTML before </body>');
} else {
    console.log('[INFO] Modals already present in HTML');
}

// -------------------------------------------------------------
// 3. JAVASCRIPT: REPLACE renderImageHomeTemplates & ADD ADMIN STUDIO SCRIPT
// -------------------------------------------------------------

// Let's locate the existing renderImageHomeTemplates() function in index.html
const startFnMarker = 'function renderImageHomeTemplates() {';
const endFnMarker = 'function initDesignTemplatesSection() {';

const startIdx = html.indexOf(startFnMarker);
const endIdx = html.indexOf(endFnMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error('[ERROR] Could not find renderImageHomeTemplates function block');
    process.exit(1);
}

const replacementJs = `
        // Silent download helper
        function triggerSilentTemplateDownload(imgUrl, title) {
            if (!imgUrl) return;
            const cleanTitle = (title || 'template').toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
            const a = document.createElement('a');
            a.href = imgUrl;
            a.download = \`\${cleanTitle}.jpg\`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        // White-Theme Template Preview Modal Logic
        let activePreviewModalTemplate = null;

        function openTemplateWhitePreviewModal(tmpl, onPreciseEdit, onGenerate) {
            const modal = document.getElementById('template-white-preview-modal');
            if (!modal) return;
            activePreviewModalTemplate = tmpl;

            const modalImg = document.getElementById('tmpl-modal-img');
            const promptTextEl = document.getElementById('tmpl-modal-prompt-text');
            const ctaBtn = document.getElementById('tmpl-modal-cta-btn');
            const ctaText = document.getElementById('tmpl-modal-cta-text');
            const downloadBtn = document.getElementById('tmpl-modal-download-btn');
            const copyBtn = document.getElementById('tmpl-modal-copy-prompt-btn');

            const isPreciseEdit = tmpl.targetWorkflow === 'precise-edit';
            const imgUrl = tmpl.imageUrl || tmpl.img || '';
            const promptText = tmpl.prompt || '';
            const title = tmpl.title || 'Template';

            if (modalImg) modalImg.src = imgUrl;
            if (promptTextEl) promptTextEl.textContent = promptText;
            if (ctaText) {
                ctaText.textContent = isPreciseEdit ? 'Try with Photo' : 'Use Prompt';
            }

            // Top download button
            if (downloadBtn) {
                downloadBtn.onclick = (e) => {
                    e.stopPropagation();
                    triggerSilentTemplateDownload(imgUrl, title);
                    showStudioToast('Template image downloading...');
                };
            }

            // Copy prompt button
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
                        showStudioToast('Template prompt copied!');
                    }).catch(() => {
                        showStudioToast('Failed to copy prompt');
                    });
                };
            }

            // Primary CTA button inside modal
            if (ctaBtn) {
                ctaBtn.onclick = (e) => {
                    e.stopPropagation();
                    closeTemplateWhitePreviewModal();
                    if (isPreciseEdit) {
                        if (typeof onPreciseEdit === 'function') {
                            onPreciseEdit();
                        } else {
                            setImageStudioMode('workspace', { tool: 'precise-edit' });
                            const editInput = document.getElementById("studio-precise-edit-input");
                            if (editInput) {
                                editInput.value = promptText;
                                editInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                    } else {
                        if (typeof onGenerate === 'function') {
                            onGenerate();
                        } else {
                            setImageStudioMode('workspace', {
                                tool: 'generate-image',
                                prompt: promptText,
                                aspectRatio: tmpl.aspectRatio,
                                stylePreset: tmpl.stylePreset
                            });
                            const studioPrompt = document.getElementById('studio-prompt-input');
                            if (studioPrompt) {
                                studioPrompt.value = promptText;
                                studioPrompt.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                    }
                };
            }

            modal.classList.remove('hidden');
        }

        function closeTemplateWhitePreviewModal() {
            const modal = document.getElementById('template-white-preview-modal');
            if (modal) modal.classList.add('hidden');
            activePreviewModalTemplate = null;
        }

        function renderImageHomeTemplates() {
            const grid = document.getElementById('image-home-templates-grid');
            const emptyState = document.getElementById('tmpl-empty-state');
            if (!grid) return;

            grid.innerHTML = '';

            const allTemplates = (typeof getAllDesignTemplates === 'function')
                ? getAllDesignTemplates()
                : (Array.isArray(BASE_DESIGN_TEMPLATES) ? BASE_DESIGN_TEMPLATES : []);

            const query = (activeTemplateSearchQuery || '').toLowerCase().trim();

            const filteredTemplates = allTemplates.filter((tmpl) => {
                if (activeTemplateCategory && activeTemplateCategory !== 'All') {
                    if (tmpl.category !== activeTemplateCategory) {
                        return false;
                    }
                }
                if (query) {
                    const matchTitle = (tmpl.title || '').toLowerCase().includes(query);
                    const matchPrompt = (tmpl.prompt || '').toLowerCase().includes(query);
                    const matchStyle = (tmpl.stylePreset || '').toLowerCase().includes(query);
                    if (!matchTitle && !matchPrompt && !matchStyle) {
                        return false;
                    }
                }
                return true;
            });

            if (filteredTemplates.length === 0) {
                if (emptyState) emptyState.classList.remove('hidden');
                grid.classList.add('hidden');
                return;
            } else {
                if (emptyState) emptyState.classList.add('hidden');
                grid.classList.remove('hidden');
            }

            filteredTemplates.forEach((tmpl) => {
                const card = document.createElement('div');
                const ratioStr = tmpl.aspectRatio || '1:1';
                const ratioCss = ratioStr.replace(':', '/');

                // Thin Ideogram-Style Masonry Card: rounded-lg (8px), break-inside-avoid, mb-1.5, zero text/badges unhovered
                card.className = "group relative rounded-lg overflow-hidden break-inside-avoid mb-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-white/5 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer select-none";
                card.style.aspectRatio = ratioCss;

                const title = tmpl.title || 'Template';
                const displayTitle = escapeHtml(title);
                const promptText = tmpl.prompt || '';
                const displayPrompt = escapeHtml(promptText);
                const imgUrl = tmpl.imageUrl || tmpl.img || '';
                const isPreciseEdit = tmpl.targetWorkflow === 'precise-edit';

                // ULTRA-CLEAN CARD:
                // Unhovered: Only the clean template image with ZERO text, ZERO badges, ZERO gradient overlay.
                // Hovered: Top-right 2 compact frosted buttons (Download + Copy) & Bottom centered single CTA button over subtle scrim.
                card.innerHTML = \`
                    <img src="\${imgUrl}"
                         alt="\${displayTitle}"
                         loading="lazy"
                         class="w-full h-full object-cover block group-hover:scale-[1.02] transition-transform duration-300"
                         onerror="this.onerror=null; this.closest('.break-inside-avoid')?.remove();" />

                    <!-- Hover Overlay (opacity-0 by default, opacity-100 on hover) -->
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2 pointer-events-none group-hover:pointer-events-auto bg-gradient-to-t from-black/60 via-transparent to-black/30">
                        <!-- Top-Right: 2 compact frosted monochrome icon buttons -->
                        <div class="flex items-center justify-end gap-1.5">
                            <!-- Download Image icon button -->
                            <button type="button" class="btn-tmpl-download w-7 h-7 rounded-md bg-black/50 hover:bg-black/75 border border-white/20 active:scale-95 text-white transition-all backdrop-blur-md flex items-center justify-center cursor-pointer shadow-sm" title="Download image">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                            </button>
                            <!-- Copy Prompt icon button with checkmark feedback -->
                            <button type="button" class="btn-tmpl-copy w-7 h-7 rounded-md bg-black/50 hover:bg-black/75 border border-white/20 active:scale-95 text-white transition-all backdrop-blur-md flex items-center justify-center cursor-pointer shadow-sm" title="Copy prompt">
                                <svg class="copy-icon w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                </svg>
                                <svg class="check-icon hidden w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Bottom edge: Single centered primary monochrome CTA button over subtle scrim -->
                        <div class="flex items-center justify-center pb-0.5">
                            <button type="button" class="btn-tmpl-primary px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-100 active:scale-95 text-neutral-900 text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                                \${isPreciseEdit ? \`
                                    <svg class="w-3.5 h-3.5 text-neutral-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    <span>Try with Photo</span>
                                \` : \`
                                    <svg class="w-3.5 h-3.5 text-neutral-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                                    </svg>
                                    <span>Use Prompt</span>
                                \`}
                            </button>
                        </div>
                    </div>
                \`;

                // Smart Workflow Routing Handlers
                // STATIC UPLOAD BOX: Completely steady and static dropzone without any pulsing or border animation
                const executePreciseEdit = () => {
                    setImageStudioMode('workspace', { tool: 'precise-edit' });
                    if (typeof studioPreciseEditState !== 'undefined') {
                        studioPreciseEditState.sourceItem = null;
                    }
                    const dropzone = document.getElementById("studio-precise-edit-dropzone");
                    const previewWrap = document.getElementById("studio-precise-edit-preview-wrap");
                    if (dropzone) dropzone.classList.remove("hidden");
                    if (previewWrap) previewWrap.classList.add("hidden");
                    if (typeof updatePreciseEditButtonState === 'function') updatePreciseEditButtonState();

                    const editInput = document.getElementById("studio-precise-edit-input");
                    if (editInput) {
                        editInput.value = promptText;
                        editInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    if (dropzone) {
                        // Steady scroll, zero pulse / ring / blinking
                        dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    showStudioToast('Loaded into Precise Edit — upload photo to begin');
                };

                const executeGenerate = () => {
                    setImageStudioMode('workspace', {
                        tool: 'generate-image',
                        prompt: promptText,
                        aspectRatio: tmpl.aspectRatio,
                        stylePreset: tmpl.stylePreset
                    });

                    // Pre-fill prompt input
                    const studioPrompt = document.getElementById('studio-prompt-input');
                    if (studioPrompt) {
                        studioPrompt.value = promptText;
                        studioPrompt.dispatchEvent(new Event('input', { bubbles: true }));
                        setTimeout(() => studioPrompt.focus(), 60);
                    }

                    // Pre-fill style preset in ideogram-style-tags
                    if (tmpl.stylePreset) {
                        const stylePills = document.querySelectorAll('#ideogram-style-tags .ideogram-style-pill');
                        stylePills.forEach(p => {
                            const isMatch = (p.dataset.style || '').toLowerCase() === (tmpl.stylePreset || '').toLowerCase();
                            if (isMatch) {
                                stylePills.forEach(other => {
                                    other.classList.remove('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900', 'border-slate-900', 'dark:border-white');
                                    other.classList.add('border-slate-200', 'dark:border-white/10', 'bg-slate-50', 'dark:bg-white/[0.03]', 'text-slate-700', 'dark:text-slate-300');
                                });
                                p.classList.add('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900', 'border-slate-900', 'dark:border-white');
                                p.classList.remove('border-slate-200', 'dark:border-white/10', 'bg-slate-50', 'dark:bg-white/[0.03]', 'text-slate-700', 'dark:text-slate-300');
                                if (typeof imageStudioState !== 'undefined') {
                                    imageStudioState.activeStyle = p.dataset.style;
                                }
                            }
                        });
                    }

                    showStudioToast(\`Loaded "\${title}" template\`);
                };

                // Download icon button
                const downloadBtn = card.querySelector('.btn-tmpl-download');
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        triggerSilentTemplateDownload(imgUrl, title);
                        showStudioToast('Template image downloading...');
                    });
                }

                // Copy Prompt button
                const copyBtn = card.querySelector('.btn-tmpl-copy');
                if (copyBtn) {
                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(promptText).then(() => {
                            const copyIcon = copyBtn.querySelector('.copy-icon');
                            const checkIcon = copyBtn.querySelector('.check-icon');
                            if (copyIcon && checkIcon) {
                                copyIcon.classList.add('hidden');
                                checkIcon.classList.remove('hidden');
                                setTimeout(() => {
                                    copyIcon.classList.remove('hidden');
                                    checkIcon.classList.add('hidden');
                                }, 1800);
                            }
                            showStudioToast('Template prompt copied!');
                        }).catch(() => {
                            showStudioToast('Failed to copy prompt');
                        });
                    });
                }

                // Primary CTA button on hover
                const primaryBtn = card.querySelector('.btn-tmpl-primary');
                if (primaryBtn) {
                    primaryBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isPreciseEdit) {
                            executePreciseEdit();
                        } else {
                            executeGenerate();
                        }
                    });
                }

                // CLICKING THE CARD OPENS THE WHITE-THEME PREVIEW MODAL
                card.addEventListener('click', (e) => {
                    if (e.target.closest('button')) return;
                    openTemplateWhitePreviewModal(tmpl, executePreciseEdit, executeGenerate);
                });

                grid.appendChild(card);
            });
        }
`;

html = html.slice(0, startIdx) + replacementJs + '\n\n        ' + html.slice(endIdx);
console.log('[SUCCESS] Replaced renderImageHomeTemplates with clean card + preview modal routing');

// -------------------------------------------------------------
// 4. ADD SECRET ADMIN STUDIO CMS JAVASCRIPT & EVENT LISTENERS
// -------------------------------------------------------------
const adminStudioJs = `
        // =================================================================
        // SECRET TEMPLATE ADMIN STUDIO CORE CONTROLLER & STORAGE ENGINE
        // =================================================================
        const ADMIN_PASSCODE = '26135062';
        const ADMIN_SESSION_KEY = 'mestrio_admin_auth';

        function saveAllDesignTemplates(templates) {
            try {
                localStorage.setItem(STORAGE_KEY_ADMIN_TEMPLATES, JSON.stringify(templates));
                if (typeof renderImageHomeTemplates === 'function') {
                    renderImageHomeTemplates();
                }
            } catch (e) {
                console.error('Failed to save all templates to localStorage:', e);
            }
        }
        window.saveAllDesignTemplates = saveAllDesignTemplates;

        // Image compression helper (WebP)
        function compressImageToWebP(file, maxWidth = 1600, quality = 0.85) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        let width = img.naturalWidth || img.width;
                        let height = img.naturalHeight || img.height;
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const webpUrl = canvas.toDataURL('image/webp', quality);
                        const detectedRatio = detectClosestAspectRatio(width, height);
                        resolve({ dataUrl: webpUrl, width, height, detectedRatio });
                    };
                    img.onerror = reject;
                    img.src = e.target.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // Automatic natural aspect ratio detection
        function detectClosestAspectRatio(width, height) {
            if (!width || !height) return { label: '1:1', ratio: 1 };
            const r = width / height;
            const targets = [
                { label: '9:16', ratio: 9 / 16 },
                { label: '3:4', ratio: 3 / 4 },
                { label: '1:1', ratio: 1 },
                { label: '4:3', ratio: 4 / 3 },
                { label: '16:9', ratio: 16 / 9 }
            ];
            let closest = targets[0];
            let minDiff = Math.abs(r - targets[0].ratio);
            for (let i = 1; i < targets.length; i++) {
                const diff = Math.abs(r - targets[i].ratio);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = targets[i];
                }
            }
            return closest;
        }

        let adminEditingTemplateId = null;
        let adminCurrentRatio = '1:1';
        let adminCurrentWorkflow = 'precise-edit';
        let adminSelectedImage = '/templates/editorial-portrait.jpg';

        function checkAdminStudioRoute() {
            const hash = window.location.hash || '';
            const search = window.location.search || '';
            const isAdmin = hash === '#/admin/templates' || hash.startsWith('#/admin/templates') || search.includes('admin=templates');
            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            const lockScreen = document.getElementById('admin-security-lock-screen');
            if (!adminRoot) return;

            if (isAdmin) {
                adminRoot.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                const isAuth = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
                if (isAuth) {
                    if (lockScreen) lockScreen.classList.add('hidden');
                    renderAdminTemplatesList();
                } else {
                    if (lockScreen) lockScreen.classList.remove('hidden');
                    const passInput = document.getElementById('admin-passcode-input');
                    if (passInput) {
                        passInput.value = '';
                        setTimeout(() => passInput.focus(), 100);
                    }
                }
            } else {
                adminRoot.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }

        function exitAdminStudioToLive() {
            if (window.location.hash.startsWith('#/admin/templates')) {
                window.location.hash = '';
            }
            if (window.location.search.includes('admin=templates')) {
                const url = new URL(window.location.href);
                url.searchParams.delete('admin');
                window.history.replaceState({}, '', url.pathname + url.hash);
            }
            const adminRoot = document.getElementById('mestrio-admin-studio-root');
            if (adminRoot) adminRoot.classList.add('hidden');
            document.body.style.overflow = '';
            if (typeof renderImageHomeTemplates === 'function') {
                renderImageHomeTemplates();
            }
        }

        function setComposerWorkflow(workflow) {
            adminCurrentWorkflow = workflow;
            const editBtn = document.getElementById('composer-workflow-edit-btn');
            const genBtn = document.getElementById('composer-workflow-gen-btn');
            const ctaBtn = document.getElementById('composer-preview-cta');
            const badge = document.getElementById('composer-preview-badge');

            if (workflow === 'precise-edit') {
                if (editBtn) {
                    editBtn.className = 'py-2 px-3 rounded-lg text-xs font-semibold bg-white text-neutral-900 shadow-xs cursor-pointer';
                }
                if (genBtn) {
                    genBtn.className = 'py-2 px-3 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer';
                }
                if (ctaBtn) ctaBtn.textContent = 'Try with Photo';
                if (badge) badge.textContent = 'Photo Edit';
            } else {
                if (genBtn) {
                    genBtn.className = 'py-2 px-3 rounded-lg text-xs font-semibold bg-white text-neutral-900 shadow-xs cursor-pointer';
                }
                if (editBtn) {
                    editBtn.className = 'py-2 px-3 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer';
                }
                if (ctaBtn) ctaBtn.textContent = 'Use Prompt';
                if (badge) badge.textContent = 'Generate';
            }
        }

        function updateComposerLiveCard() {
            const previewImg = document.getElementById('composer-preview-img');
            const previewPrompt = document.getElementById('composer-preview-prompt');
            const previewRatio = document.getElementById('composer-preview-ratio-badge');
            const liveCard = document.getElementById('composer-live-card');
            const promptInput = document.getElementById('composer-prompt-input');

            if (previewImg && adminSelectedImage) previewImg.src = adminSelectedImage;
            if (previewPrompt && promptInput) previewPrompt.textContent = promptInput.value || 'Prompt preview';
            if (previewRatio) previewRatio.textContent = adminCurrentRatio;
            if (liveCard) {
                liveCard.style.aspectRatio = (adminCurrentRatio || '1:1').replace(':', '/');
            }
        }

        function openAdminComposer(template = null) {
            const modal = document.getElementById('admin-composer-modal');
            const modalTitle = document.getElementById('composer-modal-title');
            const promptInput = document.getElementById('composer-prompt-input');
            const charCount = document.getElementById('composer-prompt-char-count');
            const categorySelect = document.getElementById('composer-category-select');
            const urlInput = document.getElementById('composer-image-url-input');
            const titleInput = document.getElementById('composer-title-input');

            if (!modal) return;

            if (template) {
                adminEditingTemplateId = template.id;
                if (modalTitle) modalTitle.textContent = 'Edit Design Template';
                if (promptInput) promptInput.value = template.prompt || '';
                if (categorySelect) categorySelect.value = template.category || 'Portrait & Photo';
                if (urlInput) urlInput.value = template.imageUrl || '';
                if (titleInput) titleInput.value = template.title || '';
                adminSelectedImage = template.imageUrl || '/templates/editorial-portrait.jpg';
                adminCurrentRatio = template.aspectRatio || '1:1';
                setComposerWorkflow(template.targetWorkflow || 'precise-edit');
            } else {
                adminEditingTemplateId = null;
                if (modalTitle) modalTitle.textContent = 'Publish Design Template';
                if (promptInput) promptInput.value = '';
                if (categorySelect) categorySelect.value = 'Portrait & Photo';
                if (urlInput) urlInput.value = '';
                if (titleInput) titleInput.value = '';
                adminSelectedImage = '/templates/editorial-portrait.jpg';
                adminCurrentRatio = '1:1';
                setComposerWorkflow('precise-edit');
            }

            if (charCount && promptInput) {
                charCount.textContent = \`\${promptInput.value.length} chars\`;
            }
            updateComposerLiveCard();
            modal.classList.remove('hidden');
        }

        function closeAdminComposer() {
            const modal = document.getElementById('admin-composer-modal');
            if (modal) modal.classList.add('hidden');
            adminEditingTemplateId = null;
        }

        function renderAdminTemplatesList() {
            const listEl = document.getElementById('admin-templates-list');
            const countBadge = document.getElementById('admin-template-count-badge');
            const searchInput = document.getElementById('admin-search-input');
            const catSelect = document.getElementById('admin-category-select');
            if (!listEl) return;

            const allTemplates = (typeof getAllDesignTemplates === 'function')
                ? getAllDesignTemplates()
                : (Array.isArray(BASE_DESIGN_TEMPLATES) ? BASE_DESIGN_TEMPLATES : []);

            if (countBadge) {
                countBadge.textContent = \`\${allTemplates.length} Published Templates\`;
            }

            const query = (searchInput?.value || '').toLowerCase().trim();
            const filterCat = catSelect?.value || 'All';

            const filtered = allTemplates.filter((t) => {
                if (filterCat !== 'All' && t.category !== filterCat) return false;
                if (query) {
                    const mPrompt = (t.prompt || '').toLowerCase().includes(query);
                    const mTitle = (t.title || '').toLowerCase().includes(query);
                    if (!mPrompt && !mTitle) return false;
                }
                return true;
            });

            if (filtered.length === 0) {
                listEl.innerHTML = \`
                    <div class="p-8 text-center text-xs text-neutral-400">
                        No templates found matching your criteria.
                    </div>
                \`;
                return;
            }

            // Streamlined rows: ONLY thumbnail, category pill, workflow badge, prompt snippet, action buttons (Reorder, Edit, Duplicate, Delete).
            // Zero title text, zero style preset / aspect ratio badges on the row.
            listEl.innerHTML = '';
            filtered.forEach((tmpl, index) => {
                const row = document.createElement('div');
                row.className = "p-4 flex items-center justify-between hover:bg-neutral-50/80 transition-colors gap-4";

                const isPreciseEdit = tmpl.targetWorkflow === 'precise-edit';
                const imgUrl = tmpl.imageUrl || tmpl.img || '';
                const promptSnippet = escapeHtml(tmpl.prompt || 'No prompt specified');

                row.innerHTML = \`
                    <div class="flex items-center gap-4 min-w-0 flex-1">
                        <!-- Reorder controls (Up / Down) -->
                        <div class="flex flex-col gap-1 shrink-0">
                            <button type="button" class="btn-reorder-up p-1 rounded hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 text-[10px] cursor-pointer \${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Up">▲</button>
                            <button type="button" class="btn-reorder-down p-1 rounded hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 text-[10px] cursor-pointer \${index === filtered.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Down">▼</button>
                        </div>

                        <!-- Thumbnail -->
                        <div class="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                            <img src="\${imgUrl}" alt="Template" class="w-full h-full object-cover" onerror="this.src='/templates/editorial-portrait.jpg';" />
                        </div>

                        <!-- Metadata: Category pill + Workflow badge + Prompt snippet -->
                        <div class="min-w-0 flex-1 space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                                    \${escapeHtml(tmpl.category || 'General')}
                                </span>
                                <span class="px-2 py-0.5 rounded-full text-[11px] font-medium \${isPreciseEdit ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-900'}">
                                    \${isPreciseEdit ? 'Precise Edit' : 'Generate'}
                                </span>
                            </div>
                            <p class="text-xs text-neutral-600 line-clamp-1 truncate font-mono">
                                "\${promptSnippet}"
                            </p>
                        </div>
                    </div>

                    <!-- Row Action Buttons -->
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" class="btn-tmpl-edit px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-xs font-medium text-neutral-700 cursor-pointer">
                            Edit
                        </button>
                        <button type="button" class="btn-tmpl-duplicate px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-xs font-medium text-neutral-700 cursor-pointer">
                            Duplicate
                        </button>
                        <button type="button" class="btn-tmpl-delete px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-xs font-medium text-rose-600 cursor-pointer">
                            Delete
                        </button>
                    </div>
                \`;

                // Row action listeners
                const reorderUpBtn = row.querySelector('.btn-reorder-up');
                if (reorderUpBtn && index > 0) {
                    reorderUpBtn.addEventListener('click', () => {
                        const all = getAllDesignTemplates();
                        const realIdx = all.findIndex(t => t.id === tmpl.id);
                        if (realIdx > 0) {
                            const tmp = all[realIdx];
                            all[realIdx] = all[realIdx - 1];
                            all[realIdx - 1] = tmp;
                            saveAllDesignTemplates(all);
                            renderAdminTemplatesList();
                        }
                    });
                }

                const reorderDownBtn = row.querySelector('.btn-reorder-down');
                if (reorderDownBtn && index < filtered.length - 1) {
                    reorderDownBtn.addEventListener('click', () => {
                        const all = getAllDesignTemplates();
                        const realIdx = all.findIndex(t => t.id === tmpl.id);
                        if (realIdx >= 0 && realIdx < all.length - 1) {
                            const tmp = all[realIdx];
                            all[realIdx] = all[realIdx + 1];
                            all[realIdx + 1] = tmp;
                            saveAllDesignTemplates(all);
                            renderAdminTemplatesList();
                        }
                    });
                }

                const editBtn = row.querySelector('.btn-tmpl-edit');
                if (editBtn) {
                    editBtn.addEventListener('click', () => {
                        openAdminComposer(tmpl);
                    });
                }

                const duplicateBtn = row.querySelector('.btn-tmpl-duplicate');
                if (duplicateBtn) {
                    duplicateBtn.addEventListener('click', () => {
                        const copy = {
                            ...tmpl,
                            id: 'tmpl-custom-' + Date.now(),
                            title: (tmpl.title || tmpl.category) + ' (Copy)',
                            createdAt: new Date().toISOString()
                        };
                        saveCustomDesignTemplate(copy);
                        renderAdminTemplatesList();
                        showStudioToast('Template duplicated');
                    });
                }

                const deleteBtn = row.querySelector('.btn-tmpl-delete');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        if (confirm('Delete this template permanently?')) {
                            deleteCustomDesignTemplate(tmpl.id);
                            renderAdminTemplatesList();
                            showStudioToast('Template deleted');
                        }
                    });
                }

                listEl.appendChild(row);
            });
        }

        // Initialize Admin Studio Listeners
        function initAdminStudioModule() {
            // Check secret hash on load & hashchange
            window.addEventListener('hashchange', checkAdminStudioRoute);
            checkAdminStudioRoute();

            // Lock screen form submit
            const lockForm = document.getElementById('admin-lock-form');
            const passInput = document.getElementById('admin-passcode-input');
            const lockError = document.getElementById('admin-lock-error');
            const lockScreen = document.getElementById('admin-security-lock-screen');

            if (lockForm) {
                lockForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if ((passInput?.value || '').trim() === ADMIN_PASSCODE) {
                        sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
                        if (lockError) lockError.classList.add('hidden');
                        if (lockScreen) lockScreen.classList.add('hidden');
                        renderAdminTemplatesList();
                    } else {
                        if (lockError) lockError.classList.remove('hidden');
                        if (passInput) passInput.value = '';
                    }
                });
            }

            // Lock exit button
            const lockExitBtn = document.getElementById('admin-lock-exit-btn');
            if (lockExitBtn) lockExitBtn.addEventListener('click', exitAdminStudioToLive);

            // CMS Header Exit button
            const exitBtn = document.getElementById('admin-btn-exit-studio');
            if (exitBtn) exitBtn.addEventListener('click', exitAdminStudioToLive);

            // Search & Category filters
            const searchInput = document.getElementById('admin-search-input');
            if (searchInput) searchInput.addEventListener('input', renderAdminTemplatesList);

            const catSelect = document.getElementById('admin-category-select');
            if (catSelect) catSelect.addEventListener('change', renderAdminTemplatesList);

            // New Template button
            const newBtn = document.getElementById('admin-btn-new-template');
            if (newBtn) newBtn.addEventListener('click', () => openAdminComposer());

            // Export JSON
            const exportBtn = document.getElementById('admin-btn-export-json');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    const all = getAllDesignTemplates();
                    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'mestrio-templates-export.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });
            }

            // Import JSON
            const importBtn = document.getElementById('admin-btn-import-json');
            const importFileInput = document.getElementById('admin-import-file-input');
            if (importBtn && importFileInput) {
                importBtn.addEventListener('click', () => importFileInput.click());
                importFileInput.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        try {
                            const parsed = JSON.parse(evt.target.result);
                            if (Array.isArray(parsed)) {
                                saveAllDesignTemplates(parsed);
                                renderAdminTemplatesList();
                                showStudioToast(\`Successfully imported \${parsed.length} templates\`);
                            } else {
                                alert('Invalid JSON structure');
                            }
                        } catch (err) {
                            alert('Failed to parse JSON file');
                        }
                    };
                    reader.readAsText(file);
                });
            }

            // Composer modal close & cancel
            const composerCloseBtn = document.getElementById('composer-close-btn');
            if (composerCloseBtn) composerCloseBtn.addEventListener('click', closeAdminComposer);

            const composerCancelBtn = document.getElementById('composer-cancel-btn');
            if (composerCancelBtn) composerCancelBtn.addEventListener('click', closeAdminComposer);

            // Composer target workflow toggle
            const workflowEditBtn = document.getElementById('composer-workflow-edit-btn');
            if (workflowEditBtn) {
                workflowEditBtn.addEventListener('click', () => setComposerWorkflow('precise-edit'));
            }

            const workflowGenBtn = document.getElementById('composer-workflow-gen-btn');
            if (workflowGenBtn) {
                workflowGenBtn.addEventListener('click', () => setComposerWorkflow('generate'));
            }

            // Composer Category change: auto-select target workflow
            const composerCatSelect = document.getElementById('composer-category-select');
            if (composerCatSelect) {
                composerCatSelect.addEventListener('change', () => {
                    const cat = composerCatSelect.value;
                    if (cat === 'Portrait & Photo' || cat === 'Avatar & Stylized') {
                        setComposerWorkflow('precise-edit');
                    } else {
                        setComposerWorkflow('generate');
                    }
                });
            }

            // 1-Click "Insert Identity-Preserving Prefix"
            const prefixBtn = document.getElementById('composer-insert-prefix-btn');
            if (prefixBtn) {
                prefixBtn.addEventListener('click', () => {
                    const promptInput = document.getElementById('composer-prompt-input');
                    const charCount = document.getElementById('composer-prompt-char-count');
                    const prefix = "Keep the exact facial features, identity, and likeness of the person in the uploaded photo, and ";
                    if (promptInput) {
                        if (!promptInput.value.includes(prefix.trim())) {
                            promptInput.value = prefix + promptInput.value;
                        }
                        if (charCount) charCount.textContent = \`\${promptInput.value.length} chars\`;
                        updateComposerLiveCard();
                    }
                });
            }

            // Prompt live input
            const promptInput = document.getElementById('composer-prompt-input');
            if (promptInput) {
                promptInput.addEventListener('input', () => {
                    const charCount = document.getElementById('composer-prompt-char-count');
                    if (charCount) charCount.textContent = \`\${promptInput.value.length} chars\`;
                    updateComposerLiveCard();
                });
            }

            // Image file dropzone & input
            const dropzone = document.getElementById('composer-dropzone');
            const fileInput = document.getElementById('composer-file-input');
            const urlInput = document.getElementById('composer-image-url-input');

            if (dropzone && fileInput) {
                dropzone.addEventListener('click', () => fileInput.click());
                dropzone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropzone.classList.add('border-neutral-900', 'bg-neutral-100');
                });
                dropzone.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    dropzone.classList.remove('border-neutral-900', 'bg-neutral-100');
                });
                dropzone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropzone.classList.remove('border-neutral-900', 'bg-neutral-100');
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processComposerFile(e.dataTransfer.files[0]);
                    }
                });
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        processComposerFile(e.target.files[0]);
                    }
                });
            }

            function processComposerFile(file) {
                compressImageToWebP(file).then(({ dataUrl, detectedRatio }) => {
                    adminSelectedImage = dataUrl;
                    if (detectedRatio && detectedRatio.label) {
                        adminCurrentRatio = detectedRatio.label;
                    }
                    if (urlInput) urlInput.value = '';
                    updateComposerLiveCard();
                }).catch(() => {
                    alert('Failed to process image');
                });
            }

            if (urlInput) {
                urlInput.addEventListener('input', () => {
                    if (urlInput.value.trim()) {
                        adminSelectedImage = urlInput.value.trim();
                        updateComposerLiveCard();
                    }
                });
            }

            // Composer Save Button
            const saveBtn = document.getElementById('composer-save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    const promptVal = (promptInput?.value || '').trim();
                    const catVal = composerCatSelect?.value || 'Portrait & Photo';
                    const customTitle = document.getElementById('composer-title-input')?.value.trim();
                    const titleVal = customTitle || (catVal + ' Template');

                    if (!promptVal) {
                        alert('Please enter a production prompt');
                        return;
                    }

                    const templateData = {
                        id: adminEditingTemplateId || ('tmpl-custom-' + Date.now()),
                        title: titleVal,
                        category: catVal,
                        targetWorkflow: adminCurrentWorkflow,
                        aspectRatio: adminCurrentRatio || '1:1',
                        stylePreset: 'Realistic',
                        prompt: promptVal,
                        imageUrl: adminSelectedImage,
                        featured: false,
                        createdAt: new Date().toISOString()
                    };

                    saveCustomDesignTemplate(templateData);
                    closeAdminComposer();
                    renderAdminTemplatesList();
                    showStudioToast(adminEditingTemplateId ? 'Template updated' : 'Template published');
                });
            }

            // White Preview Modal close button & backdrop
            const modalCloseBtn = document.getElementById('tmpl-modal-close-btn');
            if (modalCloseBtn) modalCloseBtn.onclick = closeTemplateWhitePreviewModal;
            const modalBackdrop = document.getElementById('tmpl-modal-backdrop');
            if (modalBackdrop) modalBackdrop.onclick = closeTemplateWhitePreviewModal;
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeTemplateWhitePreviewModal();
                    closeAdminComposer();
                }
            });
        }
`;

// Insert adminStudioJs into index.html right before </script>
const scriptEndTag = '</script>';
const lastScriptIdx = html.lastIndexOf(scriptEndTag);
if (lastScriptIdx !== -1) {
    // Also make sure initAdminStudioModule is invoked on DOMContentLoaded / window load
    const invocation = `
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAdminStudioModule);
        } else {
            initAdminStudioModule();
        }
    `;
    html = html.slice(0, lastScriptIdx) + '\n' + adminStudioJs + '\n' + invocation + '\n' + html.slice(lastScriptIdx);
    console.log('[SUCCESS] Injected Admin Studio JS before </script>');
}

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Successfully written updated index.html! New length:', html.length);
