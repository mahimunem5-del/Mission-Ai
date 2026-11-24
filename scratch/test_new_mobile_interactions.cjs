const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

console.log('====================================================');
console.log('INTERACTION TESTS: UPGRADED MOBILE WORKSPACE FEATURES');
console.log('====================================================');

let passedTests = 0;
let failedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
        console.log(`[PASS] ${testName}`);
        passedTests++;
    } else {
        console.error(`[FAIL] ${testName}: ${details}`);
        failedTests++;
    }
}

// Minimal DOM Element Mock
class MockElement {
    constructor(id = '', tag = 'div', classes = '') {
        this.id = id;
        this.tagName = tag.toUpperCase();
        this.className = classes;
        this.classList = {
            _classes: new Set(classes ? classes.split(/\s+/).filter(Boolean) : []),
            add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
            remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
            toggle: (c, force) => {
                if (force !== undefined) {
                    if (force) this.classList._classes.add(c);
                    else this.classList._classes.delete(c);
                } else {
                    if (this.classList._classes.has(c)) this.classList._classes.delete(c);
                    else this.classList._classes.add(c);
                }
            },
            contains: (c) => this.classList._classes.has(c)
        };
        this.children = [];
        this.style = {};
        this._innerHTML = '';
        this.value = '';
        this._listeners = {};
        this.onclick = null;
    }

    get innerHTML() {
        return this._innerHTML;
    }

    set innerHTML(val) {
        this._innerHTML = val;
        this.children = [];
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    addEventListener(event, handler) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
    }

    dispatchEvent(event) {
        if (this._listeners[event.type]) {
            this._listeners[event.type].forEach(h => h(event));
        }
        if (event.type === 'click' && typeof this.onclick === 'function') {
            this.onclick(event);
        }
    }

    click() {
        this.dispatchEvent({ type: 'click', preventDefault: () => {}, stopPropagation: () => {} });
    }

    querySelector(sel) {
        if (sel === '.copy-label') {
            return this.copyLabelEl || new MockElement('', 'span');
        }
        return null;
    }
}

const elementsById = new Map();
function getOrCreate(id, tag = 'div', classes = '') {
    if (!elementsById.has(id)) {
        elementsById.set(id, new MockElement(id, tag, classes));
    }
    return elementsById.get(id);
}

// Setup common mobile elements
getOrCreate('mobile-workspace-drawer', 'div', 'hidden');
getOrCreate('mobile-workspace-sheet', 'div', '');
getOrCreate('mobile-workspace-drag-handle', 'div', '');
getOrCreate('mobile-workspace-scroll-body', 'div', '');
getOrCreate('mobile-drawer-title', 'h3', '');
getOrCreate('mobile-drawer-close-btn', 'button', '');
getOrCreate('mobile-drawer-cta-btn', 'button', '');
getOrCreate('mobile-drawer-cta-text', 'span', '');

getOrCreate('mobile-model-drawer', 'div', 'hidden');
getOrCreate('mobile-model-sheet', 'div', '');
getOrCreate('mobile-model-drag-handle', 'div', '');
getOrCreate('mobile-model-close-btn', 'button', '');
getOrCreate('mobile-model-search-input', 'input', '');
getOrCreate('mobile-model-filter-pills', 'div', '');
getOrCreate('mobile-model-scroll-body', 'div', '');
getOrCreate('mobile-model-auto-row', 'div', '');
getOrCreate('mobile-model-auto-check', 'div', 'hidden');
getOrCreate('mobile-model-list-container', 'div', '');

getOrCreate('mobile-gen-model-btn', 'button', '');
getOrCreate('mobile-gen-model-icon', 'span', '');
getOrCreate('mobile-gen-model-label', 'span', '');
getOrCreate('mobile-gen-style-pills', 'div', '');
getOrCreate('mobile-gen-prompt-input', 'textarea', '');
getOrCreate('mobile-gen-seed-input', 'input', '');

getOrCreate('mobile-workspace-result-feed', 'div', 'hidden');
getOrCreate('mobile-result-back-btn', 'button', '');
getOrCreate('mobile-result-new-btn', 'button', '');
getOrCreate('mobile-result-multiselect-bar', 'div', 'hidden');
getOrCreate('mobile-multiselect-count', 'span', '');
getOrCreate('mobile-multiselect-deselect-btn', 'button', '');
getOrCreate('mobile-multiselect-download-btn', 'button', '');
getOrCreate('mobile-multiselect-delete-btn', 'button', '');
getOrCreate('mobile-multiselect-edit-btn', 'button', '');
getOrCreate('mobile-result-scroll-feed', 'div', '');
getOrCreate('mobile-result-edit-prompt-btn', 'button', '');
getOrCreate('mobile-result-regenerate-btn', 'button', '');

getOrCreate('mobile-card-generate', 'div', '');
getOrCreate('mobile-card-remove-bg', 'div', '');
getOrCreate('mobile-card-precise-edit', 'div', '');
getOrCreate('mobile-card-upscale', 'div', '');

const imageStudioState = {
    activeStyle: 'Auto',
    aspectRatio: '1:1',
    model: 'auto',
    prompt: ''
};

const sandbox = {
    document: {
        getElementById: (id) => elementsById.get(id) || null,
        createElement: (tag) => new MockElement('', tag),
        addEventListener: () => {},
        readyState: 'complete'
    },
    window: {
        addEventListener: () => {},
        removeEventListener: () => {},
        imageStudioState: imageStudioState,
        STUDIO_RECENT_IMAGES: [],
        navigator: {
            clipboard: {
                writeText: () => Promise.resolve()
            }
        }
    },
    imageStudioState: imageStudioState,
    STUDIO_RECENT_IMAGES: [],
    console: console,
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: clearTimeout,
    Date: Date,
    Math: Math
};
sandbox.window.document = sandbox.document;
sandbox.window.window = sandbox.window;

// Extract script
const marker = '<!-- ============================================================ -->\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const endMarker = '<!-- Secret Template Admin Studio';
const block = html.substring(html.indexOf(marker), html.indexOf(endMarker));
const scriptMatch = block.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);

const context = vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], context);

console.log('\n--- Test 1: Workspace Drawer Opening ---');
sandbox.window.openMobileWorkspaceDrawer('generate');
assert(!elementsById.get('mobile-workspace-drawer').classList.contains('hidden'), 'Generate card opens workspace drawer');
assert(elementsById.get('mobile-drawer-title').textContent === 'Generate Image', 'Title is Generate Image');

console.log('\n--- Test 2: Nested Select Model Drawer Opening & Interaction ---');
elementsById.get('mobile-gen-model-btn').click();
assert(!elementsById.get('mobile-model-drawer').classList.contains('hidden'), 'Clicking model box opens #mobile-model-drawer');

// Model drawer is open and populated
const listContainer = elementsById.get('mobile-model-list-container');
assert(listContainer.children.length > 0, 'Models list automatically populated in drawer on open');

// Find a model row (it has an onclick)
const modelRow = listContainer.children.find(c => typeof c.onclick === 'function');
assert(modelRow !== undefined, 'Model row element with click handler found');

// Click model row
modelRow.click();
assert(imageStudioState.model !== 'auto', 'imageStudioState.model updated to selected model');
assert(elementsById.get('mobile-gen-model-label').textContent !== 'Auto', 'Model trigger label updated in UI');
assert(elementsById.get('mobile-model-drawer').classList.contains('hidden'), 'Model drawer automatically closed on selection');

console.log('\n--- Test 3: Style Preset Pills ---');
const pillsContainer = elementsById.get('mobile-gen-style-pills');
assert(pillsContainer.children.length === 9, '9 style presets rendered');
const animePill = pillsContainer.children.find(c => c.textContent === 'Anime');
assert(animePill !== undefined, 'Anime pill exists');
animePill.click();
assert(imageStudioState.activeStyle === 'Anime', 'Active style updated to Anime');

console.log('\n--- Test 4: Atomic In-Place Skeleton to Image Transition ---');
sandbox.window.setMobileWorkspaceView('results');
sandbox.window.isMobileProcessing = true;
sandbox.window.mobilePreGenFirstItemId = null;
sandbox.window.renderMobileResultFeed();

const feed = elementsById.get('mobile-result-scroll-feed');
assert(feed.children.length === 1, 'In-place skeleton slot rendered during processing');
assert(feed.children[0].innerHTML.includes('w-[82%] max-w-[290px]'), 'Skeleton frame has compact w-[82%] max-w-[290px] frame');

// Simulate generation completing: new item added to STUDIO_RECENT_IMAGES
sandbox.window.STUDIO_RECENT_IMAGES.unshift({
    id: 'gen-img-101',
    url: 'https://example.com/generated-101.jpg',
    prompt: 'A futuristic floating city at sunrise',
    createdAt: Date.now()
});
// Re-render feed
sandbox.window.renderMobileResultFeed();
assert(!sandbox.window.isMobileProcessing, 'isMobileProcessing cleared atomically when new item arrived');
assert(feed.children.length === 1, 'Only 1 item rendered (no skeleton duplicate, atomic replacement)');
assert(feed.children[0].innerHTML.includes('A futuristic floating city at sunrise'), 'Finished image card occupies the exact top slot');

console.log('\n--- Test 5: Multi-Select Contextual Bar ---');
assert(elementsById.get('mobile-result-multiselect-bar').classList.contains('hidden'), 'Multi-select bar initially hidden');
// Toggle select item
sandbox.window.mobileSelectedImageIds.add('gen-img-101');
// Re-render feed to update bar
sandbox.window.renderMobileResultFeed();
assert(!elementsById.get('mobile-result-multiselect-bar').classList.contains('hidden'), 'Multi-select bar visible when item checked');
assert(elementsById.get('mobile-multiselect-count').textContent === '1 selected', 'Count displays 1 selected');

// Deselect
elementsById.get('mobile-multiselect-deselect-btn').click();
assert(elementsById.get('mobile-result-multiselect-bar').classList.contains('hidden'), 'Deselect clears selection and hides bar');
assert(sandbox.window.mobileSelectedImageIds.size === 0, 'Selection set cleared');

console.log('\n--- Test 6: Borderless Result Top Bar Navigation ---');
elementsById.get('mobile-result-back-btn').click();
assert(sandbox.window.mobileWorkspaceView === 'landing', 'Clicking ← returns to landing view');

elementsById.get('mobile-result-new-btn').click();
assert(!elementsById.get('mobile-workspace-drawer').classList.contains('hidden'), 'Clicking + New opens bottom sheet drawer');

console.log('\n====================================================');
console.log(`INTERACTION TESTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
console.log('====================================================');

if (failedTests > 0) process.exit(1);
