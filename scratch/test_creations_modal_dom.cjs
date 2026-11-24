const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== RUNNING IN-DEPTH DOM SIMULATION FOR MODAL POLISH ===\n');

// Mock a lightweight DOM environment
class MockClassList {
    constructor(classes = []) {
        this.classes = new Set(classes);
    }
    add(...cls) {
        cls.forEach(c => this.classes.add(c));
    }
    remove(...cls) {
        cls.forEach(c => this.classes.delete(c));
    }
    contains(cls) {
        return this.classes.has(cls);
    }
    toggle(cls) {
        if (this.classes.has(cls)) this.classes.delete(cls);
        else this.classes.add(cls);
    }
    get className() {
        return Array.from(this.classes).join(' ');
    }
    set className(val) {
        this.classes = new Set((val || '').split(/\s+/).filter(Boolean));
    }
}

class MockElement {
    constructor(id, tag = 'div', className = '') {
        this.id = id;
        this.tagName = tag.toUpperCase();
        this.classList = new MockClassList(className.split(/\s+/).filter(Boolean));
        this.style = {};
        this.dataset = {};
        this.textContent = '';
        this._innerHTML = '';
        this.onclick = null;
    }
    get innerHTML() {
        return this._innerHTML;
    }
    set innerHTML(val) {
        this._innerHTML = val;
        this.textContent = (val || '').replace(/<[^>]*>/g, '');
    }
    get className() {
        return this.classList.className;
    }
    set className(val) {
        this.classList.className = val;
    }
    querySelector(sel) {
        return new MockElement('sub', 'span');
    }
    querySelectorAll() {
        return [];
    }
}

const elements = {
    'template-white-preview-modal': new MockElement('template-white-preview-modal', 'div', 'hidden'),
    'tmpl-modal-card-container': new MockElement('tmpl-modal-card-container', 'div', 'relative w-full max-w-[420px] md:max-w-5xl h-auto max-h-[92dvh] md:max-h-[92vh] bg-white text-neutral-900 rounded-3xl md:rounded-2xl shadow-2xl border border-slate-200/80 md:border-neutral-200 flex flex-col md:flex-row overflow-hidden'),
    'tmpl-modal-img': new MockElement('tmpl-modal-img', 'img'),
    'tmpl-modal-fallback': new MockElement('tmpl-modal-fallback', 'div', 'hidden'),
    'tmpl-modal-fallback-title': new MockElement('tmpl-modal-fallback-title', 'span'),
    'tmpl-modal-prompt-text': new MockElement('tmpl-modal-prompt-text', 'div'),
    'tmpl-modal-cta-btn': new MockElement('tmpl-modal-cta-btn', 'button'),
    'tmpl-modal-cta-text': new MockElement('tmpl-modal-cta-text', 'span'),
    'tmpl-modal-download-btn': new MockElement('tmpl-modal-download-btn', 'button'),
    'tmpl-modal-copy-prompt-btn': new MockElement('tmpl-modal-copy-prompt-btn', 'button'),
    'tmpl-modal-title': new MockElement('tmpl-modal-title', 'h3'),
    'tmpl-modal-prompt-section': new MockElement('tmpl-modal-prompt-section', 'div'),
    'tmpl-modal-scale-section': new MockElement('tmpl-modal-scale-section', 'div', 'hidden'),
    'tmpl-modal-scale-badge': new MockElement('tmpl-modal-scale-badge', 'span'),
    'tmpl-modal-rembg-section': new MockElement('tmpl-modal-rembg-section', 'div', 'hidden'),
    'tmpl-modal-rembg-badge': new MockElement('tmpl-modal-rembg-badge', 'span'),
    'tmpl-modal-feed-actions': new MockElement('tmpl-modal-feed-actions', 'div', 'hidden'),
    'tmpl-modal-edit-btn': new MockElement('tmpl-modal-edit-btn', 'button'),
    'tmpl-modal-upscale-btn': new MockElement('tmpl-modal-upscale-btn', 'button'),
    'tmpl-modal-prev-btn': new MockElement('tmpl-modal-prev-btn', 'button', 'hidden'),
    'tmpl-modal-next-btn': new MockElement('tmpl-modal-next-btn', 'button', 'hidden')
};

// Extract openTemplateWhitePreviewModal and closeTemplateWhitePreviewModal code
const fnMatch = html.match(/(function openTemplateWhitePreviewModal\([\s\S]*?)(function closeTemplateWhitePreviewModal\([\s\S]*?)(?=function\s+[a-zA-Z0-9_]+\s*\(|<\/script>)/);

if (!fnMatch) {
    console.error('[FAIL] Could not extract openTemplateWhitePreviewModal and closeTemplateWhitePreviewModal functions!');
    process.exit(1);
}

const functionCode = `
let activePreviewModalTemplate = null;
let activePreviewModalImageUrl = '';
let activePreviewModalBatchImages = [];
let activePreviewModalBatchIndex = 0;
let isMobile = true;
function triggerSilentTemplateDownload() {}

${fnMatch[1]}
${fnMatch[2]}
`;

const sandbox = {
    document: {
        getElementById: (id) => elements[id] || null
    },
    window: {
        selectedTemplate: null
    },
    navigator: {
        clipboard: { writeText: () => Promise.resolve() }
    },
    console: console,
    setTimeout: (cb) => {},
    Date: Date,
    Array: Array
};

vm.createContext(sandbox);
vm.runInContext(functionCode, sandbox);

const openModal = sandbox.openTemplateWhitePreviewModal;
const closeModal = sandbox.closeTemplateWhitePreviewModal;

function assert(cond, msg) {
    if (!cond) {
        console.error(`[FAIL] ${msg}`);
        process.exit(1);
    }
    console.log(`[PASS] ${msg}`);
}

// ── TEST 1: Remove Background Feed Result ──
console.log('--- 1. Testing Remove Background Item ---');
openModal({
    isFeedResult: true,
    workspaceType: 'remove-background',
    title: 'Product Cutout',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
});

assert(elements['tmpl-modal-title'].textContent === 'Remove Background', 'Title is "Remove Background"');
assert(!elements['tmpl-modal-title'].classList.contains('hidden'), 'Title is visible');
assert(!elements['tmpl-modal-rembg-section'].classList.contains('hidden'), 'Background section is VISIBLE');
assert(elements['tmpl-modal-prompt-section'].classList.contains('hidden'), 'Prompt section is HIDDEN');
assert(elements['tmpl-modal-scale-section'].classList.contains('hidden'), 'Scale section is HIDDEN');
assert(!elements['tmpl-modal-feed-actions'].classList.contains('hidden'), 'Feed actions (Edit/Upscale) are VISIBLE');
assert(elements['tmpl-modal-download-btn'].textContent === 'Download', 'Download button has text "Download"');
assert(elements['tmpl-modal-download-btn'].className.includes('w-full'), 'Download button is full-width');
assert(elements['tmpl-modal-card-container'].classList.contains('rounded-3xl'), 'Card container has rounded-3xl');
assert(elements['tmpl-modal-card-container'].className.includes('h-auto max-h-[92dvh]'), 'Card container has h-auto max-h-[92dvh]');

closeModal();
assert(elements['tmpl-modal-rembg-section'].classList.contains('hidden'), 'After close, rembg-section is reset to hidden');

// ── TEST 2: Upscale Image Feed Result ──
console.log('\n--- 2. Testing Upscale Image Item ---');
openModal({
    isFeedResult: true,
    workspaceType: 'upscale-image',
    title: 'Vintage Photo',
    scale: '4x',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
});

assert(elements['tmpl-modal-title'].textContent === 'Upscale Image', 'Title is "Upscale Image"');
assert(!elements['tmpl-modal-title'].classList.contains('hidden'), 'Title is visible');
assert(!elements['tmpl-modal-scale-section'].classList.contains('hidden'), 'Scale section is VISIBLE');
assert(elements['tmpl-modal-scale-badge'].textContent === '4×', 'Scale badge formatted to "4×"');
assert(elements['tmpl-modal-prompt-section'].classList.contains('hidden'), 'Prompt section is HIDDEN');
assert(elements['tmpl-modal-rembg-section'].classList.contains('hidden'), 'Background section is HIDDEN');

closeModal();
assert(elements['tmpl-modal-scale-section'].classList.contains('hidden'), 'After close, scale-section is reset to hidden');

// ── TEST 3: Precise Edit Feed Result ──
console.log('\n--- 3. Testing Precise Edit Item ---');
openModal({
    isFeedResult: true,
    workspaceType: 'precise-edit',
    title: 'Neon Cat',
    prompt: 'Add holographic sunglasses',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
});

assert(elements['tmpl-modal-title'].textContent === 'Precise Edit', 'Title is "Precise Edit"');
assert(!elements['tmpl-modal-title'].classList.contains('hidden'), 'Title is visible');
assert(!elements['tmpl-modal-prompt-section'].classList.contains('hidden'), 'Prompt section is VISIBLE');
assert(elements['tmpl-modal-prompt-text'].textContent === 'Add holographic sunglasses', 'Prompt text is populated');
assert(elements['tmpl-modal-scale-section'].classList.contains('hidden'), 'Scale section is HIDDEN');
assert(elements['tmpl-modal-rembg-section'].classList.contains('hidden'), 'Background section is HIDDEN');

closeModal();

// ── TEST 4: Generate Image Feed Result ──
console.log('\n--- 4. Testing Generate Image Item ---');
openModal({
    isFeedResult: true,
    workspaceType: 'generate-image',
    title: 'Sunset Mountains',
    prompt: 'Majestic sunset over snow-capped mountains',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
});

assert(elements['tmpl-modal-title'].textContent === 'Generate Image', 'Title is "Generate Image"');
assert(!elements['tmpl-modal-title'].classList.contains('hidden'), 'Title is visible');
assert(!elements['tmpl-modal-prompt-section'].classList.contains('hidden'), 'Prompt section is VISIBLE');
assert(elements['tmpl-modal-prompt-text'].textContent === 'Majestic sunset over snow-capped mountains', 'Prompt text is populated');
assert(elements['tmpl-modal-scale-section'].classList.contains('hidden'), 'Scale section is HIDDEN');
assert(elements['tmpl-modal-rembg-section'].classList.contains('hidden'), 'Background section is HIDDEN');

closeModal();

// ── TEST 5: Desktop Landing Page Template (Non-Feed) ──
console.log('\n--- 5. Testing Desktop Landing Page Template (Non-Feed) ---');
sandbox.isMobile = false;
openModal({
    isFeedResult: false,
    title: 'Cyberpunk Portrait',
    prompt: 'Cyberpunk warrior neon lighting',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
});

assert(elements['tmpl-modal-title'].textContent === 'Cyberpunk Portrait', 'Desktop title uses template title');
assert(!elements['tmpl-modal-cta-btn'].classList.contains('hidden'), 'Desktop CTA button ("Use Prompt") is VISIBLE');
assert(elements['tmpl-modal-feed-actions'].classList.contains('hidden'), 'Desktop feed actions (Edit/Upscale) are HIDDEN');
assert(elements['tmpl-modal-scale-section'].classList.contains('hidden'), 'Scale section is HIDDEN');
assert(elements['tmpl-modal-rembg-section'].classList.contains('hidden'), 'Background section is HIDDEN');
assert(!elements['tmpl-modal-prompt-section'].classList.contains('hidden'), 'Prompt section is VISIBLE');

closeModal();

console.log('\n>>> ALL 5 MODAL DOM SCENARIOS PASSED WITH 100% SUCCESS! <<<\n');
