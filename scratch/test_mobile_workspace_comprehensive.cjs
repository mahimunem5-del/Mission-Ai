const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

console.log('====================================================');
console.log('COMPREHENSIVE MOBILE INNER WORKSPACE VERIFICATION');
console.log('====================================================');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`[PASS] ${testName}`);
        passedTests++;
    } else {
        console.error(`[FAIL] ${testName}: ${details}`);
        failedTests++;
    }
}

// ----------------------------------------------------
// SECTION 1: DOM Elements Existence & Classes
// ----------------------------------------------------
console.log('\n--- 1. DOM Elements Existence & Specifications ---');

assert(
    html.includes('id="mobile-workspace-drawer"'),
    '#mobile-workspace-drawer element exists'
);

assert(
    /id="mobile-workspace-drawer"[^>]*class="[^"]*fixed inset-0 z-50 bg-black\/40 backdrop-blur-\[1px\] flex flex-col justify-end md:hidden/.test(html),
    '#mobile-workspace-drawer has correct dimmed overlay & responsive classes'
);

assert(
    /id="mobile-workspace-sheet"[^>]*class="[^"]*max-h-\[90dvh\] bg-\[#FFFFFF\] rounded-t-\[28px\] shadow-2xl flex flex-col overflow-hidden/.test(html),
    '#mobile-workspace-sheet has max-h-[90dvh], rounded-t-[28px], white surface'
);

assert(
    /w-9 h-1 rounded-full bg-slate-300 mx-auto mb-2\.5/.test(html),
    'Top grabber drag handle pill exists with w-9 h-1 bg-slate-300'
);

assert(
    /id="mobile-drawer-close-btn"[^>]*class="[^"]*w-9 h-9 rounded-full bg-slate-100\/90 flex items-center justify-center text-slate-800/.test(html),
    '#mobile-drawer-close-btn circular back button (←) exists'
);

assert(
    /id="mobile-drawer-title"[^>]*class="[^"]*text-\[16px\] font-semibold text-slate-900/.test(html),
    '#mobile-drawer-title bold 16px workspace title exists'
);

assert(
    /id="mobile-drawer-clear-btn"[^>]*class="[^"]*text-\[13px\] font-medium text-slate-500 hover:text-slate-800/.test(html),
    '#mobile-drawer-clear-btn Clear all button exists'
);

assert(
    html.includes('id="mobile-panel-generate"') &&
    html.includes('id="mobile-panel-remove-bg"') &&
    html.includes('id="mobile-panel-precise-edit"') &&
    html.includes('id="mobile-panel-upscale"'),
    'All 4 tool panels exist inside the drawer'
);

assert(
    /id="mobile-drawer-cta-btn"[^>]*class="[^"]*w-full h-12 rounded-2xl bg-\[#111827\] text-white font-semibold text-\[15px\]/.test(html),
    '#mobile-drawer-cta-btn fixed bottom primary CTA button exists'
);

assert(
    /id="mobile-workspace-result-feed"[^>]*class="[^"]*fixed inset-0 z-40 bg-\[#FFFFFF\] flex flex-col h-\[100dvh\] md:hidden/.test(html),
    '#mobile-workspace-result-feed full-screen result feed exists'
);

assert(
    html.includes('id="mobile-result-back-btn"') &&
    html.includes('id="mobile-result-tool-badge"') &&
    html.includes('id="mobile-result-new-btn"'),
    'Result feed sticky top navigation bar (< Back, Tool Badge, + New) exists'
);

assert(
    html.includes('id="mobile-result-scroll-feed"'),
    '#mobile-result-scroll-feed scrollable feed exists'
);

assert(
    html.includes('id="mobile-result-edit-prompt-btn"') &&
    html.includes('id="mobile-result-regenerate-btn"'),
    'Result feed fixed bottom bar (Edit Prompt & Regenerate) exists'
);

// ----------------------------------------------------
// SECTION 2: CSS Media Queries Integrity
// ----------------------------------------------------
console.log('\n--- 2. CSS Media Queries & Responsiveness ---');

const desktopMediaBlock = html.slice(html.indexOf('@media (min-width: 768px)'), html.indexOf('@media (max-width: 767px)'));
assert(
    desktopMediaBlock.includes('#mobile-workspace-drawer') &&
    desktopMediaBlock.includes('#mobile-workspace-result-feed') &&
    desktopMediaBlock.includes('display: none !important;'),
    'Desktop (@media min-width: 768px) strictly hides mobile drawer & result feed with display: none !important'
);

const mobileMediaBlock = html.slice(html.indexOf('@media (max-width: 767px)'), html.indexOf('/* ─── Dedicated Standalone Mobile Homepage'));
assert(
    mobileMediaBlock.includes('#image-studio-workspace') &&
    mobileMediaBlock.includes('display: none !important;'),
    'Mobile (@media max-width: 767px) strictly hides desktop image-studio-workspace with display: none !important'
);

// ----------------------------------------------------
// SECTION 3: Behavioral Simulation with Mock DOM
// ----------------------------------------------------
console.log('\n--- 3. Behavioral Simulation with Mock DOM ---');

// Create a lightweight Mock DOM
class MockElement {
    constructor(tagName, id = '', className = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.className = className;
        this.classList = {
            _classes: new Set(className.split(/\s+/).filter(Boolean)),
            add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
            remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
            toggle: (c, force) => {
                if (force === undefined) {
                    if (this.classList._classes.has(c)) this.classList._classes.delete(c);
                    else this.classList._classes.add(c);
                } else if (force) {
                    this.classList._classes.add(c);
                } else {
                    this.classList._classes.delete(c);
                }
            },
            contains: (c) => this.classList._classes.has(c)
        };
        this.style = {};
        this.children = [];
        this.parentNode = null;
        this.listeners = {};
        this.textContent = '';
        this.value = '';
        this.disabled = false;
        this._inited = false;
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    querySelector(sel) {
        if (sel.startsWith('.')) {
            const cls = sel.slice(1);
            return this._findByClass(cls);
        }
        return null;
    }

    _findByClass(cls) {
        for (const child of this.children) {
            if (child.classList && child.classList.contains(cls)) return child;
            const found = child._findByClass && child._findByClass(cls);
            if (found) return found;
        }
        return null;
    }

    addEventListener(event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
    }

    click() {
        if (this.onclick) this.onclick({ stopPropagation: () => {}, preventDefault: () => {} });
        if (this.listeners['click']) {
            this.listeners['click'].forEach(h => h({ target: this, stopPropagation: () => {}, preventDefault: () => {} }));
        }
    }

    set innerHTML(val) {
        this._innerHTML = val;
        this.children = [];
        // simple parsing of nested tags with class
        const btnMatches = val.matchAll(/<button[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/gi);
        for (const bm of btnMatches) {
            const btn = new MockElement('button', '', bm[1]);
            btn.innerHTML = bm[2];
            this.children.push(btn);
        }
        const frameMatches = val.matchAll(/<div[^>]*class="([^"]*mobile-output-frame[^"]*)"[^>]*>/gi);
        for (const fm of frameMatches) {
            const frame = new MockElement('div', '', fm[1]);
            this.children.push(frame);
        }
    }

    get innerHTML() {
        return this._innerHTML || '';
    }
}

// Build mock document
const elements = {};
function getOrCreate(id, tag = 'div', cls = '') {
    if (!elements[id]) {
        elements[id] = new MockElement(tag, id, cls);
    }
    return elements[id];
}

// Populate elements used by the script
getOrCreate('mobile-workspace-drawer', 'div', 'hidden fixed inset-0 z-50');
getOrCreate('mobile-workspace-sheet', 'div', 'w-full max-h-[90dvh]');
getOrCreate('mobile-drawer-close-btn', 'button');
getOrCreate('mobile-drawer-title', 'h2');
getOrCreate('mobile-drawer-clear-btn', 'button');
getOrCreate('mobile-panel-generate', 'div');
getOrCreate('mobile-panel-remove-bg', 'div', 'hidden');
getOrCreate('mobile-panel-precise-edit', 'div', 'hidden');
getOrCreate('mobile-panel-upscale', 'div', 'hidden');
getOrCreate('mobile-drawer-cta-btn', 'button');
getOrCreate('mobile-drawer-cta-text', 'span');
getOrCreate('mobile-gen-prompt-input', 'textarea');
getOrCreate('mobile-gen-model-btn', 'button');
getOrCreate('mobile-gen-model-dropdown', 'div', 'hidden');
getOrCreate('mobile-gen-model-label', 'span');
getOrCreate('mobile-gen-ratio-btn', 'button');
getOrCreate('mobile-gen-ratio-dropdown', 'div', 'hidden');
getOrCreate('mobile-gen-ratio-label', 'span');
getOrCreate('mobile-gen-ratio-icon', 'div');
getOrCreate('mobile-gen-count-btn', 'button');
getOrCreate('mobile-gen-count-dropdown', 'div', 'hidden');
getOrCreate('mobile-gen-count-label', 'span');
getOrCreate('mobile-gen-adv-toggle', 'button');
getOrCreate('mobile-gen-adv-content', 'div', 'hidden');
getOrCreate('mobile-gen-adv-chevron', 'svg');
getOrCreate('mobile-gen-seed-input', 'input');
getOrCreate('mobile-gen-seed-rand-btn', 'button');
getOrCreate('mobile-gen-ref-count', 'span');
getOrCreate('mobile-gen-ref-slots', 'div');
getOrCreate('mobile-gen-style-pills', 'div');
getOrCreate('mobile-precise-prompt-input', 'textarea');
getOrCreate('mobile-precise-ref-count', 'span');
getOrCreate('mobile-precise-ref-slots', 'div');
getOrCreate('mobile-precise-dropzone', 'div');
getOrCreate('mobile-precise-preview-wrap', 'div', 'hidden');
getOrCreate('mobile-precise-preview-img', 'img');
getOrCreate('mobile-rembg-dropzone', 'div');
getOrCreate('mobile-rembg-preview-wrap', 'div', 'hidden');
getOrCreate('mobile-rembg-preview-img', 'img');
getOrCreate('mobile-upscale-dropzone', 'div');
getOrCreate('mobile-upscale-preview-wrap', 'div', 'hidden');
getOrCreate('mobile-upscale-preview-img', 'img');
getOrCreate('mobile-workspace-result-feed', 'div', 'hidden fixed inset-0');
getOrCreate('mobile-result-back-btn', 'button');
getOrCreate('mobile-result-tool-badge', 'span');
getOrCreate('mobile-result-new-btn', 'button');
getOrCreate('mobile-result-scroll-feed', 'div');
getOrCreate('mobile-result-edit-prompt-btn', 'button');
getOrCreate('mobile-result-regenerate-btn', 'button');
getOrCreate('mobile-image-home-container', 'div');
getOrCreate('mobile-image-composer-container', 'div');
getOrCreate('image-home-view', 'div');
getOrCreate('image-studio-workspace', 'div');

// Extract Script #5 (Dedicated Mobile Workspace Logic)
const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let script5Code = '';
while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1].includes('isMobileDrawerOpen = false') && match[1].includes('openMobileWorkspaceDrawer')) {
        script5Code = match[1];
        break;
    }
}

assert(script5Code.length > 0, 'Found Dedicated Mobile Inner Workspace Script Block in index.html');

// Create sandbox
const mockWindow = {
    innerWidth: 390, // Mobile viewport
    innerHeight: 844,
    STUDIO_RECENT_IMAGES: [],
    imageStudioState: {
        prompt: '',
        model: 'auto',
        aspectRatio: '1:1',
        imageCount: 1,
        activeStyle: 'Auto',
        referenceImages: []
    },
    studioPreciseEditState: {
        sourceItem: null,
        quality: 'Medium',
        variationCount: 1
    },
    navigator: {
        clipboard: {
            writeText: async (t) => { mockWindow._copiedText = t; }
        }
    },
    lucide: {
        createIcons: () => {}
    },
    document: {
        getElementById: (id) => elements[id] || null,
        createElement: (tag) => new MockElement(tag),
        addEventListener: () => {},
        body: new MockElement('body'),
        readyState: 'complete'
    },
    setTimeout: (fn, ms) => fn(),
    openTemplateWhitePreviewModal: (opts) => { mockWindow._openedModal = opts; },
    generateStudioImages: async (p, r) => { mockWindow._generatedWith = { p, r }; },
    applyStudioPreciseEdit: async () => { mockWindow._preciseEditApplied = true; },
    console: console
};
mockWindow.window = mockWindow;
mockWindow.document.body.appendChild(elements['mobile-workspace-drawer']);
mockWindow.document.body.appendChild(elements['mobile-workspace-result-feed']);

const ctx = vm.createContext(mockWindow);
vm.runInContext(script5Code, ctx);

// Run initDedicatedMobileWorkspace
ctx.initDedicatedMobileWorkspace();

// TEST 3.1: Open Generate Image Drawer
ctx.openMobileWorkspaceDrawer('generate-image');
assert(
    !elements['mobile-workspace-drawer'].classList.contains('hidden'),
    'Step 1: openMobileWorkspaceDrawer("generate-image") opens drawer (removes hidden)'
);
assert(
    elements['mobile-drawer-title'].textContent === 'Generate Image',
    'Drawer title is "Generate Image"'
);
assert(
    elements['mobile-drawer-cta-text'].textContent === 'Generate',
    'Drawer CTA text is "Generate"'
);
assert(
    !elements['mobile-panel-generate'].classList.contains('hidden') &&
    elements['mobile-panel-remove-bg'].classList.contains('hidden') &&
    elements['mobile-panel-precise-edit'].classList.contains('hidden') &&
    elements['mobile-panel-upscale'].classList.contains('hidden'),
    'Only Generate panel is visible, other 3 panels are hidden'
);

// TEST 3.2: CTA disabled when prompt is empty
ctx.updateMobileCtaButtonState();
assert(
    elements['mobile-drawer-cta-btn'].disabled === true,
    'CTA is disabled when prompt is empty'
);

// TEST 3.3: CTA enabled when prompt is typed
elements['mobile-gen-prompt-input'].value = 'A cybernetic cat sitting on a neon rooftop';
ctx.updateMobileCtaButtonState();
assert(
    elements['mobile-drawer-cta-btn'].disabled === false,
    'CTA is enabled when prompt is entered'
);

// TEST 3.4: Close Drawer via close button
elements['mobile-drawer-close-btn'].click();
assert(
    elements['mobile-workspace-drawer'].classList.contains('hidden'),
    'Tapping close button (←) closes the drawer'
);

// TEST 3.5: Open Remove Background Drawer
ctx.openMobileWorkspaceDrawer('remove-background');
assert(
    elements['mobile-drawer-title'].textContent === 'Remove Background',
    'Remove Background drawer title is "Remove Background"'
);
assert(
    elements['mobile-drawer-cta-text'].textContent === 'Remove Background',
    'Remove Background CTA text is "Remove Background"'
);
assert(
    !elements['mobile-panel-remove-bg'].classList.contains('hidden') &&
    elements['mobile-panel-generate'].classList.contains('hidden'),
    'Remove Background panel is visible, Generate panel is hidden'
);

// TEST 3.6: Open Precise Edit Drawer
ctx.openMobileWorkspaceDrawer('precise-edit');
assert(
    elements['mobile-drawer-title'].textContent === 'Precise Edit',
    'Precise Edit drawer title is "Precise Edit"'
);
assert(
    elements['mobile-drawer-cta-text'].textContent === 'Apply Edit',
    'Precise Edit CTA text is "Apply Edit"'
);
assert(
    !elements['mobile-panel-precise-edit'].classList.contains('hidden'),
    'Precise Edit panel is visible'
);

// TEST 3.7: Open Upscale Image Drawer
ctx.openMobileWorkspaceDrawer('upscale-image');
assert(
    elements['mobile-drawer-title'].textContent === 'Upscale Image',
    'Upscale Image drawer title is "Upscale Image"'
);
assert(
    elements['mobile-drawer-cta-text'].textContent === 'Upscale',
    'Upscale Image CTA text is "Upscale"'
);
assert(
    !elements['mobile-panel-upscale'].classList.contains('hidden'),
    'Upscale Image panel is visible'
);

// TEST 3.8: CTA Submission Flow (Step 1 -> Step 2)
ctx.openMobileWorkspaceDrawer('generate-image');
elements['mobile-gen-prompt-input'].value = 'Futuristic city floating in sky';
ctx.updateMobileCtaButtonState();

// Tap primary CTA button
elements['mobile-drawer-cta-btn'].click();

assert(
    elements['mobile-workspace-drawer'].classList.contains('hidden'),
    'Step 2: CTA click immediately closes bottom sheet drawer'
);
assert(
    !elements['mobile-workspace-result-feed'].classList.contains('hidden'),
    'Step 2: CTA click opens Full-Screen Result Feed'
);
assert(
    elements['mobile-result-tool-badge'].textContent === 'Generate Image',
    'Result Feed tool badge shows active tool title'
);

// TEST 3.9: Result Feed Rendering with Output Items
mockWindow.STUDIO_RECENT_IMAGES = [
    {
        id: 'img-1',
        url: 'https://example.com/cyber-cat.png',
        prompt: 'Futuristic city floating in sky',
        title: 'Futuristic city'
    }
];
mockWindow.isMobileProcessing = false;
ctx.renderMobileResultFeed();

const scrollFeed = elements['mobile-result-scroll-feed'];
assert(
    scrollFeed.children.length > 0,
    'Output card rendered inside scrollable feed'
);
const cardHtml = scrollFeed.children.map(c => c.innerHTML).join('');
assert(
    cardHtml.includes('mobile-card-download-btn'),
    'Output card contains direct 1-tap download button (⬇)'
);
assert(
    cardHtml.includes('mobile-action-edit-pill') &&
    cardHtml.includes('mobile-action-upscale-pill') &&
    cardHtml.includes('mobile-action-copy-pill'),
    'Output card contains quick action pills (Edit, Upscale, Copy)'
);

// TEST 3.10: Back button from Result Feed returns to landing
elements['mobile-result-back-btn'].click();
assert(
    elements['mobile-workspace-result-feed'].classList.contains('hidden'),
    'Result feed back button (< Back) returns user to landing page'
);

// ----------------------------------------------------
// SECTION 4: Zero Toasts Verification
// ----------------------------------------------------
console.log('\n--- 4. Zero Toasts on Mobile Verification ---');
const showStudioToastIdx = html.indexOf('function showStudioToast');
const showStudioToastBody = html.slice(showStudioToastIdx, showStudioToastIdx + 300);
assert(
    showStudioToastBody.includes('window.innerWidth < 768') && showStudioToastBody.includes('return;'),
    'showStudioToast strictly returns immediately when window.innerWidth < 768'
);

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) process.exit(1);
