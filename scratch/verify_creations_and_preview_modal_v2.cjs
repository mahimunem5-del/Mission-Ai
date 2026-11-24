const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('VERIFYING BALANCED CARDS, CLEAN FEED METADATA & FULL-BLEED MODAL');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ PASS: ${message}`);
        passCount++;
    } else {
        console.error(`  ✗ FAIL: ${message}`);
        failCount++;
    }
}

const html = fs.readFileSync('index.html', 'utf8');

// ============================================================================
// SUITE 1: MOBILE LANDING PAGE BALANCED TOOL CARDS
// ============================================================================
console.log('--- Suite 1: Mobile Landing Page Balanced Tool Cards ---');

assert(html.includes('id="mobile-image-creations-btn"'), 'Landing page contains #mobile-image-creations-btn');
assert(html.includes('min-h-[64px]'), 'Tool cards have balanced standard min-h-[64px]');
assert(html.includes('py-2.5 px-3 min-h-[64px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23_42,0.03)] hover:bg-slate-50/70') || html.includes('min-h-[64px] rounded-2xl bg-[#FFFFFF]'),
    'Tool cards have #FFFFFF surface match with subtle border and shadow');

const cardIds = ['mobile-card-generate', 'mobile-card-remove-bg', 'mobile-card-precise-edit', 'mobile-card-upscale'];
cardIds.forEach(id => {
    assert(html.includes(`id="${id}"`), `Card #${id} exists`);
});

const thumbRegex = /<img src="\/workflows\/[^"]+"\s+alt="[^"]+"\s+class="w-10 h-10 rounded-xl overflow-hidden shrink-0 object-cover"/g;
const thumbMatches = html.match(thumbRegex) || [];
assert(thumbMatches.length >= 4, `All 4 tool cards have balanced w-10 h-10 rounded-xl thumbnails (found ${thumbMatches.length})`);

// ============================================================================
// SUITE 2: CREATIONS RESULT FEED CLEAN METADATA & TEXT-ONLY ACTIONS
// ============================================================================
console.log('\n--- Suite 2: Creations Result Feed Clean Metadata & Text-Only Actions ---');

// Sticky footer removed
assert(!html.includes('id="mobile-result-edit-prompt-btn"'), 'Sticky footer "Edit Prompt" button removed');
assert(!html.includes('id="mobile-result-regenerate-btn"'), 'Sticky footer "Regenerate" button removed');
assert(html.includes('id="mobile-result-scroll-feed"') && html.includes('pb-8 space-y-6'), 'Scroll feed has clean pb-8 bottom padding');

// Feed Header
assert(html.includes('<h2 class="text-[16px] font-semibold text-slate-900 tracking-tight">Creations</h2>'),
    'Creations header title present next to back button');

// Buttonless feed: inline action buttons removed from feed
assert(!html.includes('mobile-action-edit-btn'), 'Inline action button "Edit" removed from feed');
assert(!html.includes('mobile-action-upscale-btn'), 'Inline action button "Upscale" removed from feed');
assert(!html.includes('mobile-action-download-btn'), 'Inline action button "Download" removed from feed');

// ============================================================================
// SUITE 3: MOBILE FULL-SCREEN IMAGE PREVIEW MODAL
// ============================================================================
console.log('\n--- Suite 3: Mobile Full-Screen Image Preview Modal ---');

assert(html.includes('id="template-white-preview-modal" class="hidden fixed inset-0 z-[90] md:z-[10000] bg-[#FFFFFF] md:bg-black/65'),
    'Preview modal uses full-screen borderless plain #FFFFFF surface on mobile');
assert(html.includes('id="tmpl-modal-backdrop" class="hidden md:block'), 'Dark backdrop is hidden on mobile');
assert(html.includes('w-full max-h-[75vh] md:max-h-[82vh] md:w-auto md:max-w-full rounded-none md:rounded-lg object-contain'),
    'Preview image is full-bleed edge-to-edge (w-full rounded-none object-contain) on mobile');
assert(html.includes('px-5 pt-4 pb-8 md:p-6 flex flex-col justify-between bg-[#FFFFFF] md:bg-white'),
    'Details panel has clean px-5 pt-4 pb-8 padding below image on mobile');
assert(html.includes('tmpl-modal-close-btn" class="fixed top-3.5 left-4 z-40 md:absolute md:top-4 md:left-4 md:z-20 w-9 h-9 md:w-8 md:h-8 rounded-full bg-[#FFFFFF]'),
    'Clean circular close (×) button on top-left of mobile preview');

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
            add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
            remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
            contains: (c) => this.classList._classes.has(c),
            toggle: (c) => {
                if (this.classList._classes.has(c)) this.classList._classes.delete(c);
                else this.classList._classes.add(c);
            }
        };
        this.style = {};
        this.textContent = '';
        this.innerHTML = '';
        this.value = '';
        this.children = [];
        this.dataset = {};
        this.onclick = null;
        this.attributes = {};
    }
    appendChild(child) {
        this.children.push(child);
        return child;
    }
    querySelector(selector) {
        if (selector === '.copy-icon') return new MockElement('span');
        if (selector === '.check-icon') return new MockElement('span');
        if (selector === '.copy-label') return new MockElement('span');
        return null;
    }
    querySelectorAll() { return []; }
    setAttribute(k, v) { this.attributes[k] = v; }
    getAttribute(k) { return this.attributes[k]; }
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
const modal = mockDoc.getElementById('template-white-preview-modal');
modal.classList.add('hidden');
const modalTitle = mockDoc.getElementById('tmpl-modal-title');
const promptSection = mockDoc.getElementById('tmpl-modal-prompt-section');
const scaleSection = mockDoc.getElementById('tmpl-modal-scale-section');
const scaleBadge = mockDoc.getElementById('tmpl-modal-scale-badge');
const ctaBtn = mockDoc.getElementById('tmpl-modal-cta-btn');
const downloadBtn = mockDoc.getElementById('tmpl-modal-download-btn');
const copyBtn = mockDoc.getElementById('tmpl-modal-copy-prompt-btn');

const fnCode = html.substring(
    html.indexOf('function openTemplateWhitePreviewModal('),
    html.indexOf('function renderImageHomeTemplates()', html.indexOf('function openTemplateWhitePreviewModal('))
);

let downloadedFile = null;
const sandbox = {
    document: mockDoc,
    window: { innerWidth: 375 },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    triggerSilentTemplateDownload: (url, title) => { downloadedFile = { url, title }; },
    setIsMobileDrawerOpen: (v) => {},
    openMobileWorkspaceDrawer: (tool, opts) => {},
    console: console
};

vm.createContext(sandbox);
vm.runInContext(fnCode, sandbox);

// 4.1 Generate Image Result
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'generate-image',
    imageUrl: 'https://example.com/gen.png',
    prompt: 'A futuristic city in mist',
    title: 'Generate Image'
});

assert(modalTitle.textContent === 'Generate Image', 'Title is "Generate Image"');
assert(!promptSection.classList.contains('hidden'), 'Prompt section is visible');
assert(scaleSection.classList.contains('hidden'), 'Scale section is hidden for Generate Image');
assert(ctaBtn.classList.contains('hidden'), 'CTA button is hidden for feed result');
assert(downloadBtn.innerHTML === 'Download', 'Download button is iconless with text "Download"');

// 4.2 Upscale Image Result
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'upscale-image',
    imageUrl: 'https://example.com/up.png',
    scale: '4x',
    title: 'Upscale Image'
});

assert(modalTitle.textContent === 'Upscale Image', 'Title is "Upscale Image"');
assert(promptSection.classList.contains('hidden'), 'Prompt section is hidden for Upscale Image');
assert(!scaleSection.classList.contains('hidden'), 'Scale section is visible for Upscale Image');
assert(scaleBadge.textContent === '4x', 'Scale badge shows "4x"');
assert(downloadBtn.innerHTML === 'Download', 'Download button is iconless');

// 4.3 Remove Background Result
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'remove-background',
    imageUrl: 'https://example.com/rm.png',
    title: 'Remove Background'
});

assert(modalTitle.classList.contains('hidden'), 'Heading is hidden for Remove Background (image only)');
assert(promptSection.classList.contains('hidden'), 'Prompt section is hidden for Remove Background');
assert(scaleSection.classList.contains('hidden'), 'Scale section is hidden for Remove Background');
assert(downloadBtn.innerHTML === 'Download', 'Download button is iconless for Remove Background');

// 4.4 Template Preview
sandbox.openTemplateWhitePreviewModal({
    title: 'Clay Character',
    prompt: '3D clay character',
    imageUrl: '/templates/clay-character.jpg',
    targetWorkflow: 'generate-image'
});

assert(!modalTitle.classList.contains('hidden'), 'Template title is visible');
assert(modalTitle.textContent === 'Clay Character', 'Template title shows "Clay Character"');
assert(!ctaBtn.classList.contains('hidden'), 'CTA button is visible for regular template');
assert(downloadBtn.innerHTML.includes('<svg'), 'Download button contains SVG icon for regular template preview');

// Reset on close
sandbox.closeTemplateWhitePreviewModal();
assert(modal.classList.contains('hidden'), 'Modal is closed');
assert(downloadBtn.innerHTML.includes('<svg'), 'Download button reset with SVG icon');

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
    process.exit(1);
}
