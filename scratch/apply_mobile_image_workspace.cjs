const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS rules in <style>
const cssTarget = `/* ─── Dedicated Standalone Mobile Homepage UI (< 768px) ─── */`;

const mobileImageCss = `/* ─── Dedicated Standalone Mobile Images Workspace UI (< 768px) ─── */
        @media (min-width: 768px) {
            #mobile-image-home-container,
            #mobile-image-composer-container {
                display: none !important;
            }
        }

        @media (max-width: 767px) {
            /* Inside #image-home-view, hide desktop backdrop & desktop main content on mobile */
            #image-home-view > .pointer-events-none,
            #image-home-view > .flex-1.w-full.pb-16 {
                display: none !important;
            }

            #mobile-image-home-container {
                display: flex !important;
                flex-direction: column !important;
                background-color: #FFFFFF !important;
                min-height: 100dvh;
            }

            #mobile-image-composer-container {
                display: block !important;
            }

            #mobile-image-home-container.hidden,
            #mobile-image-composer-container.hidden {
                display: none !important;
            }

            body.image-home-active #image-home-view {
                background-color: #FFFFFF !important;
            }
        }
        `;

if (!content.includes('/* ─── Dedicated Standalone Mobile Images Workspace UI (< 768px) ─── */')) {
    content = content.replace(cssTarget, mobileImageCss + '\n        ' + cssTarget);
    console.log('Added CSS for Mobile Images Workspace.');
} else {
    console.log('CSS already present.');
}

// 2. Style #mobile-menu-btn in #top-nav-header to match ChatGPT 2-line staggered button
const newMobileMenuBtn = `<button id="mobile-menu-btn"
                    class="md:hidden w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                    title="Open Menu" aria-label="Open sidebar menu">
                    <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="4" y1="7.5" x2="20" y2="7.5"></line>
                        <line x1="4" y1="14.5" x2="13" y2="14.5"></line>
                    </svg>
                </button>`;

if (content.includes('id="mobile-menu-btn"')) {
    const idx = content.indexOf('<button id="mobile-menu-btn"');
    if (idx !== -1) {
        const endIdx = content.indexOf('</button>', idx) + 9;
        content = content.slice(0, idx) + newMobileMenuBtn + content.slice(endIdx);
        console.log('Updated #mobile-menu-btn to ChatGPT 2-line staggered style.');
    }
}

// 3. Insert #mobile-image-home-container and #mobile-image-composer-container inside #image-home-view
const mobileImageMarkup = `
            <!-- ============================================================ -->
            <!-- DEDICATED STANDALONE MOBILE IMAGES WORKSPACE UI (< 768px, block md:hidden) -->
            <!-- ============================================================ -->
            <div id="mobile-image-home-container"
                class="block md:hidden min-h-[100dvh] w-full bg-[#FFFFFF] flex flex-col justify-start overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif] antialiased relative z-20 pb-28">

                <!-- 1. Persistent Top-Left Sidebar Toggle Button (ChatGPT-style 2-line staggered icon) -->
                <button type="button" id="mobile-image-sidebar-btn"
                    class="fixed top-3.5 left-4 z-40 w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer md:hidden"
                    aria-label="Open sidebar menu" title="Open Menu">
                    <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="4" y1="7.5" x2="20" y2="7.5"></line>
                        <line x1="4" y1="14.5" x2="13" y2="14.5"></line>
                    </svg>
                </button>

                <!-- 2. Centered Image Workspace Header (pt-14 pb-4 px-4 text-center) -->
                <div class="pt-14 pb-4 px-4 text-center select-none">
                    <h1 class="text-[24px] font-bold tracking-[-0.02em] text-slate-900 leading-tight">
                        Image Workspace
                    </h1>
                    <p class="text-[13.5px] text-slate-500 mt-1">
                        Create, edit, and enhance images with AI
                    </p>
                </div>

                <!-- 3. Compact 2 x 2 Workspace Cards (Square Thumbnail + Title Only, NO Subtitles) -->
                <div class="px-4 mt-2 w-full select-none">
                    <div class="grid grid-cols-2 gap-2.5 w-full">
                        <!-- Card 1: Generate Image -->
                        <button type="button"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'generate-image'});}">
                            <img src="/workflows/generate-image.jpeg" alt="Generate Image"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Generate Image</span>
                        </button>

                        <!-- Card 2: Remove Background -->
                        <button type="button"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'remove-background'});}">
                            <img src="/workflows/remove-bg.jpeg" alt="Remove Background"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Remove Background</span>
                        </button>

                        <!-- Card 3: Precise Edit -->
                        <button type="button"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();if(typeof studioPreciseEditState!=='undefined'&&studioPreciseEditState){studioPreciseEditState.sourceItem=null;}if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'precise-edit'});}">
                            <img src="/workflows/precise-edit.jpeg" alt="Precise Edit"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Precise Edit</span>
                        </button>

                        <!-- Card 4: Upscale Image -->
                        <button type="button"
                            class="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-[0.98] transition-all cursor-pointer text-left w-full select-none"
                            onclick="event.preventDefault();if(typeof setImageStudioMode==='function'){setImageStudioMode('workspace',{tool:'upscale-image'});}">
                            <img src="/workflows/upscale-image.jpeg" alt="Upscale Image"
                                class="w-11 h-11 rounded-xl overflow-hidden shrink-0 object-cover">
                            <span class="text-[13px] font-semibold leading-tight text-slate-900">Upscale Image</span>
                        </button>
                    </div>
                </div>

                <!-- 4. Filter-Free Templates Gallery (1000052242.jpg Card Shape & Style) -->
                <div class="mt-6 px-4 pb-28 w-full select-none">
                    <h2 class="text-[16px] font-semibold text-slate-900 mb-3">Templates</h2>
                    <div id="mobile-image-home-templates-grid" class="grid grid-cols-2 gap-3 w-full">
                        <!-- Dynamically populated via renderMobileImageHomeTemplates() -->
                    </div>
                </div>

            </div>

            <!-- 5. Always-Visible ChatGPT-Style Floating Pill Prompt Box (1000052239.jpg) -->
            <div id="mobile-image-composer-container"
                class="fixed bottom-3 left-3 right-3 z-30 md:hidden font-['Plus_Jakarta_Sans',sans-serif]">

                <!-- Hidden File Input for Reference Upload -->
                <input type="file" id="mobile-image-file-input" accept="image/*" class="hidden">

                <!-- Compact Reference Preview Chip (shown if reference attached) -->
                <div id="mobile-image-ref-preview" class="hidden mb-1.5 flex items-center">
                    <div class="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm">
                        <img id="mobile-image-ref-thumb" src="" alt="Ref" class="w-8 h-8 rounded-lg object-cover">
                        <span id="mobile-image-ref-filename" class="text-xs text-slate-600 max-w-[140px] truncate font-medium">reference.png</span>
                        <button type="button" id="mobile-image-ref-remove" class="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs ml-1 cursor-pointer" title="Remove">✕</button>
                    </div>
                </div>

                <!-- Options Popover (Triggered by + button) -->
                <div id="mobile-image-attach-popover"
                    class="hidden absolute bottom-[62px] left-0 w-64 bg-white/95 dark:bg-[#1E2024]/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_12px_36px_rgba(15,23,42,0.12)] p-1.5 z-50 select-none animate-in fade-in zoom-in-95 duration-150">
                    <div class="space-y-0.5">
                        <button type="button" id="mobile-image-opt-ref"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-[13.5px] font-medium transition-colors text-left cursor-pointer">
                            <svg class="w-4 h-4 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                            <span>Add reference photo</span>
                        </button>
                        <button type="button" id="mobile-image-opt-gen"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-[13.5px] font-medium transition-colors text-left cursor-pointer">
                            <svg class="w-4 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                            </svg>
                            <span>Generate Image</span>
                        </button>
                        <button type="button" id="mobile-image-opt-rembg"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-[13.5px] font-medium transition-colors text-left cursor-pointer">
                            <svg class="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M7 21h10"/>
                                <rect width="18" height="14" x="3" y="3" rx="2"/>
                            </svg>
                            <span>Remove Background</span>
                        </button>
                        <button type="button" id="mobile-image-opt-edit"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-[13.5px] font-medium transition-colors text-left cursor-pointer">
                            <svg class="w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                            </svg>
                            <span>Precise Edit</span>
                        </button>
                        <button type="button" id="mobile-image-opt-upscale"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-[13.5px] font-medium transition-colors text-left cursor-pointer">
                            <svg class="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="17 11 12 6 7 11"/>
                                <polyline points="17 18 12 13 7 18"/>
                            </svg>
                            <span>Upscale Image</span>
                        </button>
                    </div>
                </div>

                <!-- Capsule Pill Shell -->
                <div class="h-[54px] rounded-full bg-white border border-slate-200/90 shadow-[0_8px_28px_rgba(15,23,42,0.10)] px-2.5 flex items-center gap-2">
                    <!-- Left + Button -->
                    <button type="button" id="mobile-image-attach-btn"
                        class="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                        aria-label="Options or upload reference" title="Options">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>

                    <!-- Center Single-Line Input -->
                    <input type="text" id="mobile-image-prompt-input"
                        placeholder="Create image..."
                        autocomplete="off"
                        class="flex-1 min-w-0 bg-transparent border-0 focus:ring-0 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none">

                    <!-- Right Microphone (🎤) Button -->
                    <button type="button" id="mobile-image-mic-btn"
                        class="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                        aria-label="Voice input" title="Voice Input">
                        <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                    </button>

                    <!-- Right Circular Send (↑) Button -->
                    <button type="button" id="mobile-image-submit-btn" disabled
                        class="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Generate Image" title="Generate">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
`;

if (!content.includes('id="mobile-image-home-container"')) {
    const startIdx = content.indexOf('id="image-home-view"');
    if (startIdx !== -1) {
        const closeIdx = content.indexOf('>', startIdx);
        if (closeIdx !== -1) {
            content = content.slice(0, closeIdx + 1) + '\r\n' + mobileImageMarkup + content.slice(closeIdx + 1);
            console.log('Inserted #mobile-image-home-container and composer inside #image-home-view.');
        } else {
            console.error('Closing > of image-home-view not found!');
            process.exit(1);
        }
    } else {
        console.error('id="image-home-view" not found!');
        process.exit(1);
    }
} else {
    console.log('#mobile-image-home-container already present.');
}

// 4. Add JavaScript Controller for Mobile Images Workspace
const jsController = `
        // ═══════════════════════════════════════════════════════════════════
        // MOBILE IMAGES WORKSPACE CONTROLLER (< 768px)
        // ═══════════════════════════════════════════════════════════════════
        window.mobileImageRefDataUrl = null;
        window.mobileImageRefName = null;

        function renderMobileImageHomeTemplates() {
            const grid = document.getElementById('mobile-image-home-templates-grid');
            if (!grid) return;
            grid.innerHTML = '';

            const allTemplates = (typeof getAllDesignTemplates === 'function')
                ? getAllDesignTemplates()
                : (Array.isArray(BASE_DESIGN_TEMPLATES) ? BASE_DESIGN_TEMPLATES : []);

            allTemplates.forEach((tmpl) => {
                const card = document.createElement('div');
                card.className = "aspect-[3/3.6] rounded-2xl overflow-hidden relative bg-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.04)] cursor-pointer active:scale-[0.98] transition-all select-none group";

                const title = tmpl.title || 'Template';
                const displayTitle = (typeof escapeHtml === 'function') ? escapeHtml(title) : title;
                const imgUrl = tmpl.imageUrl || tmpl.img || '';
                const promptText = tmpl.prompt || '';

                card.innerHTML = \`
                    <div class="tmpl-card-placeholder absolute inset-0 flex flex-col items-center justify-center p-3 text-neutral-400 bg-neutral-100 select-none">
                        <svg class="w-6 h-6 mb-1.5 opacity-40 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <span class="text-[11px] font-medium text-neutral-500 text-center line-clamp-1 px-2">\${displayTitle}</span>
                    </div>
                    \${imgUrl ? \`
                    <img src="\${imgUrl}" alt="\${displayTitle}" loading="lazy" class="absolute inset-0 w-full h-full object-cover block z-[1]"
                        onload="this.previousElementSibling?.classList.add('hidden');"
                        onerror="this.style.display='none';" />
                    \` : ''}
                    <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none z-[2]"></div>
                    <div class="absolute bottom-2.5 left-3 right-3 z-[3] pointer-events-none">
                        <span class="text-[13px] font-semibold text-white leading-snug line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">\${displayTitle}</span>
                    </div>
                \`;

                const executePreciseEdit = () => {
                    if (typeof setImageStudioMode === 'function') {
                        setImageStudioMode('workspace', { tool: 'precise-edit' });
                    }
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
                    if (typeof showStudioToast === 'function') showStudioToast('Loaded into Precise Edit — upload photo to begin');
                };

                const executeGenerate = () => {
                    if (typeof setImageStudioMode === 'function') {
                        setImageStudioMode('workspace', {
                            tool: 'generate-image',
                            prompt: promptText,
                            aspectRatio: tmpl.aspectRatio,
                            stylePreset: tmpl.stylePreset
                        });
                    }
                    const studioPrompt = document.getElementById('studio-prompt-input');
                    if (studioPrompt) {
                        studioPrompt.value = promptText;
                        studioPrompt.dispatchEvent(new Event('input', { bubbles: true }));
                        setTimeout(() => studioPrompt.focus(), 60);
                    }
                    if (tmpl.stylePreset) {
                        if (typeof syncStudioStylePills === 'function') {
                            syncStudioStylePills(tmpl.stylePreset);
                        }
                        if (typeof imageStudioState !== 'undefined') {
                            imageStudioState.activeStyle = tmpl.stylePreset;
                        }
                    }
                    if (typeof showStudioToast === 'function') showStudioToast(\`Loaded "\${title}" template\`);
                };

                card.addEventListener('click', () => {
                    if (typeof openTemplateWhitePreviewModal === 'function') {
                        openTemplateWhitePreviewModal(tmpl, executePreciseEdit, executeGenerate);
                    } else {
                        executeGenerate();
                    }
                });

                grid.appendChild(card);
            });
        }
        window.renderMobileImageHomeTemplates = renderMobileImageHomeTemplates;

        function syncMobileImageSendButton() {
            const promptInput = document.getElementById('mobile-image-prompt-input');
            const submitBtn = document.getElementById('mobile-image-submit-btn');
            if (!promptInput || !submitBtn) return;
            const hasText = promptInput.value.trim().length > 0;
            submitBtn.disabled = !hasText;
            if (hasText) {
                submitBtn.className = "w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-xs active:scale-95 cursor-pointer";
            } else {
                submitBtn.className = "w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
            }
        }
        window.syncMobileImageSendButton = syncMobileImageSendButton;

        function submitMobileImagePrompt() {
            const input = document.getElementById('mobile-image-prompt-input');
            const text = input ? input.value.trim() : '';
            if (!text) return;

            const refData = window.mobileImageRefDataUrl || null;
            const refName = window.mobileImageRefName || null;

            if (typeof setImageStudioMode === 'function') {
                setImageStudioMode('workspace', {
                    prompt: text,
                    referenceImage: refData,
                    referenceImageName: refName,
                    aspectRatio: '1:1',
                    model: 'auto',
                    count: 1,
                    imageCount: 1,
                    autoGenerate: true
                });
            }

            if (input) input.value = '';
            syncMobileImageSendButton();
            // Clear ref preview
            window.mobileImageRefDataUrl = null;
            window.mobileImageRefName = null;
            const refPreview = document.getElementById('mobile-image-ref-preview');
            if (refPreview) refPreview.classList.add('hidden');
            const fileInput = document.getElementById('mobile-image-file-input');
            if (fileInput) fileInput.value = '';
        }
        window.submitMobileImagePrompt = submitMobileImagePrompt;

        function toggleMobileImageVoice() {
            const mobilePrompt = document.getElementById('mobile-image-prompt-input');
            const mobileMicBtn = document.getElementById('mobile-image-mic-btn');
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                if (typeof showStudioToast === 'function') showStudioToast('Voice input is not supported in this browser');
                return;
            }
            if (window._mobileImageRecording) {
                if (window._mobileImageRecognition) {
                    try { window._mobileImageRecognition.stop(); } catch (_) {}
                }
                window._mobileImageRecording = false;
                if (mobileMicBtn) mobileMicBtn.classList.remove('text-red-500', 'animate-pulse');
                return;
            }

            try {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = navigator.language || 'en-US';
                const startText = mobilePrompt ? mobilePrompt.value : '';

                recognition.onstart = () => {
                    window._mobileImageRecording = true;
                    if (mobileMicBtn) mobileMicBtn.classList.add('text-red-500', 'animate-pulse');
                };
                recognition.onresult = (event) => {
                    let transcript = '';
                    for (let i = 0; i < event.results.length; ++i) {
                        transcript += event.results[i][0].transcript;
                    }
                    if (mobilePrompt) {
                        mobilePrompt.value = (startText ? (startText.trim() + ' ') : '') + transcript.trimStart();
                        syncMobileImageSendButton();
                    }
                };
                recognition.onerror = () => {
                    window._mobileImageRecording = false;
                    if (mobileMicBtn) mobileMicBtn.classList.remove('text-red-500', 'animate-pulse');
                };
                recognition.onend = () => {
                    window._mobileImageRecording = false;
                    if (mobileMicBtn) mobileMicBtn.classList.remove('text-red-500', 'animate-pulse');
                };
                window._mobileImageRecognition = recognition;
                recognition.start();
            } catch (e) {
                console.warn('Voice error:', e);
            }
        }
        window.toggleMobileImageVoice = toggleMobileImageVoice;

        function initMobileImageHomepage() {
            // 1. Sidebar Button
            const mobileImageSidebarBtn = document.getElementById('mobile-image-sidebar-btn');
            if (mobileImageSidebarBtn && !mobileImageSidebarBtn._inited) {
                mobileImageSidebarBtn._inited = true;
                mobileImageSidebarBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof openMobileDrawer === 'function') {
                        openMobileDrawer();
                    } else {
                        const sidebar = document.getElementById('sidebar');
                        const overlay = document.getElementById('sidebar-overlay');
                        if (sidebar && overlay) {
                            sidebar.classList.add('mobile-open');
                            overlay.classList.remove('hidden');
                            document.body.style.overflow = 'hidden';
                        }
                    }
                });
            }

            // 2. Attach (+) Button & Popover
            const attachBtn = document.getElementById('mobile-image-attach-btn');
            const attachPop = document.getElementById('mobile-image-attach-popover');
            const fileInput = document.getElementById('mobile-image-file-input');
            const refPreview = document.getElementById('mobile-image-ref-preview');
            const refThumb = document.getElementById('mobile-image-ref-thumb');
            const refName = document.getElementById('mobile-image-ref-filename');
            const refRemove = document.getElementById('mobile-image-ref-remove');

            if (attachBtn && attachPop && !attachBtn._inited) {
                attachBtn._inited = true;
                attachBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    attachPop.classList.toggle('hidden');
                });
            }

            document.addEventListener('click', (e) => {
                if (attachPop && !attachPop.classList.contains('hidden')) {
                    if (!attachPop.contains(e.target) && !attachBtn?.contains(e.target)) {
                        attachPop.classList.add('hidden');
                    }
                }
            });

            // Popover Options
            const optRef = document.getElementById('mobile-image-opt-ref');
            const optGen = document.getElementById('mobile-image-opt-gen');
            const optRembg = document.getElementById('mobile-image-opt-rembg');
            const optEdit = document.getElementById('mobile-image-opt-edit');
            const optUpscale = document.getElementById('mobile-image-opt-upscale');

            if (optRef) {
                optRef.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (attachPop) attachPop.classList.add('hidden');
                    if (fileInput) fileInput.click();
                });
            }
            if (optGen) {
                optGen.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (attachPop) attachPop.classList.add('hidden');
                    if (typeof setImageStudioMode === 'function') setImageStudioMode('workspace', { tool: 'generate-image' });
                });
            }
            if (optRembg) {
                optRembg.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (attachPop) attachPop.classList.add('hidden');
                    if (typeof setImageStudioMode === 'function') setImageStudioMode('workspace', { tool: 'remove-background' });
                });
            }
            if (optEdit) {
                optEdit.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (attachPop) attachPop.classList.add('hidden');
                    if (typeof studioPreciseEditState !== 'undefined') studioPreciseEditState.sourceItem = null;
                    if (typeof setImageStudioMode === 'function') setImageStudioMode('workspace', { tool: 'precise-edit' });
                });
            }
            if (optUpscale) {
                optUpscale.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (attachPop) attachPop.classList.add('hidden');
                    if (typeof setImageStudioMode === 'function') setImageStudioMode('workspace', { tool: 'upscale-image' });
                });
            }

            // File input handler
            if (fileInput && !fileInput._inited) {
                fileInput._inited = true;
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    if (!file.type.startsWith('image/')) {
                        if (typeof showStudioToast === 'function') showStudioToast('Please select a valid image file');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        window.mobileImageRefDataUrl = ev.target.result;
                        window.mobileImageRefName = file.name;
                        if (refThumb) refThumb.src = window.mobileImageRefDataUrl;
                        if (refName) refName.textContent = file.name;
                        if (refPreview) refPreview.classList.remove('hidden');
                        if (typeof showStudioToast === 'function') showStudioToast('Reference image attached');
                    };
                    reader.readAsDataURL(file);
                });
            }

            if (refRemove && !refRemove._inited) {
                refRemove._inited = true;
                refRemove.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.mobileImageRefDataUrl = null;
                    window.mobileImageRefName = null;
                    if (refPreview) refPreview.classList.add('hidden');
                    if (fileInput) fileInput.value = '';
                    if (typeof showStudioToast === 'function') showStudioToast('Reference image removed');
                });
            }

            // 3. Prompt input & submit
            const promptInput = document.getElementById('mobile-image-prompt-input');
            const submitBtn = document.getElementById('mobile-image-submit-btn');
            const micBtn = document.getElementById('mobile-image-mic-btn');

            if (promptInput && !promptInput._inited) {
                promptInput._inited = true;
                promptInput.addEventListener('input', syncMobileImageSendButton);
                promptInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        submitMobileImagePrompt();
                    }
                });
            }

            if (submitBtn && !submitBtn._inited) {
                submitBtn._inited = true;
                submitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    submitMobileImagePrompt();
                });
            }

            if (micBtn && !micBtn._inited) {
                micBtn._inited = true;
                micBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleMobileImageVoice();
                });
            }

            // Render mobile templates initially
            renderMobileImageHomeTemplates();
        }
        window.initMobileImageHomepage = initMobileImageHomepage;
`;

// Insert the JS controller before `initMobileHomepage()` or at the end of mobile script section
if (!content.includes('initMobileImageHomepage')) {
    const marker = 'function initMobileHomepage() {';
    const idx = content.indexOf(marker);
    if (idx !== -1) {
        content = content.slice(0, idx) + jsController + '\r\n        ' + content.slice(idx);
        console.log('Added Mobile Images Workspace Controller.');
    } else {
        console.error('initMobileHomepage marker not found!');
        process.exit(1);
    }
} else {
    console.log('Mobile Images Controller already present.');
}

// 5. Hook initMobileImageHomepage() into DOMContentLoaded / startup
if (!content.includes('initMobileImageHomepage();')) {
    const hookMarker = 'initMobileHomepage();';
    const idx = content.indexOf(hookMarker);
    if (idx !== -1) {
        content = content.slice(0, idx + hookMarker.length) + '\r\n            initMobileImageHomepage();' + content.slice(idx + hookMarker.length);
        console.log('Hooked initMobileImageHomepage() into startup.');
    }
}

// 6. Hook renderMobileImageHomeTemplates() into setImageStudioMode
const homeModeMarker = 'renderImageHomeTemplates();';
if (content.includes(homeModeMarker) && !content.includes('renderMobileImageHomeTemplates();')) {
    const idx = content.indexOf(homeModeMarker);
    content = content.slice(0, idx + homeModeMarker.length) + '\r\n                if (typeof renderMobileImageHomeTemplates === "function") renderMobileImageHomeTemplates();' + content.slice(idx + homeModeMarker.length);
    console.log('Hooked renderMobileImageHomeTemplates into setImageStudioMode.');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated index.html!');
