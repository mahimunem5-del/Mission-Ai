const fs = require('fs');

const norm = s => s.replace(/\r\n/g, '\n');
const originalHtml = norm(fs.readFileSync('index.html', 'utf8'));

// ============================================================
// 1. MOBILE BOTTOM PROMPT COMPOSER HTML (around line 4870)
// ============================================================
const composerOldHtml = `                <!-- Hidden File Input for Reference Upload -->
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
                                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1 1.275-1.275L12 3Z"/>
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

const composerNewHtml = `                <!-- Hidden File Input for Direct Reference Photo Upload (<input type="file" multiple />) -->
                <input type="file" id="mobile-image-file-input" accept="image/*" multiple class="hidden">

                <!-- ChatGPT-Style Auto-Expanding Capsule / Card Shell -->
                <div id="mobile-image-composer-shell"
                    class="rounded-full bg-[#FFFFFF] border border-slate-200/90 shadow-[0_8px_28px_rgba(15,23,42,0.10)] px-3 py-2 flex flex-col transition-all duration-200">

                    <!-- Attached Reference Images Chips Inside Top of Composer Bar -->
                    <div id="mobile-image-ref-chips-wrap" class="hidden w-full pb-1.5 flex flex-wrap items-center gap-1.5">
                        <!-- Populated dynamically via renderMobileComposerRefChips() -->
                    </div>

                    <!-- Text Composer View -->
                    <div id="mobile-image-composer-text-view" class="w-full flex items-end gap-2">
                        <!-- Left: Direct ChatGPT-Style Image Upload Icon -->
                        <button type="button" id="mobile-image-attach-btn"
                            class="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all flex-shrink-0 cursor-pointer self-end mb-0.5"
                            aria-label="Attach reference photo" title="Attach photo">
                            <svg class="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                        </button>

                        <!-- Center: Auto-Expanding Multi-Line Textarea -->
                        <div class="flex-1 min-w-0 flex items-center py-1">
                            <textarea id="mobile-image-prompt-input" rows="1"
                                placeholder="Create image..."
                                autocomplete="off"
                                class="w-full resize-none bg-transparent text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none break-words whitespace-pre-wrap max-h-[156px] overflow-y-auto outline-none border-0 p-0 m-0"></textarea>
                        </div>

                        <!-- Right: Mic & Circular Blue Send Buttons (Anchored at bottom-right) -->
                        <div class="flex items-center gap-1 flex-shrink-0 self-end mb-0.5">
                            <!-- Microphone (🎤) Button -->
                            <button type="button" id="mobile-image-mic-btn"
                                class="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                                aria-label="Voice input" title="Voice Input">
                                <svg class="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="22" />
                                </svg>
                            </button>

                            <!-- Circular Blue Send (↑) Button -->
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

                    <!-- Voice Mode Bar (ChatGPT-style Blue Live Equalizer & Pause Bar) -->
                    <div id="mobile-image-composer-voice-view" class="hidden w-full h-[44px] flex items-center justify-between gap-2.5">
                        <!-- Left: Minimal Circular Cancel Button (×) -->
                        <button type="button" id="mobile-voice-cancel-btn"
                            class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer active:scale-95"
                            title="Cancel voice input" aria-label="Cancel">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <!-- Center: Real-Time Animated Voice Equalizer Waveform Bars (Blue Theme) -->
                        <div id="mobile-voice-equalizer-bars" class="flex-1 flex items-center justify-center gap-[3px] h-8 px-2 overflow-hidden select-none">
                            <!-- Populated dynamically with live responsive bars -->
                        </div>

                        <!-- Right: Blue Theme Pause / Stop Button + Circular Blue Send (↑) Button -->
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <button type="button" id="mobile-voice-pause-btn"
                                class="h-9 px-3 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
                                title="Pause voice input">
                                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                                </svg>
                                <span>Pause</span>
                            </button>

                            <button type="button" id="mobile-voice-send-btn"
                                class="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
                                title="Send" aria-label="Send">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>`;

// ============================================================
// 2. MOBILE COMPOSER JS (lines 21532 - 21794)
// ============================================================
const jsComposerOldStart = `        function syncMobileImageSendButton() {`;
const jsComposerOldEnd = `        window.initMobileImageHomepage = initMobileImageHomepage;`;

const jsComposerNew = `        // ============================================================
        // MOBILE BOTTOM PROMPT COMPOSER STATE & LOGIC (< 768px, md:hidden)
        // Direct Image Upload, Auto-Expanding Textarea, Live Voice Equalizer & Pre-Filled Send
        // ============================================================
        window.mobileComposerAttachedRefs = [];
        let _mobileVoiceAudioCtx = null;
        let _mobileVoiceAnalyser = null;
        let _mobileVoiceMediaStream = null;
        let _mobileVoiceAnimFrame = null;
        let _mobileVoiceInitialPrompt = '';
        let _isMobileVoiceActive = false;

        function renderMobileComposerRefChips() {
            const wrap = document.getElementById('mobile-image-ref-chips-wrap');
            if (!wrap) return;
            const refs = window.mobileComposerAttachedRefs || [];
            if (refs.length === 0) {
                wrap.classList.add('hidden');
                wrap.innerHTML = '';
                return;
            }
            wrap.classList.remove('hidden');
            wrap.innerHTML = '';

            refs.forEach((ref, idx) => {
                const chip = document.createElement('div');
                chip.className = 'inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200/80 rounded-xl max-w-[150px] shadow-xs select-none';
                
                const thumb = document.createElement('img');
                thumb.src = ref.dataUrl;
                thumb.alt = '';
                thumb.className = 'w-5 h-5 rounded-md object-cover shrink-0 pointer-events-none';
                chip.appendChild(thumb);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'text-[11.5px] text-slate-700 truncate font-medium flex-1';
                nameSpan.textContent = ref.name || 'Image';
                chip.appendChild(nameSpan);

                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'w-4 h-4 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-[10px] cursor-pointer ml-0.5';
                removeBtn.textContent = '✕';
                removeBtn.title = 'Remove';
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    window.mobileComposerAttachedRefs.splice(idx, 1);
                    renderMobileComposerRefChips();
                    autoResizeMobileComposerTextarea();
                    syncMobileImageSendButton();
                };
                chip.appendChild(removeBtn);

                wrap.appendChild(chip);
            });
        }
        window.renderMobileComposerRefChips = renderMobileComposerRefChips;

        function autoResizeMobileComposerTextarea() {
            const textarea = document.getElementById('mobile-image-prompt-input');
            const shell = document.getElementById('mobile-image-composer-shell');
            if (!textarea) return;

            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 156;

            if (scrollHeight > maxHeight) {
                textarea.style.height = maxHeight + 'px';
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.height = Math.max(24, scrollHeight) + 'px';
                textarea.style.overflowY = 'hidden';
            }

            if (shell) {
                const hasRefs = window.mobileComposerAttachedRefs && window.mobileComposerAttachedRefs.length > 0;
                const isMultiLine = scrollHeight > 34;
                if (isMultiLine || hasRefs) {
                    shell.classList.remove('rounded-full');
                    shell.classList.add('rounded-3xl');
                } else {
                    shell.classList.remove('rounded-3xl');
                    shell.classList.add('rounded-full');
                }
            }
        }
        window.autoResizeMobileComposerTextarea = autoResizeMobileComposerTextarea;

        function syncMobileImageSendButton() {
            const promptInput = document.getElementById('mobile-image-prompt-input');
            const submitBtn = document.getElementById('mobile-image-submit-btn');
            if (!submitBtn) return;
            const hasText = promptInput ? promptInput.value.trim().length > 0 : false;
            const hasRefs = window.mobileComposerAttachedRefs && window.mobileComposerAttachedRefs.length > 0;
            const canSend = hasText || hasRefs;

            submitBtn.disabled = !canSend;
            if (canSend) {
                submitBtn.className = "w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-xs active:scale-95 cursor-pointer";
            } else {
                submitBtn.className = "w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
            }
        }
        window.syncMobileImageSendButton = syncMobileImageSendButton;

        function initMobileVoiceEqualizerBars() {
            const container = document.getElementById('mobile-voice-equalizer-bars');
            if (!container) return;
            container.innerHTML = '';
            const BAR_COUNT = 20;
            for (let i = 0; i < BAR_COUNT; i++) {
                const bar = document.createElement('div');
                bar.className = 'w-[3px] rounded-full bg-blue-500 transition-[height] duration-75';
                bar.style.height = '6px';
                container.appendChild(bar);
            }
        }

        function startMobileImageVoice() {
            const promptInput = document.getElementById('mobile-image-prompt-input');
            _mobileVoiceInitialPrompt = promptInput ? promptInput.value : '';
            _isMobileVoiceActive = true;

            const textView = document.getElementById('mobile-image-composer-text-view');
            const voiceView = document.getElementById('mobile-image-composer-voice-view');
            if (textView) textView.classList.add('hidden');
            if (voiceView) voiceView.classList.remove('hidden');

            initMobileVoiceEqualizerBars();

            // Setup Web Audio Analyser if available, else smooth fallback
            const barsContainer = document.getElementById('mobile-voice-equalizer-bars');
            const bars = barsContainer ? Array.from(barsContainer.children) : [];

            const runFallbackAnimation = () => {
                if (!_isMobileVoiceActive) return;
                const now = Date.now() * 0.006;
                bars.forEach((b, i) => {
                    const wave1 = Math.sin(now + i * 0.45);
                    const wave2 = Math.cos(now * 0.7 - i * 0.3);
                    const h = 5 + Math.abs(wave1 * 14 + wave2 * 9);
                    b.style.height = Math.round(Math.min(28, Math.max(4, h))) + 'px';
                });
                _mobileVoiceAnimFrame = requestAnimationFrame(runFallbackAnimation);
            };

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                    if (!_isMobileVoiceActive) {
                        stream.getTracks().forEach(t => t.stop());
                        return;
                    }
                    _mobileVoiceMediaStream = stream;
                    try {
                        const AudioCtx = window.AudioContext || window.webkitAudioContext;
                        if (AudioCtx) {
                            _mobileVoiceAudioCtx = new AudioCtx();
                            _mobileVoiceAnalyser = _mobileVoiceAudioCtx.createAnalyser();
                            _mobileVoiceAnalyser.fftSize = 64;
                            const source = _mobileVoiceAudioCtx.createMediaStreamSource(stream);
                            source.connect(_mobileVoiceAnalyser);

                            const dataArray = new Uint8Array(_mobileVoiceAnalyser.frequencyBinCount);
                            const renderLiveWave = () => {
                                if (!_isMobileVoiceActive) return;
                                _mobileVoiceAnalyser.getByteFrequencyData(dataArray);
                                bars.forEach((b, i) => {
                                    const val = dataArray[i % dataArray.length] || 0;
                                    const h = 4 + (val / 255) * 24;
                                    b.style.height = Math.round(Math.min(28, Math.max(4, h))) + 'px';
                                });
                                _mobileVoiceAnimFrame = requestAnimationFrame(renderLiveWave);
                            };
                            renderLiveWave();
                            return;
                        }
                    } catch (_) {}
                    runFallbackAnimation();
                }).catch(() => {
                    runFallbackAnimation();
                });
            } else {
                runFallbackAnimation();
            }

            // Speech Recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                try {
                    const recognition = new SpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.lang = navigator.language || 'en-US';

                    recognition.onresult = (event) => {
                        let interim = '';
                        for (let i = 0; i < event.results.length; ++i) {
                            interim += event.results[i][0].transcript;
                        }
                        if (promptInput) {
                            const base = _mobileVoiceInitialPrompt ? (_mobileVoiceInitialPrompt.trim() + ' ') : '';
                            promptInput.value = base + interim.trimStart();
                            autoResizeMobileComposerTextarea();
                            syncMobileImageSendButton();
                        }
                    };

                    recognition.onerror = () => {};
                    recognition.onend = () => {
                        if (_isMobileVoiceActive) {
                            try { recognition.start(); } catch (_) {}
                        }
                    };

                    window._mobileImageRecognition = recognition;
                    recognition.start();
                } catch (e) {
                    console.warn('SpeechRecognition error:', e);
                }
            }
        }
        window.startMobileImageVoice = startMobileImageVoice;

        function stopMobileImageVoice(mode = 'pause') {
            _isMobileVoiceActive = false;

            if (window._mobileImageRecognition) {
                try { window._mobileImageRecognition.stop(); } catch (_) {}
                window._mobileImageRecognition = null;
            }

            if (_mobileVoiceMediaStream) {
                try { _mobileVoiceMediaStream.getTracks().forEach(t => t.stop()); } catch (_) {}
                _mobileVoiceMediaStream = null;
            }

            if (_mobileVoiceAudioCtx) {
                try { _mobileVoiceAudioCtx.close(); } catch (_) {}
                _mobileVoiceAudioCtx = null;
                _mobileVoiceAnalyser = null;
            }

            if (_mobileVoiceAnimFrame) {
                cancelAnimationFrame(_mobileVoiceAnimFrame);
                _mobileVoiceAnimFrame = null;
            }

            const promptInput = document.getElementById('mobile-image-prompt-input');
            if (mode === 'cancel' && promptInput) {
                promptInput.value = _mobileVoiceInitialPrompt;
            }

            const textView = document.getElementById('mobile-image-composer-text-view');
            const voiceView = document.getElementById('mobile-image-composer-voice-view');
            if (voiceView) voiceView.classList.add('hidden');
            if (textView) textView.classList.remove('hidden');

            autoResizeMobileComposerTextarea();
            syncMobileImageSendButton();

            if (mode === 'send') {
                submitMobileImagePrompt();
            }
        }
        window.stopMobileImageVoice = stopMobileImageVoice;

        function submitMobileImagePrompt() {
            const input = document.getElementById('mobile-image-prompt-input');
            const text = input ? input.value.trim() : '';
            const refs = Array.isArray(window.mobileComposerAttachedRefs) ? [...window.mobileComposerAttachedRefs] : [];

            if (!text && refs.length === 0) return;

            // Open Generate Image bottom sheet pre-filled with prompt and references (autoGenerate: false)
            if (typeof openMobileWorkspaceDrawer === 'function') {
                openMobileWorkspaceDrawer('generate-image', {
                    prompt: text,
                    referenceImages: refs
                });
            } else if (typeof setImageStudioMode === 'function') {
                setImageStudioMode('workspace', {
                    tool: 'generate-image',
                    prompt: text,
                    referenceImages: refs,
                    autoGenerate: false
                });
            }

            const genPrompt = document.getElementById('mobile-gen-prompt-input');
            if (genPrompt) genPrompt.value = text;
            if (typeof imageStudioState !== 'undefined') {
                imageStudioState.prompt = text;
                if (refs.length > 0) {
                    imageStudioState.referenceImages = [...refs];
                    imageStudioState.referenceImage = refs[0];
                }
            }
            if (typeof renderMobileGenRefSlots === 'function') {
                renderMobileGenRefSlots();
            }
            if (typeof renderStudioReferenceSlots === 'function') {
                renderStudioReferenceSlots();
            }
            if (typeof updateMobileCtaButtonState === 'function') {
                updateMobileCtaButtonState();
            }

            // Cleanly clear composer draft state
            if (input) {
                input.value = '';
                input.style.height = 'auto';
            }
            window.mobileComposerAttachedRefs = [];
            window.mobileImageRefDataUrl = null;
            window.mobileImageRefName = null;
            renderMobileComposerRefChips();
            autoResizeMobileComposerTextarea();
            syncMobileImageSendButton();
            const fileInput = document.getElementById('mobile-image-file-input');
            if (fileInput) fileInput.value = '';
        }
        window.submitMobileImagePrompt = submitMobileImagePrompt;

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

            // 2. Direct Image Upload Button (<input multiple />)
            const attachBtn = document.getElementById('mobile-image-attach-btn');
            const fileInput = document.getElementById('mobile-image-file-input');

            if (attachBtn && !attachBtn._inited) {
                attachBtn._inited = true;
                attachBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInput?.click();
                });
            }

            if (fileInput && !fileInput._inited) {
                fileInput._inited = true;
                fileInput.addEventListener('change', (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;

                    let loaded = 0;
                    files.forEach(file => {
                        if (!file.type.startsWith('image/')) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            if (!window.mobileComposerAttachedRefs) window.mobileComposerAttachedRefs = [];
                            if (window.mobileComposerAttachedRefs.length < 10) {
                                window.mobileComposerAttachedRefs.push({
                                    dataUrl: ev.target.result,
                                    name: file.name
                                });
                            }
                            loaded++;
                            if (loaded === files.length || window.mobileComposerAttachedRefs.length >= 10) {
                                renderMobileComposerRefChips();
                                autoResizeMobileComposerTextarea();
                                syncMobileImageSendButton();
                            }
                        };
                        reader.readAsDataURL(file);
                    });
                    fileInput.value = '';
                });
            }

            // 3. Auto-Expanding Prompt Textarea & Submit
            const promptInput = document.getElementById('mobile-image-prompt-input');
            const submitBtn = document.getElementById('mobile-image-submit-btn');
            const micBtn = document.getElementById('mobile-image-mic-btn');

            if (promptInput && !promptInput._inited) {
                promptInput._inited = true;
                promptInput.addEventListener('input', () => {
                    autoResizeMobileComposerTextarea();
                    syncMobileImageSendButton();
                });
                promptInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
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
                    startMobileImageVoice();
                });
            }

            // 4. Voice Bar Buttons (Cancel, Pause, Send)
            const voiceCancelBtn = document.getElementById('mobile-voice-cancel-btn');
            if (voiceCancelBtn && !voiceCancelBtn._inited) {
                voiceCancelBtn._inited = true;
                voiceCancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    stopMobileImageVoice('cancel');
                });
            }

            const voicePauseBtn = document.getElementById('mobile-voice-pause-btn');
            if (voicePauseBtn && !voicePauseBtn._inited) {
                voicePauseBtn._inited = true;
                voicePauseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    stopMobileImageVoice('pause');
                });
            }

            const voiceSendBtn = document.getElementById('mobile-voice-send-btn');
            if (voiceSendBtn && !voiceSendBtn._inited) {
                voiceSendBtn._inited = true;
                voiceSendBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    stopMobileImageVoice('send');
                });
            }

            // Render mobile templates initially
            renderMobileImageHomeTemplates();
        }
        window.initMobileImageHomepage = initMobileImageHomepage;`;

// ============================================================
// 3. MULTI-SELECT BAR HTML & TEMPLATE MODAL HTML (around line 39500)
// ============================================================
const multiSelectOldHtml = `        <!-- B. Multi-Select Floating Contextual Bar (Appears when 1+ images are checked) -->
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

const multiSelectNewHtml = `        <!-- B. Multi-Select Floating Contextual Bar (Fixed at bottom of screen when 1+ images are checked) -->
        <div id="mobile-result-multiselect-bar"
            class="hidden fixed bottom-4 left-3.5 right-3.5 z-40 rounded-2xl bg-[#FFFFFF] border border-slate-200/85 shadow-[0_8px_28px_rgba(15,23,42,0.10)] px-3.5 py-2.5 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 select-none">
            <!-- Left Side: ONLY numeric selected count (1, 2, 3...) -->
            <div class="flex items-center">
                <span id="mobile-multiselect-count" class="text-sm font-semibold text-slate-900 tabular-nums pl-1">1</span>
            </div>
            <!-- Right Side: 3 Compact Surface-Matched #FFFFFF Buttons -->
            <div class="flex items-center gap-1.5">
                <button type="button" id="mobile-multiselect-download-btn"
                    class="h-9 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/85 text-xs font-medium text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer">
                    Download
                </button>
                <button type="button" id="mobile-multiselect-delete-btn"
                    class="h-9 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/85 text-xs font-medium text-rose-600 hover:bg-rose-50/60 active:scale-[0.98] transition cursor-pointer">
                    Delete
                </button>
                <button type="button" id="mobile-multiselect-cancel-btn"
                    class="h-9 px-3 rounded-xl bg-[#FFFFFF] border border-slate-200/85 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer">
                    Cancel
                </button>
            </div>
        </div>`;

// Template Modal HTML
const tmplModalOldHtml = `        <!-- Centered Floating Rounded Card Container -->
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

const tmplModalNewHtml = `        <!-- Centered Floating Rounded Card Container (Slim p-2.5 Padding & Sleek Hairline Border) -->
        <div id="mobile-tmpl-card-container"
            class="relative w-full max-w-[390px] max-h-[86dvh] bg-[#FFFFFF] rounded-2xl border border-slate-200/80 shadow-[0_18px_48px_rgba(15,23,42,0.16)] overflow-y-auto flex flex-col p-2.5 space-y-3 animate-in zoom-in-95 duration-200">
            
            <!-- Top Preview Image Frame with True Natural Aspect Ratio & Circular Close Button -->
            <div class="relative w-full h-auto max-h-[45dvh] rounded-xl overflow-hidden flex items-center justify-center bg-[#FFFFFF] border border-slate-200/60 shrink-0">
                <!-- Circular close button cleanly pinned at top-left -->
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

                <!-- Template Preview Image in true natural aspect ratio without forced cropping -->
                <img id="mobile-tmpl-card-img" src="" alt="Template Preview" class="w-full h-auto max-h-[45dvh] object-contain rounded-xl block" />
            </div>`;

// ============================================================
// 4. openMobileWorkspaceDrawer options (around line 40065)
// ============================================================
const drawerOptionsOld = `                if (options.aspectRatio && typeof imageStudioState !== 'undefined') {
                    imageStudioState.aspectRatio = options.aspectRatio;
                }`;

const drawerOptionsNew = `                if (options.referenceImages && Array.isArray(options.referenceImages)) {
                    if (typeof imageStudioState !== 'undefined') {
                        imageStudioState.referenceImages = [...options.referenceImages];
                        imageStudioState.referenceImage = imageStudioState.referenceImages[0] || null;
                    }
                    if (typeof renderStudioReferenceSlots === 'function') {
                        renderStudioReferenceSlots();
                    }
                    renderMobileGenRefSlots();
                }
                if (options.aspectRatio && typeof imageStudioState !== 'undefined') {
                    imageStudioState.aspectRatio = options.aspectRatio;
                }`;

// ============================================================
// 5. updateMobileMultiSelectBar JS (around line 40612)
// ============================================================
const updateMultiSelectOld = `        function updateMobileMultiSelectBar() {
            const bar = document.getElementById('mobile-result-multiselect-bar');
            const countEl = document.getElementById('mobile-multiselect-count');
            const editBtn = document.getElementById('mobile-multiselect-edit-btn');
            if (!bar) return;

            const size = window.mobileSelectedImageIds ? window.mobileSelectedImageIds.size : 0;
            if (size > 0) {
                bar.classList.remove('hidden');
                if (countEl) countEl.textContent = \`\${size} selected\`;
                if (editBtn) {
                    editBtn.classList.toggle('hidden', size !== 1);
                }
            } else {
                bar.classList.add('hidden');
            }
        }`;

const updateMultiSelectNew = `        function updateMobileMultiSelectBar() {
            const bar = document.getElementById('mobile-result-multiselect-bar');
            const countEl = document.getElementById('mobile-multiselect-count');
            if (!bar) return;

            const size = window.mobileSelectedImageIds ? window.mobileSelectedImageIds.size : 0;
            if (size > 0) {
                bar.classList.remove('hidden');
                if (countEl) countEl.textContent = \`\${size}\`;
            } else {
                bar.classList.add('hidden');
            }
        }`;

// ============================================================
// 6. Multi-Select Event Listeners (around line 41135)
// ============================================================
const multiListenersOld = `            // 10. Multi-Select Bar Buttons
            const deselectBtn = document.getElementById('mobile-multiselect-deselect-btn');
            if (deselectBtn && !deselectBtn._inited) {
                deselectBtn._inited = true;
                deselectBtn.addEventListener('click', () => {
                    window.mobileSelectedImageIds.clear();
                    updateMobileMultiSelectBar();
                    renderMobileResultFeed();
                });
            }

            const multiDlBtn = document.getElementById('mobile-multiselect-download-btn');
            if (multiDlBtn && !multiDlBtn._inited) {
                multiDlBtn._inited = true;
                multiDlBtn.addEventListener('click', handleMobileMultiDownload);
            }

            const multiDelBtn = document.getElementById('mobile-multiselect-delete-btn');
            if (multiDelBtn && !multiDelBtn._inited) {
                multiDelBtn._inited = true;
                multiDelBtn.addEventListener('click', handleMobileMultiDelete);
            }

            const multiEditBtn = document.getElementById('mobile-multiselect-edit-btn');
            if (multiEditBtn && !multiEditBtn._inited) {
                multiEditBtn._inited = true;
                multiEditBtn.addEventListener('click', handleMobileMultiEdit);
            }`;

const multiListenersNew = `            // 10. Multi-Select Bar Buttons
            const cancelBtn = document.getElementById('mobile-multiselect-cancel-btn') || document.getElementById('mobile-multiselect-deselect-btn');
            if (cancelBtn && !cancelBtn._inited) {
                cancelBtn._inited = true;
                cancelBtn.addEventListener('click', () => {
                    if (window.mobileSelectedImageIds) {
                        window.mobileSelectedImageIds.clear();
                    }
                    updateMobileMultiSelectBar();
                    renderMobileResultFeed();
                });
            }

            const multiDlBtn = document.getElementById('mobile-multiselect-download-btn');
            if (multiDlBtn && !multiDlBtn._inited) {
                multiDlBtn._inited = true;
                multiDlBtn.addEventListener('click', handleMobileMultiDownload);
            }

            const multiDelBtn = document.getElementById('mobile-multiselect-delete-btn');
            if (multiDelBtn && !multiDelBtn._inited) {
                multiDelBtn._inited = true;
                multiDelBtn.addEventListener('click', handleMobileMultiDelete);
            }`;

// Perform replacements
let updatedHtml = originalHtml;

// Check 1
const cOld = norm(composerOldHtml);
const cNew = norm(composerNewHtml);
if (!updatedHtml.includes(cOld)) {
    throw new Error('composerOldHtml not found in index.html');
}
updatedHtml = updatedHtml.replace(cOld, cNew);
console.log('1. Replaced composerOldHtml successfully');

// Check 2
const jsStart = norm(jsComposerOldStart);
const jsEnd = norm(jsComposerOldEnd);
const jsStartIdx = updatedHtml.indexOf(jsStart);
const jsEndIdx = updatedHtml.indexOf(jsEnd, jsStartIdx);
if (jsStartIdx === -1 || jsEndIdx === -1) {
    throw new Error('jsComposerOldStart or jsComposerOldEnd not found in index.html');
}
const jsFullOld = updatedHtml.slice(jsStartIdx, jsEndIdx + jsEnd.length);
updatedHtml = updatedHtml.replace(jsFullOld, norm(jsComposerNew));
console.log('2. Replaced jsComposer successfully');

// Check 3
const msOld = norm(multiSelectOldHtml);
const msNew = norm(multiSelectNewHtml);
if (!updatedHtml.includes(msOld)) {
    throw new Error('multiSelectOldHtml not found in index.html');
}
updatedHtml = updatedHtml.replace(msOld, msNew);
console.log('3. Replaced multiSelectOldHtml successfully');

// Check 4
const tmOld = norm(tmplModalOldHtml);
const tmNew = norm(tmplModalNewHtml);
if (!updatedHtml.includes(tmOld)) {
    throw new Error('tmplModalOldHtml not found in index.html');
}
updatedHtml = updatedHtml.replace(tmOld, tmNew);
console.log('4. Replaced tmplModalOldHtml successfully');

// Check 5
const doOld = norm(drawerOptionsOld);
const doNew = norm(drawerOptionsNew);
if (!updatedHtml.includes(doOld)) {
    throw new Error('drawerOptionsOld not found in index.html');
}
updatedHtml = updatedHtml.replace(doOld, doNew);
console.log('5. Replaced drawerOptionsOld successfully');

// Check 6
const umsOld = norm(updateMultiSelectOld);
const umsNew = norm(updateMultiSelectNew);
if (!updatedHtml.includes(umsOld)) {
    throw new Error('updateMultiSelectOld not found in index.html');
}
updatedHtml = updatedHtml.replace(umsOld, umsNew);
console.log('6. Replaced updateMultiSelectOld successfully');

// Check 7
const mlOld = norm(multiListenersOld);
const mlNew = norm(multiListenersNew);
if (!updatedHtml.includes(mlOld)) {
    throw new Error('multiListenersOld not found in index.html');
}
updatedHtml = updatedHtml.replace(mlOld, mlNew);
console.log('7. Replaced multiListenersOld successfully');

// Write to index.html
fs.writeFileSync('index.html', updatedHtml, 'utf8');
console.log('ALL UPDATES APPLIED TO index.html SUCCESSFULLY!');
