const fs = require('fs');

const originalHtml = fs.readFileSync('index.html', 'utf8');

// 1. Mobile composer HTML replacement
const composerOldTarget = `                <!-- Hidden File Input for Reference Upload -->
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
                </div>`;

console.log('composerOldTarget found:', originalHtml.includes(composerOldTarget));

// 2. Multi-select and Template preview modal old target
const multiSelectOldTarget = `        <!-- B. Multi-Select Floating Contextual Bar (Appears when 1+ images are checked) -->
        <div id="mobile-result-multiselect-bar"
            class="hidden fixed top-14 inset-x-4 z-30 p-2.5 rounded-2xl bg-[#FFFFFF] border border-slate-200/90 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 select-none">
            <div class="flex items-center gap-2">
                <span id="mobile-multiselect-count" class="text-[13px] font-semibold text-slate-800">1 selected</span>
                <button type="button" id="mobile-multiselect-deselect-btn" class="text-[12px] font-medium text-slate-400 hover:text-slate-700 underline cursor-pointer">Deselect</button>
            </div>
            <div class="flex items-center gap-1.5">
                <button type="button" id="mobile-multiselect-edit-btn" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-medium flex items-center gap-1 cursor-pointer transition">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span>Edit</span>
                </button>
                <button type="button" id="mobile-multiselect-download-btn" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12.5px] font-medium flex items-center gap-1 cursor-pointer transition">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Download</span>
                </button>
                <button type="button" id="mobile-multiselect-delete-btn" class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12.5px] font-medium flex items-center gap-1 cursor-pointer transition">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    <span>Delete</span>
                </button>
            </div>
        </div>`;

console.log('multiSelectOldTarget found:', originalHtml.includes(multiSelectOldTarget));

const tmplModalOldTarget = `        <!-- Centered Floating Rounded Card Container -->
        <div id="mobile-tmpl-card-container"
            class="relative w-full max-w-[390px] max-h-[86dvh] bg-[#FFFFFF] rounded-[28px] border border-slate-200/85 shadow-[0_20px_50px_rgba(15,23,42,0.16)] overflow-y-auto flex flex-col p-4 space-y-3.5 animate-in zoom-in-95 duration-200">
            
            <!-- Top Preview Image Frame with Circular Close Button -->
            <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                <!-- Circular close button at top-left -->
                <button type="button" id="mobile-tmpl-card-close-btn"
                    class="absolute top-2.5 left-2.5 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 text-slate-800 hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                    aria-label="Close preview" title="Close">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <!-- Fallback if template image fails -->
                <div id="mobile-tmpl-card-fallback" class="hidden absolute inset-0 flex flex-col items-center justify-center p-4 text-neutral-400 bg-neutral-100 select-none">
                    <svg class="w-8 h-8 mb-1.5 opacity-40 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span id="mobile-tmpl-card-fallback-title" class="text-xs font-semibold text-neutral-600 text-center px-2"></span>
                </div>

                <!-- Template Preview Image -->
                <img id="mobile-tmpl-card-img" src="" alt="Template Preview" class="w-full h-full object-cover block" />
            </div>`;

console.log('tmplModalOldTarget found:', originalHtml.includes(tmplModalOldTarget));
