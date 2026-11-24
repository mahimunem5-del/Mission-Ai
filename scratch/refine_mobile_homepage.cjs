const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

function replaceExact(searchStr, replaceStr, label) {
    if (!html.includes(searchStr)) {
        const crlfSearch = searchStr.replace(/\r?\n/g, '\r\n');
        const lfSearch = searchStr.replace(/\r?\n/g, '\n');
        if (html.includes(crlfSearch)) {
            html = html.replace(crlfSearch, replaceStr.replace(/\r?\n/g, '\r\n'));
            console.log(`[PASS] Replaced ${label} (CRLF)`);
            return;
        } else if (html.includes(lfSearch)) {
            html = html.replace(lfSearch, replaceStr.replace(/\r?\n/g, '\n'));
            console.log(`[PASS] Replaced ${label} (LF)`);
            return;
        }
        console.error(`ERROR: [${label}] search string not found!`);
        process.exit(1);
    }
    html = html.replace(searchStr, replaceStr);
    console.log(`[PASS] Replaced ${label}`);
}

// 1. Restore exact original desktop classes on HTML elements
const modifiedFreePlan = `<div id="chat-free-plan-header" class="hidden md:block absolute top-4 left-6 z-10 select-none pointer-events-auto">`;
const originalFreePlan = `<div id="chat-free-plan-header" class="absolute top-4 left-6 z-10 select-none pointer-events-auto">`;
replaceExact(modifiedFreePlan, originalFreePlan, 'Restore original chat-free-plan-header class');

const modifiedHeaderActions = `<div id="chat-header-actions" class="hidden md:flex absolute top-4 right-6 z-10 select-none items-center gap-2">`;
const originalHeaderActions = `<div id="chat-header-actions" class="absolute top-4 right-6 z-10 select-none flex items-center gap-2">`;
replaceExact(modifiedHeaderActions, originalHeaderActions, 'Restore original chat-header-actions class');

const modifiedHeroSection = `<div id="hero-section"
            class="hidden md:flex flex-1 min-h-[calc(100vh-120px)] flex-col items-center justify-center -translate-y-10 px-4">`;
const originalHeroSection = `<div id="hero-section"
            class="flex-1 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center -translate-y-10 px-4">`;
replaceExact(modifiedHeroSection, originalHeroSection, 'Restore original hero-section class in HTML');

// 2. Restore exact original desktop class in JS reset and renderCurrentConversation
const modifiedResetHero = `if (heroSection) heroSection.className = 'hidden md:flex flex-1 min-h-[calc(100vh-120px)] flex-col items-center justify-center -translate-y-10 px-4';
                            const _mobHomeReset = document.getElementById('mobile-home-container');
                            if (_mobHomeReset) _mobHomeReset.classList.remove('hidden');`;
const restoredResetHero = `if (heroSection) heroSection.className = 'flex-1 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center -translate-y-10 px-4';
                            const _mobHomeReset = document.getElementById('mobile-home-container');
                            if (_mobHomeReset) _mobHomeReset.classList.remove('hidden');`;
replaceExact(modifiedResetHero, restoredResetHero, 'Restore hero-section className in reset');

const modifiedRenderConvHero = `if (heroSection) heroSection.className = 'hidden md:flex flex-1 min-h-[calc(100vh-120px)] flex-col items-center justify-center -translate-y-10 px-4';
                const _mobHome = document.getElementById('mobile-home-container');
                if (_mobHome) _mobHome.classList.remove('hidden');
                const _topNavH = document.getElementById('top-nav-header');
                if (_topNavH) _topNavH.classList.add('hidden');
                if (typeof syncMobileIncognitoState === 'function') syncMobileIncognitoState();
                if (typeof syncMobileModelLabel === 'function') syncMobileModelLabel(chatState ? chatState.selectedModel : 'mahi-engine');
                if (typeof syncMobileSendButton === 'function') syncMobileSendButton();`;
const restoredRenderConvHero = `if (heroSection) heroSection.className = 'flex-1 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center -translate-y-10 px-4';
                const _mobHome = document.getElementById('mobile-home-container');
                if (_mobHome) _mobHome.classList.remove('hidden');
                const _topNavH = document.getElementById('top-nav-header');
                if (_topNavH) _topNavH.classList.add('hidden');
                if (typeof syncMobileIncognitoState === 'function') syncMobileIncognitoState();
                if (typeof syncMobileModelLabel === 'function') syncMobileModelLabel(chatState ? chatState.selectedModel : 'mahi-engine');
                if (typeof syncMobileSendButton === 'function') syncMobileSendButton();`;
replaceExact(modifiedRenderConvHero, restoredRenderConvHero, 'Restore hero-section className in renderCurrentConversation');

// 3. Update CSS rules to suppress hero-section on mobile homepage
const oldCssBlock = `/* ─── Dedicated Standalone Mobile Homepage UI (< 768px) ─── */
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

const newCssBlock = `/* ─── Dedicated Standalone Mobile Homepage UI (< 768px) ─── */
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

            /* When mobile homepage is visible, suppress hero-section, top-nav-header & chat-header-actions on mobile */
            #mobile-home-container:not(.hidden) ~ #hero-section,
            #mobile-home-container:not(.hidden) ~ #top-nav-header,
            #mobile-home-container:not(.hidden) ~ #chat-header-actions {
                display: none !important;
            }
        }`;
replaceExact(oldCssBlock, newCssBlock, 'Update CSS to hide hero-section on mobile homepage');

// 4. Move let hasImageError = false; to outer function scope in executeLiveChatStream
const oldStreamSetup = `const isDeepResearchStream = searchMode === 'deep-research' || chatState.chatMode === 'deepResearch';
            const lastUserMsg = [...(conv.messages || [])].reverse().find(m => m.role === 'user');
            const promptQuery = lastUserMsg?.content || '';`;

const newStreamSetup = `let hasImageError = false;
            const isDeepResearchStream = searchMode === 'deep-research' || chatState.chatMode === 'deepResearch';
            const lastUserMsg = [...(conv.messages || [])].reverse().find(m => m.role === 'user');
            const promptQuery = lastUserMsg?.content || '';`;
replaceExact(oldStreamSetup, newStreamSetup, 'Declare hasImageError in outer scope');

const oldInnerHasImageError = `let streamCompleted = false;
                let hasImageError = false;`;
const newInnerHasImageError = `let streamCompleted = false;`;
replaceExact(oldInnerHasImageError, newInnerHasImageError, 'Remove inner scoped hasImageError');

fs.writeFileSync('index.html', html, 'utf8');
console.log(`[SUCCESS] Refined index.html successfully!`);
