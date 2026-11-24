const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const originalLength = html.length;

function replaceExact(searchStr, replaceStr, label) {
    // If not found, try normalizing \r\n to \n or vice versa
    if (!html.includes(searchStr)) {
        const crlfSearch = searchStr.replace(/\r?\n/g, '\r\n');
        const lfSearch = searchStr.replace(/\r?\n/g, '\n');
        if (html.includes(crlfSearch)) {
            html = html.replace(crlfSearch, replaceStr.replace(/\r?\n/g, '\r\n'));
            console.log(`[PASS] Replaced ${label} (using CRLF)`);
            return;
        } else if (html.includes(lfSearch)) {
            html = html.replace(lfSearch, replaceStr.replace(/\r?\n/g, '\n'));
            console.log(`[PASS] Replaced ${label} (using LF)`);
            return;
        }
        console.error(`ERROR: [${label}] search string not found!`);
        process.exit(1);
    }
    html = html.replace(searchStr, replaceStr);
    console.log(`[PASS] Replaced ${label}`);
}

// 1. Add CSS rules in <style>
const styleAnchor = `body {
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
        }`;

const newStyle = `body {
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
        }

        /* ─── Dedicated Standalone Mobile Homepage UI (< 768px) ─── */
        @media (min-width: 768px) {
            #mobile-home-container {
                display: none !important;
            }
        }

        @media (max-width: 767px) {
            #mobile-home-container {
                display: flex;
                background-color: #FFFFFF !important;
            }

            #mobile-home-container.hidden {
                display: none !important;
            }

            #chat-free-plan-header {
                display: none !important;
            }

            #mobile-home-container:not(.hidden) ~ #top-nav-header,
            #mobile-home-container:not(.hidden) ~ #chat-header-actions {
                display: none !important;
            }
        }`;

replaceExact(styleAnchor, newStyle, 'CSS styles for Mobile Homepage');

// 2. Insert Mobile Homepage Container right after <main ...>
const mainAnchor = `<main class="flex-1 flex flex-col h-full relative min-w-0 bg-white dark:bg-[#191919]">`;

const mobileHomepageHtml = `<main class="flex-1 flex flex-col h-full relative min-w-0 bg-white dark:bg-[#191919]">
        <!-- Dedicated Standalone Mobile Homepage (< 768px, block md:hidden) -->
        <div id="mobile-home-container"
            class="block md:hidden min-h-[100dvh] w-full bg-[#FFFFFF] flex flex-col justify-between overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif] antialiased relative z-20">
            <!-- Minimal Top Header Bar (Left Sidebar Icon + Right Incognito Icon) -->
            <header class="px-4 pt-3.5 pb-2 flex items-center justify-between w-full shrink-0 select-none">
                <!-- Top-Left (ChatGPT-style Sidebar Icon — image_53bcab.png) -->
                <button type="button" id="mobile-sidebar-toggle-btn"
                    class="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                    aria-label="Open sidebar menu" title="Open Menu">
                    <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="4" y1="7.5" x2="20" y2="7.5"></line>
                        <line x1="4" y1="14.5" x2="13" y2="14.5"></line>
                    </svg>
                </button>

                <!-- Top-Right (Perplexity-style Incognito Icon — image_53b566.png) -->
                <button type="button" id="mobile-incognito-btn"
                    class="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                    aria-label="Toggle Incognito Mode" title="Incognito Mode">
                    <svg class="w-5 h-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 11h18" />
                        <path d="M6 11l1.5-5.5c.3-1.1 1.2-1.5 2.2-1.5h4.6c1 0 1.9.4 2.2 1.5L18 11" />
                        <circle cx="7.5" cy="16" r="2.5" />
                        <circle cx="16.5" cy="16" r="2.5" />
                        <path d="M10 16h4" />
                    </svg>
                </button>
            </header>

            <!-- Centered Greeting Heading (What would you like to do today?) -->
            <div class="flex-1 flex items-center justify-center px-6 text-center select-none py-8">
                <h1 id="mobile-greeting-heading"
                    class="font-['Plus_Jakarta_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold tracking-[-0.02em] text-slate-900 antialiased">
                    What would you like to do today?
                </h1>
            </div>

            <!-- Floating Bottom Chat Composer (image_53b566.png shape + image_53b8a4.png controls) -->
            <div class="px-3 pb-3 pt-1 w-full shrink-0 relative">
                <!-- Attachment preview container if files attached -->
                <div id="mobile-attachment-preview-container" class="hidden flex flex-wrap gap-2 mb-2 px-1"></div>

                <!-- Attachment Popover Menu (5 Functional Options) -->
                <div id="mobile-attach-popover"
                    class="hidden absolute bottom-full mb-3 left-3 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 z-50 select-none space-y-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                    <!-- 1. Add photos & files -->
                    <button type="button" id="mobile-opt-add-files"
                        class="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left cursor-pointer">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span>Add photos &amp; files</span>
                    </button>
                    <!-- 2. Create images -->
                    <button type="button" id="mobile-opt-create-images"
                        class="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left cursor-pointer">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span>Create images</span>
                    </button>
                    <!-- 3. Create slides -->
                    <button type="button" id="mobile-opt-create-slides"
                        class="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left cursor-pointer">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 3h20" />
                            <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                            <path d="m7 21 5-5 5 5" />
                        </svg>
                        <span>Create slides</span>
                    </button>
                    <!-- 4. Web search -->
                    <button type="button" id="mobile-opt-web-search"
                        class="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left cursor-pointer">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>Web search</span>
                    </button>
                    <!-- 5. Deep research -->
                    <button type="button" id="mobile-opt-deep-research"
                        class="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left cursor-pointer">
                        <svg class="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"></path>
                            <path d="m13.56 11.747 4.332-.924"></path>
                            <path d="m16 21-3.105-6.21"></path>
                            <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"></path>
                        </svg>
                        <span>Deep research</span>
                    </button>
                </div>

                <!-- Mobile Model Selector Popover Menu -->
                <div id="mobile-model-popover"
                    class="hidden absolute bottom-full mb-3 left-3 w-72 max-h-80 bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2 z-50 overflow-y-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
                    <div id="mobile-model-options-list" class="space-y-0.5"></div>
                </div>

                <!-- Floating Composer Card (image_53b566.png shape + image_53b8a4.png controls) -->
                <div id="mobile-composer-card"
                    class="rounded-[28px] bg-white border border-slate-200/90 shadow-[0_6px_28px_rgba(15,23,42,0.07)] px-4 pt-3.5 pb-3">
                    <!-- Auto-Expanding Prompt Input (16px to prevent mobile browser auto-zoom) -->
                    <textarea id="mobile-chat-input" rows="1" placeholder="Ask anything..."
                        class="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-[16px] leading-relaxed text-slate-900 placeholder:text-slate-400 p-0 block"
                        style="min-height: 24px; max-height: 120px; overflow-y: auto;"></textarea>

                    <!-- Bottom Action Row (matching image_53b8a4.png) -->
                    <div class="mt-2.5 flex items-center justify-between">
                        <!-- Left Group: '+' button + borderless 'Auto ⌄' selector -->
                        <div class="flex items-center gap-2">
                            <!-- Circular '+' Button -->
                            <button type="button" id="mobile-plus-btn"
                                class="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                aria-label="Add files or tools" title="Add files or tools">
                                <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>

                            <!-- Borderless inline 'Auto ⌄' Model Selector -->
                            <button type="button" id="mobile-model-select-btn"
                                class="flex items-center gap-1 px-1.5 py-1 text-[13.5px] font-medium text-slate-700 bg-transparent border-0 outline-none hover:text-slate-900 transition-colors cursor-pointer select-none"
                                aria-label="Select model">
                                <span id="mobile-model-name">Auto</span>
                                <svg id="mobile-model-chevron" class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                        </div>

                        <!-- Right Group: Mic button + Circular Send button -->
                        <div class="flex items-center gap-2">
                            <!-- Microphone ('🎤') Button -->
                            <button type="button" id="mobile-mic-btn"
                                class="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                aria-label="Voice input" title="Voice input">
                                <svg class="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="22" />
                                </svg>
                            </button>

                            <!-- Circular Send ('↑') Button -->
                            <button type="button" id="mobile-send-btn"
                                class="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[#E5E7EB] text-[#9CA3AF] cursor-default"
                                aria-label="Send message" disabled>
                                <svg class="w-4 h-4 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

replaceExact(mainAnchor, mobileHomepageHtml, 'Mobile Homepage Container in HTML');

// 3. Update Desktop classes on #chat-free-plan-header, #chat-header-actions, #hero-section
const oldFreePlanHeader = `<div id="chat-free-plan-header" class="absolute top-4 left-6 z-10 select-none pointer-events-auto">`;
const newFreePlanHeader = `<div id="chat-free-plan-header" class="hidden md:block absolute top-4 left-6 z-10 select-none pointer-events-auto">`;
replaceExact(oldFreePlanHeader, newFreePlanHeader, 'chat-free-plan-header hidden md:block');

const oldHeaderActions = `<div id="chat-header-actions" class="absolute top-4 right-6 z-10 select-none flex items-center gap-2">`;
const newHeaderActions = `<div id="chat-header-actions" class="hidden md:flex absolute top-4 right-6 z-10 select-none items-center gap-2">`;
replaceExact(oldHeaderActions, newHeaderActions, 'chat-header-actions hidden md:flex');

const oldHeroSection = `<div id="hero-section"
            class="flex-1 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center -translate-y-10 px-4">`;
const newHeroSection = `<div id="hero-section"
            class="hidden md:flex flex-1 min-h-[calc(100vh-120px)] flex-col items-center justify-center -translate-y-10 px-4">`;
replaceExact(oldHeroSection, newHeroSection, 'hero-section hidden md:flex');

// 4. Update JS in clear chat reset (line ~12393)
const oldResetHero = `if (heroSection) heroSection.className = 'flex-1 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center -translate-y-10 px-4';`;
const newResetHero = `if (heroSection) heroSection.className = 'hidden md:flex flex-1 min-h-[calc(100vh-120px)] flex-col items-center justify-center -translate-y-10 px-4';
                            const _mobHomeReset = document.getElementById('mobile-home-container');
                            if (_mobHomeReset) _mobHomeReset.classList.remove('hidden');`;
replaceExact(oldResetHero, newResetHero, 'JS Reset Hero in Clear Chat');

// 5. Update renderCurrentConversation()
const oldRenderConvHero = `if (heroSection) heroSection.className = 'flex-1 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center -translate-y-10 px-4';`;
const newRenderConvHero = `if (heroSection) heroSection.className = 'hidden md:flex flex-1 min-h-[calc(100vh-120px)] flex-col items-center justify-center -translate-y-10 px-4';
                const _mobHome = document.getElementById('mobile-home-container');
                if (_mobHome) _mobHome.classList.remove('hidden');
                const _topNavH = document.getElementById('top-nav-header');
                if (_topNavH) _topNavH.classList.add('hidden');
                if (typeof syncMobileIncognitoState === 'function') syncMobileIncognitoState();
                if (typeof syncMobileModelLabel === 'function') syncMobileModelLabel(chatState ? chatState.selectedModel : 'mahi-engine');
                if (typeof syncMobileSendButton === 'function') syncMobileSendButton();`;
replaceExact(oldRenderConvHero, newRenderConvHero, 'JS renderCurrentConversation !hasMessages');

const oldRenderConvActive = `if (heroSection) heroSection.className = 'flex-1 flex flex-col items-stretch min-h-0 w-full h-full relative overflow-hidden';`;
const newRenderConvActive = `if (heroSection) heroSection.className = 'flex-1 flex flex-col items-stretch min-h-0 w-full h-full relative overflow-hidden';
                const _mobHomeAct = document.getElementById('mobile-home-container');
                if (_mobHomeAct) _mobHomeAct.classList.add('hidden');
                const _topNavHAct = document.getElementById('top-nav-header');
                if (_topNavHAct) _topNavHAct.classList.remove('hidden');`;
replaceExact(oldRenderConvActive, newRenderConvActive, 'JS renderCurrentConversation hasMessages');

// 6. Update hideAll() in switchWorkspace()
const oldHideAll = `function hideAll() {
                [homeSection, studioSection, slidesSection, projectsSection, librarySection, imageChatSection].forEach(el => {
                    if (el) el.classList.add('hidden');
                });
            }`;
const newHideAll = `function hideAll() {
                const mobHome = document.getElementById('mobile-home-container');
                [homeSection, studioSection, slidesSection, projectsSection, librarySection, imageChatSection, mobHome].forEach(el => {
                    if (el) el.classList.add('hidden');
                });
            }`;
replaceExact(oldHideAll, newHideAll, 'JS hideAll in switchWorkspace');

// 7. Update updateModelUI
const oldUpdateModelUIEnd = `renderModelDropdownOptions();
        }`;
const newUpdateModelUIEnd = `renderModelDropdownOptions();
            if (typeof syncMobileModelLabel === 'function') {
                syncMobileModelLabel(model ? model.id : 'mahi-engine');
            }
        }`;
replaceExact(oldUpdateModelUIEnd, newUpdateModelUIEnd, 'JS updateModelUI syncMobileModelLabel');

// 8. Update updateTopHeaderActions
const oldTopHeaderEnd = `if (shareBtn) {
                if (hasMessages) {
                    shareBtn.classList.remove('hidden');
                    shareBtn.classList.add('inline-flex');
                } else {
                    shareBtn.classList.add('hidden');
                    shareBtn.classList.remove('inline-flex');
                }
            }
        }`;
const newTopHeaderEnd = `if (shareBtn) {
                if (hasMessages) {
                    shareBtn.classList.remove('hidden');
                    shareBtn.classList.add('inline-flex');
                } else {
                    shareBtn.classList.add('hidden');
                    shareBtn.classList.remove('inline-flex');
                }
            }
            if (typeof syncMobileIncognitoState === 'function') {
                syncMobileIncognitoState();
            }
        }`;
replaceExact(oldTopHeaderEnd, newTopHeaderEnd, 'JS updateTopHeaderActions syncMobileIncognitoState');

// 9. Update renderAttachmentPreviews
const oldRenderAttachEnd = `container.appendChild(card);
            });
        }`;
const newRenderAttachEnd = `container.appendChild(card);
            });
            const mobilePreviewContainer = document.getElementById('mobile-attachment-preview-container');
            if (mobilePreviewContainer) {
                mobilePreviewContainer.classList.remove('hidden');
                mobilePreviewContainer.innerHTML = '';
                chatState.pendingAttachments.forEach(att => {
                    const card = createGeminiAttachmentCard(att, {
                        onRemove: (id) => {
                            removePendingAttachment(id);
                            if (typeof syncMobileSendButton === 'function') syncMobileSendButton();
                        },
                        onSave: () => renderAttachmentPreviews()
                    });
                    mobilePreviewContainer.appendChild(card);
                });
            }
            if (typeof syncMobileSendButton === 'function') syncMobileSendButton();
        }`;
replaceExact(oldRenderAttachEnd, newRenderAttachEnd, 'JS renderAttachmentPreviews mirror mobile');

// 10. Update updateMicUI
const oldMicUIEnd = `if (listening) {
                if (micBtn) micBtn.classList.add('hidden');
                if (voiceControls) {
                    voiceControls.classList.remove('hidden');
                    voiceControls.classList.add('flex');
                }
                if (sendBtn) {
                    sendBtn.classList.add('hidden');
                    sendBtn.classList.remove('flex');
                }
                if (chatInput) {
                    chatInput.classList.add('listening-active');
                    if (!chatInput.value.trim()) {
                        chatInput.placeholder = 'Listening...';
                    }
                }
            } else {`;

const newMicUIEnd = `const mobileMicBtn = document.getElementById('mobile-mic-btn');
            if (mobileMicBtn) {
                if (listening) {
                    mobileMicBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200 transition-colors cursor-pointer animate-pulse';
                } else {
                    mobileMicBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer';
                }
            }
            if (listening) {
                if (micBtn) micBtn.classList.add('hidden');
                if (voiceControls) {
                    voiceControls.classList.remove('hidden');
                    voiceControls.classList.add('flex');
                }
                if (sendBtn) {
                    sendBtn.classList.add('hidden');
                    sendBtn.classList.remove('flex');
                }
                if (chatInput) {
                    chatInput.classList.add('listening-active');
                    if (!chatInput.value.trim()) {
                        chatInput.placeholder = 'Listening...';
                    }
                }
            } else {`;
replaceExact(oldMicUIEnd, newMicUIEnd, 'JS updateMicUI mobile sync');

// 11. Add Mobile Homepage Controller Functions & Listeners before closing </script>
const scriptClosingAnchor = `window.sendMessage = sendMessage;
        window.handleSendMessage = sendMessage;`;

const controllerFunctions = `window.sendMessage = sendMessage;
        window.handleSendMessage = sendMessage;

        // ═══════════════════════════════════════════════════════════════════
        // DEDICATED STANDALONE MOBILE HOMEPAGE CONTROLLER (< 768px)
        // ═══════════════════════════════════════════════════════════════════

        function syncMobileIncognitoState() {
            const mobileIncognitoBtn = document.getElementById('mobile-incognito-btn');
            const mobileGreetingHeading = document.getElementById('mobile-greeting-heading');
            const isIncog = Boolean(chatState && chatState.isIncognito);

            if (mobileIncognitoBtn) {
                if (isIncog) {
                    mobileIncognitoBtn.className = 'w-10 h-10 rounded-full bg-slate-900 border border-slate-900 shadow-[0_2px_6px_rgba(0,0,0,0.15)] flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer is-active';
                    mobileIncognitoBtn.title = 'Incognito Active (Tap to exit)';
                } else {
                    mobileIncognitoBtn.className = 'w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer';
                    mobileIncognitoBtn.title = 'Incognito Mode';
                }
            }

            if (mobileGreetingHeading) {
                if (isIncog) {
                    mobileGreetingHeading.textContent = "You're incognito";
                } else {
                    mobileGreetingHeading.textContent = "What would you like to do today?";
                }
            }
        }
        window.syncMobileIncognitoState = syncMobileIncognitoState;

        function syncMobileModelLabel(modelId) {
            const mobileModelName = document.getElementById('mobile-model-name');
            if (!mobileModelName) return;
            const model = AVAILABLE_MODELS.find(m => m.id === modelId || m.name === modelId);
            const isDefault = !model || model.id === 'mahi-engine' || model.name === 'Mahi Engine (Standard)' || Boolean(model.isDefault);
            if (isDefault) {
                mobileModelName.textContent = 'Auto';
            } else {
                mobileModelName.textContent = model.name;
            }
        }
        window.syncMobileModelLabel = syncMobileModelLabel;

        function syncMobileSendButton() {
            const mobileChatInput = document.getElementById('mobile-chat-input');
            const mobileSendBtn = document.getElementById('mobile-send-btn');
            if (!mobileSendBtn) return;
            const hasText = Boolean(mobileChatInput && mobileChatInput.value.trim().length > 0);
            const hasAttachments = Boolean(chatState && chatState.pendingAttachments && chatState.pendingAttachments.length > 0);

            if (hasText || hasAttachments) {
                mobileSendBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[#111827] text-white hover:bg-black active:scale-95 cursor-pointer shadow-sm';
                mobileSendBtn.removeAttribute('disabled');
            } else {
                mobileSendBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[#E5E7EB] text-[#9CA3AF] cursor-default';
                mobileSendBtn.setAttribute('disabled', 'true');
            }
        }
        window.syncMobileSendButton = syncMobileSendButton;

        function toggleMobileAttachPopover() {
            const popover = document.getElementById('mobile-attach-popover');
            const modelPopover = document.getElementById('mobile-model-popover');
            if (modelPopover) closeMobileModelPopover();
            if (!popover) return;
            popover.classList.toggle('hidden');
        }
        window.toggleMobileAttachPopover = toggleMobileAttachPopover;

        function closeMobileAttachPopover() {
            const popover = document.getElementById('mobile-attach-popover');
            if (popover) popover.classList.add('hidden');
        }
        window.closeMobileAttachPopover = closeMobileAttachPopover;

        function toggleMobileModelPopover() {
            const popover = document.getElementById('mobile-model-popover');
            const chevron = document.getElementById('mobile-model-chevron');
            const attachPopover = document.getElementById('mobile-attach-popover');
            if (attachPopover) closeMobileAttachPopover();
            if (!popover) return;
            const isHidden = popover.classList.contains('hidden');
            if (isHidden) {
                popover.classList.remove('hidden');
                if (chevron) chevron.classList.add('rotate-180');
                renderMobileModelOptions();
            } else {
                closeMobileModelPopover();
            }
        }
        window.toggleMobileModelPopover = toggleMobileModelPopover;

        function closeMobileModelPopover() {
            const popover = document.getElementById('mobile-model-popover');
            const chevron = document.getElementById('mobile-model-chevron');
            if (popover) popover.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
        }
        window.closeMobileModelPopover = closeMobileModelPopover;

        function renderMobileModelOptions() {
            const container = document.getElementById('mobile-model-options-list');
            if (!container) return;
            renderUnifiedModelOptionsList(container, chatState.selectedModel, (model) => {
                selectModel(model.id);
                closeMobileModelPopover();
            });
        }
        window.renderMobileModelOptions = renderMobileModelOptions;

        function submitMobileMessage() {
            const mobileChatInput = document.getElementById('mobile-chat-input');
            const chatInput = document.getElementById('chat-input');
            if (!mobileChatInput) return;
            const text = mobileChatInput.value.trim();
            const hasAttachments = Boolean(chatState && chatState.pendingAttachments && chatState.pendingAttachments.length > 0);
            if (!text && !hasAttachments) return;

            if (chatInput) {
                chatInput.value = text;
            }
            mobileChatInput.value = '';
            mobileChatInput.style.height = 'auto';
            syncMobileSendButton();
            sendMessage();
        }
        window.submitMobileMessage = submitMobileMessage;

        function initMobileHomepage() {
            // 1. Sidebar Drawer Toggle
            const mobileSidebarBtn = document.getElementById('mobile-sidebar-toggle-btn');
            if (mobileSidebarBtn && !mobileSidebarBtn._inited) {
                mobileSidebarBtn._inited = true;
                mobileSidebarBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.getElementById('sidebar-overlay');
                    if (sidebar && overlay) {
                        sidebar.classList.add('mobile-open');
                        overlay.classList.remove('hidden');
                        document.body.style.overflow = 'hidden';
                    }
                });
            }

            // 2. Incognito Mode Toggle
            const mobileIncognitoBtn = document.getElementById('mobile-incognito-btn');
            if (mobileIncognitoBtn && !mobileIncognitoBtn._inited) {
                mobileIncognitoBtn._inited = true;
                mobileIncognitoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const chatIncognitoBtn = document.getElementById('chat-incognito-btn');
                    if (chatIncognitoBtn) {
                        chatIncognitoBtn.click();
                    } else {
                        chatState.isIncognito = !chatState.isIncognito;
                        renderCurrentConversation();
                        updateTopHeaderActions();
                    }
                    syncMobileIncognitoState();
                });
            }

            // 3. Attachment ('+') Button & Popover
            const mobilePlusBtn = document.getElementById('mobile-plus-btn');
            if (mobilePlusBtn && !mobilePlusBtn._inited) {
                mobilePlusBtn._inited = true;
                mobilePlusBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMobileAttachPopover();
                });
            }

            // Wire popover options
            const optAdd = document.getElementById('mobile-opt-add-files');
            if (optAdd && !optAdd._inited) {
                optAdd._inited = true;
                optAdd.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileAttachPopover();
                    const fileInputChat = document.getElementById('file-input-chat');
                    if (fileInputChat) fileInputChat.click();
                });
            }

            const optImages = document.getElementById('mobile-opt-create-images');
            if (optImages && !optImages._inited) {
                optImages._inited = true;
                optImages.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileAttachPopover();
                    if (typeof switchWorkspace === 'function') switchWorkspace('image-studio');
                });
            }

            const optSlides = document.getElementById('mobile-opt-create-slides');
            if (optSlides && !optSlides._inited) {
                optSlides._inited = true;
                optSlides.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileAttachPopover();
                    if (typeof switchWorkspace === 'function') switchWorkspace('slides-studio');
                });
            }

            const optWeb = document.getElementById('mobile-opt-web-search');
            if (optWeb && !optWeb._inited) {
                optWeb._inited = true;
                optWeb.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileAttachPopover();
                    if (typeof selectSearchMode === 'function') selectSearchMode('webSearch');
                });
            }

            const optDeep = document.getElementById('mobile-opt-deep-research');
            if (optDeep && !optDeep._inited) {
                optDeep._inited = true;
                optDeep.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileAttachPopover();
                    if (typeof selectSearchMode === 'function') selectSearchMode('deepResearch');
                });
            }

            // 4. Model Selector Button
            const mobileModelBtn = document.getElementById('mobile-model-select-btn');
            if (mobileModelBtn && !mobileModelBtn._inited) {
                mobileModelBtn._inited = true;
                mobileModelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMobileModelPopover();
                });
            }

            // 5. Microphone Button
            const mobileMicBtn = document.getElementById('mobile-mic-btn');
            if (mobileMicBtn && !mobileMicBtn._inited) {
                mobileMicBtn._inited = true;
                mobileMicBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSpeechRecognition();
                });
            }

            // 6. Textarea Input & Send Button
            const mobileChatInput = document.getElementById('mobile-chat-input');
            const mobileSendBtn = document.getElementById('mobile-send-btn');
            if (mobileChatInput && !mobileChatInput._inited) {
                mobileChatInput._inited = true;
                mobileChatInput.addEventListener('input', () => {
                    mobileChatInput.style.height = 'auto';
                    mobileChatInput.style.height = Math.min(mobileChatInput.scrollHeight, 120) + 'px';
                    if (chatInput) chatInput.value = mobileChatInput.value;
                    syncMobileSendButton();
                });
                mobileChatInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitMobileMessage();
                    }
                });
            }

            if (mobileSendBtn && !mobileSendBtn._inited) {
                mobileSendBtn._inited = true;
                mobileSendBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    submitMobileMessage();
                });
            }

            // 7. Global click-away handler to dismiss mobile popovers
            document.addEventListener('click', (e) => {
                const attachPopover = document.getElementById('mobile-attach-popover');
                const plusBtn = document.getElementById('mobile-plus-btn');
                if (attachPopover && !attachPopover.classList.contains('hidden')) {
                    if (!attachPopover.contains(e.target) && !plusBtn?.contains(e.target)) {
                        closeMobileAttachPopover();
                    }
                }
                const modelPopover = document.getElementById('mobile-model-popover');
                const modelBtn = document.getElementById('mobile-model-select-btn');
                if (modelPopover && !modelPopover.classList.contains('hidden')) {
                    if (!modelPopover.contains(e.target) && !modelBtn?.contains(e.target)) {
                        closeMobileModelPopover();
                    }
                }
            });

            // Initial sync
            syncMobileIncognitoState();
            syncMobileModelLabel(chatState ? chatState.selectedModel : 'mahi-engine');
            syncMobileSendButton();
        }

        // Initialize mobile homepage when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMobileHomepage);
        } else {
            initMobileHomepage();
        }`;

replaceExact(scriptClosingAnchor, controllerFunctions, 'Mobile Homepage Controller Functions and Wiring');

fs.writeFileSync('index.html', html, 'utf8');
console.log(`[SUCCESS] index.html successfully updated! (Old: ${originalLength}, New: ${html.length})`);
