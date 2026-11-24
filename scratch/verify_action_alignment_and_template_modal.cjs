const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('VERIFYING ACTION ALIGNMENT & DEDICATED TEMPLATE CARD MODAL');
console.log('================================================================\n');

const html = fs.readFileSync('index.html', 'utf8');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        console.log(`  ✓ PASS: ${message}`);
        passedTests++;
    } else {
        console.error(`  ✗ FAIL: ${message}`);
        process.exitCode = 1;
    }
}

// ============================================================================
// SUITE 1: CLEAN BUTTONLESS CREATIONS FEED & MODAL DUAL ACTIONS (< 768px)
// ============================================================================
console.log('--- Suite 1: Clean Buttonless Creations Feed & Modal Dual Actions (< 768px) ---');

assert(!html.includes('mobile-action-edit-btn'),
    'Inline action button "Edit" completely removed from feed cards');

assert(!html.includes('mobile-action-upscale-btn'),
    'Inline action button "Upscale" completely removed from feed cards');

assert(!html.includes('mobile-action-download-btn'),
    'Inline action button "Download" completely removed from feed cards');

assert(html.includes('id="tmpl-modal-feed-actions" class="hidden grid grid-cols-2 gap-2.5 w-full mb-2.5 md:hidden"'),
    'Dual-tier action buttons (Edit + Upscale) present in image preview modal directly above Download');

assert(html.includes('id="tmpl-modal-edit-btn"') && html.includes('id="tmpl-modal-upscale-btn"'),
    'Modal Edit and Upscale buttons present');

// ============================================================================
// SUITE 2: DEDICATED MOBILE TEMPLATE CARD MODAL (< 768px)
// ============================================================================
console.log('\n--- Suite 2: Dedicated Mobile Template Card Modal (< 768px) ---');

assert(html.includes('id="mobile-template-card-modal"'), 'Modal #mobile-template-card-modal exists');
assert(html.includes('class="hidden fixed inset-0 z-[90] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-3.5 md:hidden font-[\'Plus_Jakarta_Sans\',sans-serif]"'),
    'Modal has soft dimmed overlay backdrop fixed inset-0 z-[90] bg-black/35 backdrop-blur-[1px] p-3.5 md:hidden');

assert(html.includes('id="mobile-tmpl-card-backdrop" class="absolute inset-0 -z-10 cursor-pointer"'),
    'Outside click backdrop #mobile-tmpl-card-backdrop exists for dismissal');

assert(html.includes('id="mobile-tmpl-card-container"'), '#mobile-tmpl-card-container exists');
assert(html.includes('w-full max-w-[390px] max-h-[86dvh] bg-[#FFFFFF] rounded-[28px] border border-slate-200/85 shadow-[0_20px_50px_rgba(15,23,42,0.16)] overflow-y-auto'),
    'Container is centered floating card w-full max-w-[390px] max-h-[86dvh] rounded-[28px] border border-slate-200/85 shadow-[0_20px_50px_rgba(15,23,42,0.16)]');

assert(html.includes('id="mobile-tmpl-card-close-btn"'), 'Circular close button #mobile-tmpl-card-close-btn exists');
assert(html.includes('id="mobile-tmpl-card-img"'), 'Template image element #mobile-tmpl-card-img exists');
assert(html.includes('id="mobile-tmpl-card-title"'), 'Template title element #mobile-tmpl-card-title exists');
assert(html.includes('id="mobile-tmpl-card-copy-btn"'), 'Prompt copy button #mobile-tmpl-card-copy-btn exists');
assert(html.includes('id="mobile-tmpl-card-prompt-text"'), 'Prompt text element #mobile-tmpl-card-prompt-text exists');
assert(html.includes('id="mobile-tmpl-card-cta-btn"'), 'Primary CTA button #mobile-tmpl-card-cta-btn exists');
assert(html.includes('id="mobile-tmpl-card-download-btn"'), 'Secondary download button #mobile-tmpl-card-download-btn exists');

// ============================================================================
// SUITE 3: MODAL DECOUPLING & DESKTOP ISOLATION
// ============================================================================
console.log('\n--- Suite 3: Modal Decoupling & Desktop Isolation ---');

assert(html.includes('id="template-white-preview-modal" class="hidden fixed inset-0 z-[90] md:z-[10000] bg-[#FFFFFF] md:bg-black/65 md:backdrop-blur-sm'),
    'Creations preview modal #template-white-preview-modal remains 100% intact and borderless #FFFFFF on mobile');

assert(html.includes('md:max-w-5xl md:max-h-[92vh] flex flex-col md:flex-row overflow-visible md:overflow-hidden'),
    'Desktop modal layout (md:max-w-5xl md:max-h-[92vh]) remains 100% intact');

assert(html.includes('id="mobile-card-generate"') && html.includes('min-h-[64px]'),
    'Mobile landing page 4 tool cards remain 100% intact with min-h-[64px]');

// ============================================================================
// SUITE 4: BEHAVIORAL SIMULATION IN VM
// ============================================================================
console.log('\n--- Suite 4: Behavioral Simulation in VM ---');

class MockElement {
    constructor(tagName = 'div', id = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.className = '';
        this.classList = {
            _classes: new Set(),
            add: (c) => this.classList._classes.add(c),
            remove: (c) => this.classList._classes.delete(c),
            contains: (c) => this.classList._classes.has(c),
            toggle: (c) => {
                if (this.classList._classes.has(c)) this.classList._classes.delete(c);
                else this.classList._classes.add(c);
            }
        };
        this.style = {};
        this.dataset = {};
        this.children = [];
        this._innerHTML = '';
        this.textContent = '';
        this.value = '';
        this.onclick = null;
        this.attributes = {};
    }
    set innerHTML(val) {
        this._innerHTML = val;
        this.textContent = (val || '').replace(/<[^>]*>/g, '');
    }
    get innerHTML() {
        return this._innerHTML || '';
    }
    appendChild(child) {
        this.children.push(child);
        return child;
    }
    querySelector(selector) {
        if (selector === '.copy-icon') return new MockElement('span', 'copy-icon');
        if (selector === '.check-icon') return new MockElement('span', 'check-icon');
        if (selector === '.copy-label') return new MockElement('span', 'copy-label');
        return new MockElement('div');
    }
    querySelectorAll() { return []; }
    setAttribute(k, v) { this.attributes[k] = v; }
    getAttribute(k) { return this.attributes[k]; }
    dispatchEvent(e) {}
}

const mockDoc = {
    elements: new Map(),
    getElementById(id) {
        if (!this.elements.has(id)) {
            const el = new MockElement('div', id);
            this.elements.set(id, el);
        }
        return this.elements.get(id);
    },
    createElement(tag) {
        return new MockElement(tag);
    },
    body: new MockElement('body')
};

// Pre-create modal elements in mock
const mobileTemplateModal = mockDoc.getElementById('mobile-template-card-modal');
mobileTemplateModal.classList.add('hidden');

const creationsFeedModal = mockDoc.getElementById('template-white-preview-modal');
creationsFeedModal.classList.add('hidden');

const mobileTmplTitle = mockDoc.getElementById('mobile-tmpl-card-title');
const mobileTmplPrompt = mockDoc.getElementById('mobile-tmpl-card-prompt-text');
const mobileTmplCtaText = mockDoc.getElementById('mobile-tmpl-card-cta-text');
const mobileTmplCtaBtn = mockDoc.getElementById('mobile-tmpl-card-cta-btn');
const mobileTmplDlBtn = mockDoc.getElementById('mobile-tmpl-card-download-btn');

const feedModalTitle = mockDoc.getElementById('tmpl-modal-title');
const feedPromptSection = mockDoc.getElementById('tmpl-modal-prompt-section');
const feedScaleSection = mockDoc.getElementById('tmpl-modal-scale-section');
const feedCtaBtn = mockDoc.getElementById('tmpl-modal-cta-btn');
const feedDlBtn = mockDoc.getElementById('tmpl-modal-download-btn');

const fnCode = html.substring(
    html.indexOf('function openMobileTemplateCardModal('),
    html.indexOf('function renderImageHomeTemplates()', html.indexOf('function openMobileTemplateCardModal('))
);

let downloadedFile = null;
const sandbox = {
    document: mockDoc,
    window: { innerWidth: 360 },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    triggerSilentTemplateDownload: (url, title) => { downloadedFile = { url, title }; },
    setIsMobileDrawerOpen: (v) => {},
    closeMobileWorkspaceDrawer: () => {},
    openMobileWorkspaceDrawer: (tool, opts) => {},
    console: console,
    Event: function (type) { this.type = type; }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = mockDoc;

vm.createContext(sandbox);
vm.runInContext(fnCode, sandbox);

// 4.1 Mobile Template Card Click
sandbox.window.innerWidth = 360;
const sampleTemplate = {
    title: 'Retro Anime Style',
    prompt: '90s anime aesthetic, vibrant city street in Tokyo at sunset',
    imageUrl: '/templates/retro-anime.jpg',
    aspectRatio: '1:1',
    stylePreset: 'anime'
};

sandbox.setSelectedTemplate(sampleTemplate);

assert(!mobileTemplateModal.classList.contains('hidden'),
    'Tapping template on mobile opens #mobile-template-card-modal');
assert(creationsFeedModal.classList.contains('hidden'),
    'Tapping template on mobile does NOT open #template-white-preview-modal');
assert(mobileTmplTitle.textContent === 'Retro Anime Style',
    'Mobile template card modal has correct title');
assert(mobileTmplPrompt.textContent.includes('90s anime aesthetic'),
    'Mobile template card modal has correct prompt text');
assert(mobileTmplCtaText.textContent === 'Use Prompt',
    'Mobile template card modal CTA text is "Use Prompt"');

// Close mobile template modal
sandbox.setSelectedTemplate(null);
assert(mobileTemplateModal.classList.contains('hidden'),
    'setSelectedTemplate(null) closes #mobile-template-card-modal');

// 4.2 Mobile Creations Feed Result Click (Regression Check)
const feedResultItem = {
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'generate-image',
    imageUrl: 'https://example.com/result1.png',
    prompt: 'A majestic dragon on a misty mountain',
    title: 'Generate Image'
};

sandbox.openTemplateWhitePreviewModal(feedResultItem);

assert(!creationsFeedModal.classList.contains('hidden'),
    'Tapping feed result on mobile opens #template-white-preview-modal');
assert(mobileTemplateModal.classList.contains('hidden'),
    'Tapping feed result on mobile does NOT open #mobile-template-card-modal');
assert(feedModalTitle.textContent === 'Generate Image',
    'Creations preview modal has correct title');
assert(feedCtaBtn.classList.contains('hidden'),
    'Creations preview modal has CTA button hidden');
assert(feedDlBtn.textContent === 'Download',
    'Creations preview modal has iconless Download button');

// Close creations modal
sandbox.closeTemplateWhitePreviewModal();
assert(creationsFeedModal.classList.contains('hidden'),
    'closeTemplateWhitePreviewModal closes #template-white-preview-modal');

// 4.3 Desktop Template Click (Desktop Isolation Check)
sandbox.window.innerWidth = 1440;
sandbox.setSelectedTemplate(sampleTemplate);

assert(!creationsFeedModal.classList.contains('hidden'),
    'Tapping template on desktop opens #template-white-preview-modal');
assert(mobileTemplateModal.classList.contains('hidden'),
    'Tapping template on desktop does NOT open #mobile-template-card-modal');
assert(feedModalTitle.textContent === 'Retro Anime Style',
    'Desktop modal displays template title');
assert(!feedCtaBtn.classList.contains('hidden'),
    'Desktop modal displays CTA button');

sandbox.closeTemplateWhitePreviewModal();
assert(creationsFeedModal.classList.contains('hidden'),
    'Desktop modal closes cleanly');

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('================================================================');

if (passedTests !== totalTests) {
    process.exit(1);
}
