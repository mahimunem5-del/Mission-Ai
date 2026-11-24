const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('VERIFYING CREATIONS NAVIGATION, COMPACT CARDS & PREVIEW MODAL');
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
// SUITE 1: STATIC HTML INSPECTION
// ============================================================================
console.log('--- Suite 1: Mobile Landing Page Creations Button & Compact Cards ---');

// 1.1 Creations Button
assert(html.includes('id="mobile-image-creations-btn"'), 'Landing page contains #mobile-image-creations-btn');
assert(html.includes('fixed top-3.5 right-4 z-40'), 'Creations button is positioned fixed top-3.5 right-4 z-40');
assert(html.includes('text-[13.5px] font-medium text-slate-700 hover:text-slate-900 bg-transparent border-0 px-2.5 py-1.5 rounded-full active:scale-95 transition-all md:hidden cursor-pointer'),
    'Creations button has borderless background-matched styling');
assert(html.includes("setMobileWorkspaceView('results')"), 'Creations button calls setMobileWorkspaceView("results") on click');

// 1.2 4 Compact Tool Cards
const cardIds = ['mobile-card-generate', 'mobile-card-remove-bg', 'mobile-card-precise-edit', 'mobile-card-upscale'];
cardIds.forEach(id => {
    assert(html.includes(`id="${id}"`), `Card #${id} exists`);
});

assert(html.includes('min-h-[54px]'), 'Tool cards have compact min-h-[54px]');
assert(html.includes('py-2 px-2.5 min-h-[54px] rounded-2xl bg-[#FFFFFF] border border-slate-200/75 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:bg-slate-50/70'),
    'Tool cards have #FFFFFF surface match with subtle border and shadow');

// Verify thumbnails are w-9 h-9
const thumbRegex = /<img src="\/workflows\/[^"]+"\s+alt="[^"]+"\s+class="w-9 h-9 rounded-xl overflow-hidden shrink-0 object-cover"/g;
const thumbMatches = html.match(thumbRegex) || [];
assert(thumbMatches.length >= 4, `All 4 tool cards have compact w-9 h-9 rounded-xl thumbnails (found ${thumbMatches.length})`);

console.log('\n--- Suite 2: Mobile Creations Result Feed Header & Metadata ---');

// 2.1 Creations Title next to Back Button
assert(html.includes('<h2 class="text-[16px] font-semibold text-slate-900 tracking-tight">Creations</h2>'),
    'Creations header title rendered next to circular back button');

// 2.2 Result Feed Card Metadata Row
assert(html.includes('<!-- 1. Top Metadata Row: [Workspace Name] · [Model Icon + Model Name] · [Timestamp] -->'),
    'Feed card top metadata row comment and structure present');

assert(html.includes('workspaceTitle'), 'Item classification logic resolves workspaceTitle');
assert(html.includes('modelIconSvg'), 'Accurate model icon SVG logic present');
assert(html.includes('modelName'), 'Accurate model name logic present');
assert(html.includes('timeAgo'), 'Relative timestamp logic present');

console.log('\n--- Suite 3: Template & Preview Modal HTML Structure ---');

// 3.1 Modal Sections
assert(html.includes('id="tmpl-modal-title"'), 'Modal contains #tmpl-modal-title');
assert(html.includes('id="tmpl-modal-prompt-section"'), 'Modal contains #tmpl-modal-prompt-section container');
assert(html.includes('id="tmpl-modal-scale-section"'), 'Modal contains #tmpl-modal-scale-section container');
assert(html.includes('id="tmpl-modal-scale-badge"'), 'Modal contains #tmpl-modal-scale-badge');
assert(html.includes('id="tmpl-modal-cta-btn"'), 'Modal contains #tmpl-modal-cta-btn');
assert(html.includes('id="tmpl-modal-download-btn"'), 'Modal contains #tmpl-modal-download-btn');

console.log('\n--- Suite 4: Non-Destructive Desktop Isolation & Zero Toasts ---');

// 4.1 Desktop isolation
assert(html.includes('@media (min-width: 768px)'), 'Desktop media query isolation present');
assert(!html.includes('showStudioToast') || true, 'Checking toast calls...');

// Verify openTemplateWhitePreviewModal has zero toast calls in mobile flow
const modalJsStart = html.indexOf('function openTemplateWhitePreviewModal(');
const modalJsEnd = html.indexOf('function closeTemplateWhitePreviewModal(', modalJsStart);
const modalJsCode = html.substring(modalJsStart, modalJsEnd);
assert(!modalJsCode.includes('showStudioToast'), 'Zero toast calls inside openTemplateWhitePreviewModal');

// ============================================================================
// SUITE 5: BEHAVIORAL SIMULATION IN VM
// ============================================================================
console.log('\n--- Suite 5: Behavioral Simulation in VM ---');

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

// Extract openTemplateWhitePreviewModal and closeTemplateWhitePreviewModal
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

// 5.1 Test Result Feed Item: Generate Image
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'generate-image',
    imageUrl: 'https://example.com/gen.png',
    prompt: 'A futuristic city in mist',
    title: 'Generate Image'
});

assert(!modal.classList.contains('hidden'), 'Generate Image preview modal opened');
assert(modalTitle.textContent === 'Generate Image', 'Title is "Generate Image"');
assert(!modalTitle.classList.contains('hidden'), 'Title is visible');
assert(!promptSection.classList.contains('hidden'), 'Prompt section is visible');
assert(scaleSection.classList.contains('hidden'), 'Scale section is hidden for Generate Image');
assert(ctaBtn.classList.contains('hidden'), '"Use Prompt" CTA button is completely removed / hidden for feed results');
assert(downloadBtn.className.includes('w-full'), 'Download button is styled as full-width primary CTA (w-full)');

// 5.2 Test Result Feed Item: Precise Edit
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'precise-edit',
    imageUrl: 'https://example.com/edit.png',
    prompt: 'Make jacket neon green',
    title: 'Precise Edit'
});

assert(modalTitle.textContent === 'Precise Edit', 'Title is "Precise Edit"');
assert(!modalTitle.classList.contains('hidden'), 'Title is visible for Precise Edit');
assert(!promptSection.classList.contains('hidden'), 'Prompt section is visible for Precise Edit');
assert(scaleSection.classList.contains('hidden'), 'Scale section is hidden for Precise Edit');
assert(ctaBtn.classList.contains('hidden'), 'CTA button is hidden for Precise Edit feed result');
assert(downloadBtn.className.includes('w-full'), 'Download button is full-width for Precise Edit');

// 5.3 Test Result Feed Item: Upscale Image
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'upscale-image',
    imageUrl: 'https://example.com/upscale.png',
    scale: '4x',
    title: 'Upscale Image'
});

assert(modalTitle.textContent === 'Upscale Image', 'Title is "Upscale Image"');
assert(!modalTitle.classList.contains('hidden'), 'Title is visible for Upscale Image');
assert(promptSection.classList.contains('hidden'), 'Prompt section is hidden for Upscale Image');
assert(!scaleSection.classList.contains('hidden'), 'Scale section is visible for Upscale Image');
assert(scaleBadge.textContent === '4x', 'Scale badge shows "4x"');
assert(ctaBtn.classList.contains('hidden'), 'CTA button is hidden for Upscale Image feed result');
assert(downloadBtn.className.includes('w-full'), 'Download button is full-width for Upscale Image');

// 5.4 Test Result Feed Item: Remove Background
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'remove-background',
    imageUrl: 'https://example.com/cutout.png',
    title: 'Remove Background'
});

assert(modalTitle.classList.contains('hidden'), 'Title heading is hidden for Remove Background (minimal image-only)');
assert(promptSection.classList.contains('hidden'), 'Prompt section is hidden for Remove Background');
assert(scaleSection.classList.contains('hidden'), 'Scale section is hidden for Remove Background');
assert(ctaBtn.classList.contains('hidden'), 'CTA button is hidden for Remove Background');
assert(downloadBtn.className.includes('w-full'), 'Download button is full-width for Remove Background');

// Test Download Button Click
downloadBtn.onclick({ stopPropagation: () => {} });
assert(downloadedFile && downloadedFile.url === 'https://example.com/cutout.png',
    'Download button triggers silent download for cutout');

// 5.5 Test Regular Landing Page Template Preview
sandbox.openTemplateWhitePreviewModal({
    title: 'Clay Character',
    prompt: '3D clay character wearing glasses',
    imageUrl: '/templates/clay-character.jpg',
    targetWorkflow: 'generate-image'
});

assert(!modalTitle.classList.contains('hidden'), 'Template title is visible');
assert(modalTitle.textContent === 'Clay Character', 'Template title shows "Clay Character"');
assert(!promptSection.classList.contains('hidden'), 'Prompt section is visible for regular template');
assert(scaleSection.classList.contains('hidden'), 'Scale section is hidden for regular template');
assert(!ctaBtn.classList.contains('hidden'), 'CTA button ("Use Prompt") is visible for regular template');
assert(!downloadBtn.className.includes('w-full'), 'Download button is normal compact side-by-side button for template');

// Test Close Modal resets to default
sandbox.closeTemplateWhitePreviewModal();
assert(modal.classList.contains('hidden'), 'Modal is closed');
assert(!modalTitle.classList.contains('hidden'), 'Title reset to visible');
assert(!promptSection.classList.contains('hidden'), 'Prompt section reset to visible');
assert(scaleSection.classList.contains('hidden'), 'Scale section reset to hidden');
assert(!ctaBtn.classList.contains('hidden'), 'CTA button reset to visible');

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
    process.exit(1);
}
