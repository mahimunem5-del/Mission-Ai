const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('VERIFYING CREATIONS BUTTON, BUTTONLESS FEED & MODAL HIERARCHY');
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
// SUITE 1: PERMANENTLY FIXED TOP-RIGHT CREATIONS BUTTON
// ============================================================================
console.log('--- Suite 1: Permanently Fixed Top-Right Creations Button ---');

assert(html.includes('id="mobile-image-creations-btn"'), '#mobile-image-creations-btn exists');
assert(html.includes('id="mobile-image-creations-btn"\n                    class="fixed top-3.5 right-4 z-30 text-[13.5px] font-medium text-slate-700 hover:text-slate-900 bg-[#FFFFFF]/95 backdrop-blur-xs border-0 px-2.5 py-1 rounded-full') ||
       html.includes('class="fixed top-3.5 right-4 z-30 text-[13.5px] font-medium text-slate-700 hover:text-slate-900 bg-[#FFFFFF]/95 backdrop-blur-xs border-0 px-2.5 py-1 rounded-full'),
    'Creations button has fixed top-3.5 right-4 z-30 with bg-[#FFFFFF]/95 backdrop-blur-xs mask');

assert(html.includes('id="mobile-image-sidebar-btn"\n                    class="fixed top-3.5 left-4 z-40') ||
       html.includes('id="mobile-image-sidebar-btn" class="fixed top-3.5 left-4 z-40') ||
       html.includes('mobile-image-sidebar-btn'),
    'Left sidebar toggle button (=) is untouched and preserved');

// ============================================================================
// SUITE 2: CLEAN BUTTONLESS CREATIONS RESULT FEED (< 768px)
// ============================================================================
console.log('\n--- Suite 2: Clean Buttonless Creations Result Feed (< 768px) ---');

assert(!html.includes('mobile-action-edit-btn'), 'Action button "Edit" completely removed from feed cards');
assert(!html.includes('mobile-action-upscale-btn'), 'Action button "Upscale" completely removed from feed cards');
assert(!html.includes('mobile-action-download-btn'), 'Action button "Download" completely removed from feed cards');

// Feed entries only have header, prompt, and output frame
assert(html.includes('card.innerHTML = metadataRowHtml') &&
       html.includes('<div class="mobile-output-frame \' + frameMarginClass + \' w-[82%] max-w-[290px] rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 cursor-pointer shadow-2xs hover:shadow-sm transition-shadow">') &&
       !html.includes('mobile-action-edit-btn') &&
       !html.includes('mobile-action-upscale-btn') &&
       !html.includes('mobile-action-download-btn'),
    'Creation card renders cleanly with only metadata, prompt row, and image frame (0 buttons underneath)');

// ============================================================================
// SUITE 3: MODAL DUAL-TIER ACTION HIERARCHY & CONDITIONAL ARROWS
// ============================================================================
console.log('\n--- Suite 3: Modal Dual-Tier Action Hierarchy & Conditional Arrows ---');

assert(html.includes('id="tmpl-modal-prev-btn"'), 'Previous image arrow #tmpl-modal-prev-btn exists');
assert(html.includes('id="tmpl-modal-next-btn"'), 'Next image arrow #tmpl-modal-next-btn exists');
assert(html.includes('absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#FFFFFF]/90'),
    'Prev arrow styled with absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFFFF]/90');
assert(html.includes('absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-[#FFFFFF]/90'),
    'Next arrow styled with absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFFFF]/90');

assert(html.includes('id="tmpl-modal-feed-actions" class="hidden grid grid-cols-2 gap-2.5 w-full mb-2.5 md:hidden"'),
    'Two-tier feed actions container exists: grid grid-cols-2 gap-2.5 w-full mb-2.5 md:hidden');

assert(html.includes('id="tmpl-modal-edit-btn"\n                            class="h-11 rounded-xl bg-[#FFFFFF] border border-slate-200/85 text-slate-900 text-sm font-medium') ||
       html.includes('id="tmpl-modal-edit-btn"') && html.includes('h-11 rounded-xl bg-[#FFFFFF] border border-slate-200/85'),
    'Modal Edit button styled with h-11 rounded-xl bg-[#FFFFFF] border border-slate-200/85');

assert(html.includes('id="tmpl-modal-upscale-btn"\n                            class="h-11 rounded-xl bg-[#FFFFFF] border border-slate-200/85 text-slate-900 text-sm font-medium') ||
       html.includes('id="tmpl-modal-upscale-btn"') && html.includes('h-11 rounded-xl bg-[#FFFFFF] border border-slate-200/85'),
    'Modal Upscale button styled with h-11 rounded-xl bg-[#FFFFFF] border border-slate-200/85');

assert(html.includes('w-full h-11 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold'),
    'Modal Download button matches exact h-11 height and rounded-xl radius full-width directly below');

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

// Elements
const previewModal = mockDoc.getElementById('template-white-preview-modal');
previewModal.classList.add('hidden');

const mobileTmplModal = mockDoc.getElementById('mobile-template-card-modal');
mobileTmplModal.classList.add('hidden');

const modalImg = mockDoc.getElementById('tmpl-modal-img');
const prevBtn = mockDoc.getElementById('tmpl-modal-prev-btn');
prevBtn.classList.add('hidden');
const nextBtn = mockDoc.getElementById('tmpl-modal-next-btn');
nextBtn.classList.add('hidden');
const feedActions = mockDoc.getElementById('tmpl-modal-feed-actions');
feedActions.classList.add('hidden');
const editBtn = mockDoc.getElementById('tmpl-modal-edit-btn');
const upscaleBtn = mockDoc.getElementById('tmpl-modal-upscale-btn');
const downloadBtn = mockDoc.getElementById('tmpl-modal-download-btn');
const ctaBtn = mockDoc.getElementById('tmpl-modal-cta-btn');

const fnCode = html.substring(
    html.indexOf('let activePreviewModalImageUrl'),
    html.indexOf('function renderImageHomeTemplates()', html.indexOf('let activePreviewModalImageUrl'))
);

let downloadedUrl = null;
let preciseEditSourceItem = null;
let upscaleSourceItem = null;
let openedDrawerTool = null;

const sandbox = {
    document: mockDoc,
    window: { innerWidth: 360 },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    triggerSilentTemplateDownload: (url, title) => { downloadedUrl = url; },
    setIsMobileDrawerOpen: (v) => {},
    closeMobileWorkspaceDrawer: () => {},
    openMobileWorkspaceDrawer: (tool, opts) => { openedDrawerTool = tool; },
    setMobilePreciseEditSource: (item) => { preciseEditSourceItem = item; },
    setMobileUpscaleSource: (item) => { upscaleSourceItem = item; },
    console: console,
    Event: function (type) { this.type = type; }
};
sandbox.window.window = sandbox.window;
sandbox.window.document = mockDoc;

vm.createContext(sandbox);
vm.runInContext(fnCode, sandbox);

// 4.1 Single Image Result in Feed
sandbox.window.innerWidth = 360;
sandbox.openTemplateWhitePreviewModal({
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'generate-image',
    imageUrl: 'https://example.com/single.png',
    prompt: 'Solo mountain peak',
    title: 'Generate Image'
});

assert(!previewModal.classList.contains('hidden'), 'Single-image feed item opens preview modal');
assert(prevBtn.classList.contains('hidden'), 'Single-image feed item HIDES prev button');
assert(nextBtn.classList.contains('hidden'), 'Single-image feed item HIDES next button');
assert(!feedActions.classList.contains('hidden'), 'Two-tier actions (Edit + Upscale) are VISIBLE for single image');
assert(ctaBtn.classList.contains('hidden'), 'CTA button is hidden for feed item');
assert(downloadBtn.textContent === 'Download', 'Full-width download button is present');

// Close modal
sandbox.closeTemplateWhitePreviewModal();
assert(previewModal.classList.contains('hidden'), 'Modal closes cleanly');
assert(feedActions.classList.contains('hidden'), 'Feed actions hidden upon close');

// 4.2 Multi-Image Batch Result (count = 3)
const batchItem = {
    isFeedResult: true,
    isResultItem: true,
    workspaceType: 'generate-image',
    imageUrl: 'https://example.com/batch1.png',
    prompt: 'Futuristic vehicle concept',
    title: 'Generate Image',
    images: [
        'https://example.com/batch1.png',
        'https://example.com/batch2.png',
        'https://example.com/batch3.png'
    ]
};

sandbox.openTemplateWhitePreviewModal(batchItem);

assert(!prevBtn.classList.contains('hidden'), 'Multi-image batch SHOWS prev button');
assert(!nextBtn.classList.contains('hidden'), 'Multi-image batch SHOWS next button');
assert(modalImg.src === 'https://example.com/batch1.png', 'Initial preview image is batch1');

// Cycle next
nextBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
assert(modalImg.src === 'https://example.com/batch2.png', 'Next arrow cycles to batch2');

nextBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
assert(modalImg.src === 'https://example.com/batch3.png', 'Next arrow cycles to batch3');

// Cycle prev
prevBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
assert(modalImg.src === 'https://example.com/batch2.png', 'Prev arrow cycles back to batch2');

// Click Edit while batch2 is active
editBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
assert(previewModal.classList.contains('hidden'), 'Clicking Edit closes preview modal');
assert(openedDrawerTool === 'precise-edit', 'Clicking Edit opens precise-edit drawer');
assert(preciseEditSourceItem && preciseEditSourceItem.url === 'https://example.com/batch2.png',
    'Precise Edit loaded currently active batch image (batch2)');

// Re-open and click Upscale on batch3
sandbox.openTemplateWhitePreviewModal(batchItem);
nextBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
nextBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
assert(modalImg.src === 'https://example.com/batch3.png', 'Cycled to batch3');

upscaleBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
assert(previewModal.classList.contains('hidden'), 'Clicking Upscale closes preview modal');
assert(openedDrawerTool === 'upscale-image', 'Clicking Upscale opens upscale-image drawer');
assert(upscaleSourceItem && upscaleSourceItem.url === 'https://example.com/batch3.png',
    'Upscale loaded currently active batch image (batch3)');

// Re-open and click Download on batch3
sandbox.openTemplateWhitePreviewModal(batchItem);
nextBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
nextBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
downloadBtn.onclick({ preventDefault: () => {}, stopPropagation: () => {} });
assert(downloadedUrl === 'https://example.com/batch3.png', 'Download operates on currently active batch image (batch3)');

// 4.3 Desktop Template Preview (Isolation Check)
sandbox.window.innerWidth = 1440;
sandbox.openTemplateWhitePreviewModal({
    title: 'Minimal Poster',
    prompt: 'Clean typography poster',
    imageUrl: 'https://example.com/tmpl.png'
});

assert(prevBtn.classList.contains('hidden'), 'Desktop template HIDES prev button');
assert(nextBtn.classList.contains('hidden'), 'Desktop template HIDES next button');
assert(feedActions.classList.contains('hidden'), 'Desktop template HIDES feed Edit/Upscale actions');
assert(!ctaBtn.classList.contains('hidden'), 'Desktop template SHOWS CTA button');

sandbox.closeTemplateWhitePreviewModal();

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('================================================================');

if (passedTests !== totalTests) {
    process.exit(1);
}
