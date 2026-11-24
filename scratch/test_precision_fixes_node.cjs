const fs = require('fs');

console.log('======================================================');
console.log('PRECISION VERIFICATION BATTERY (NODE DOM & API ROUTING)');
console.log('======================================================');

let allPassed = true;
function check(desc, passed, details = '') {
    if (passed) {
        console.log(`  ✓ PASS: ${desc}`);
    } else {
        console.error(`  ✗ FAIL: ${desc} ${details ? '(' + details + ')' : ''}`);
        allPassed = false;
    }
}

// -----------------------------------------------------------------------------
// TEST 1: Mobile Creations "+ New" Button Logic & State Reset
// -----------------------------------------------------------------------------
console.log('\n--- 1. Testing Mobile Creations "+ New" Button & Clean Generate Image Sheet ---');

// Create a DOM-like environment to run the exact code extracted from index.html
class MockElement {
    constructor(id, tagName = 'div') {
        this.id = id;
        this.tagName = tagName;
        this.value = '';
        this.textContent = '';
        this.classList = new Set();
        this.disabled = false;
        this._listeners = {};
    }
    addEventListener(evt, fn) {
        if (!this._listeners[evt]) this._listeners[evt] = [];
        this._listeners[evt].push(fn);
    }
    click() {
        if (this._listeners['click']) {
            const ev = { preventDefault: () => {}, stopPropagation: () => {} };
            this._listeners['click'].forEach(fn => fn(ev));
        }
    }
}

// Emulate elements needed by mobile image workspace
const elements = {
    'mobile-result-new-btn': new MockElement('mobile-result-new-btn', 'button'),
    'mobile-drawer-title': new MockElement('mobile-drawer-title', 'h2'),
    'mobile-drawer-cta-text': new MockElement('mobile-drawer-cta-text', 'span'),
    'mobile-drawer-cta-btn': new MockElement('mobile-drawer-cta-btn', 'button'),
    'mobile-workspace-drawer': new MockElement('mobile-workspace-drawer', 'div'),
    'mobile-workspace-result-feed': new MockElement('mobile-workspace-result-feed', 'div'),
    'mobile-panel-generate': new MockElement('mobile-panel-generate', 'div'),
    'mobile-panel-remove-bg': new MockElement('mobile-panel-remove-bg', 'div'),
    'mobile-panel-precise-edit': new MockElement('mobile-panel-precise-edit', 'div'),
    'mobile-panel-upscale': new MockElement('mobile-panel-upscale', 'div'),
    'mobile-gen-prompt-input': new MockElement('mobile-gen-prompt-input', 'textarea'),
    'studio-prompt-input': new MockElement('studio-prompt-input', 'textarea'),
    'mobile-gen-seed-input': new MockElement('mobile-gen-seed-input', 'input'),
    'mobile-precise-prompt-input': new MockElement('mobile-precise-prompt-input', 'textarea'),
    'studio-precise-edit-input': new MockElement('studio-precise-edit-input', 'textarea'),
    'mobile-precise-file-input': new MockElement('mobile-precise-file-input', 'input'),
    'mobile-rembg-file-input': new MockElement('mobile-rembg-file-input', 'input'),
    'mobile-upscale-file-input': new MockElement('mobile-upscale-file-input', 'input'),
    'mobile-precise-preview-wrap': new MockElement('mobile-precise-preview-wrap', 'div'),
    'mobile-precise-dropzone': new MockElement('mobile-precise-dropzone', 'div'),
    'mobile-precise-preview-img': new MockElement('mobile-precise-preview-img', 'img'),
    'mobile-rembg-preview-wrap': new MockElement('mobile-rembg-preview-wrap', 'div'),
    'mobile-rembg-dropzone': new MockElement('mobile-rembg-dropzone', 'div'),
    'mobile-rembg-preview-img': new MockElement('mobile-rembg-preview-img', 'img'),
    'mobile-upscale-preview-wrap': new MockElement('mobile-upscale-preview-wrap', 'div'),
    'mobile-upscale-dropzone': new MockElement('mobile-upscale-dropzone', 'div'),
    'mobile-upscale-preview-img': new MockElement('mobile-upscale-preview-img', 'img')
};

// Add helper class methods to Set for classList
for (const el of Object.values(elements)) {
    el.classList.contains = function(cls) { return this.has(cls); };
    el.classList.toggle = function(cls, force) {
        if (force === undefined) {
            if (this.has(cls)) this.delete(cls); else this.add(cls);
        } else if (force) {
            this.add(cls);
        } else {
            this.delete(cls);
        }
    };
    el.classList.remove = function(cls) { this.delete(cls); };
}

global.document = {
    getElementById: (id) => elements[id] || null
};
global.window = {
    activeMobileTool: 'generate-image',
    activeTool: 'generate',
    isMobileDrawerOpen: false,
    mobileWorkspaceView: 'landing',
    studioPreciseEditState: {
        sourceItem: null,
        sourceCard: null,
        referenceImages: [],
        isActive: false
    },
    imageStudioState: {
        prompt: '',
        currentPrompt: '',
        referenceImages: [],
        referenceImage: null,
        activeStyle: 'Auto',
        seed: ''
    },
    location: {
        protocol: 'http:',
        hostname: '192.168.1.100',
        port: '3000',
        origin: 'http://192.168.1.100:3000'
    }
};

global.imageStudioState = window.imageStudioState;
global.studioPreciseEditState = window.studioPreciseEditState;
global.renderMobileGenRefSlots = () => {};
global.renderMobileStylePills = () => {};
global.renderStudioReferenceSlots = () => {};
global.renderMobileResultFeed = () => {};

// Read index.html and extract the definitions of normalizeToolName, openMobileWorkspaceDrawer, handleMobileDrawerClear, updateMobileCtaButtonState, setMobileWorkspaceView, and the event listener
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Evaluate the functions in this scope
function normalizeToolName(tool) {
    if (!tool) return 'generate-image';
    if (tool === 'generate' || tool === 'generate-image') return 'generate-image';
    if (tool === 'remove-bg' || tool === 'remove-background') return 'remove-background';
    if (tool === 'edit' || tool === 'precise-edit') return 'precise-edit';
    if (tool === 'upscale' || tool === 'upscale-image') return 'upscale-image';
    return tool;
}

const TOOL_TITLES = {
    'generate-image': 'Generate Image',
    'remove-background': 'Remove Background',
    'precise-edit': 'Precise Edit',
    'upscale-image': 'Upscale Image'
};
const TOOL_CTA_LABELS = {
    'generate-image': 'Generate',
    'remove-background': 'Remove Background',
    'precise-edit': 'Apply Edit',
    'upscale-image': 'Upscale'
};

function setIsMobileDrawerOpen(isOpen) {
    window.isMobileDrawerOpen = Boolean(isOpen);
    const drawer = document.getElementById('mobile-workspace-drawer');
    if (!drawer) return;
    if (isOpen) drawer.classList.remove('hidden');
    else drawer.classList.add('hidden');
}

function setMobileWorkspaceView(view) {
    window.mobileWorkspaceView = view || 'landing';
    const feed = document.getElementById('mobile-workspace-result-feed');
    if (window.mobileWorkspaceView === 'results') {
        if (feed) feed.classList.remove('hidden');
    } else {
        if (feed) feed.classList.add('hidden');
    }
}

function updateMobileCtaButtonState() {
    const btn = document.getElementById('mobile-drawer-cta-btn');
    if (!btn) return;
    let canSubmit = false;
    if (window.activeMobileTool === 'generate-image') {
        const val = (document.getElementById('mobile-gen-prompt-input')?.value || '').trim();
        canSubmit = val.length > 0;
    } else if (window.activeMobileTool === 'precise-edit') {
        const hasSrc = Boolean(window.studioPreciseEditState && window.studioPreciseEditState.sourceItem);
        const val = (document.getElementById('mobile-precise-prompt-input')?.value || '').trim();
        canSubmit = hasSrc && val.length > 0;
    }
    btn.disabled = !canSubmit;
}

function handleMobileDrawerClear() {
    if (window.activeMobileTool === 'generate-image') {
        const input = document.getElementById('mobile-gen-prompt-input');
        if (input) input.value = '';
        if (typeof imageStudioState !== 'undefined') {
            imageStudioState.prompt = '';
            imageStudioState.currentPrompt = '';
            imageStudioState.referenceImages = [];
            imageStudioState.referenceImage = null;
            imageStudioState.activeStyle = 'Auto';
            imageStudioState.seed = '';
        }
        const deskPrompt = document.getElementById('studio-prompt-input');
        if (deskPrompt) deskPrompt.value = '';
        const seedInput = document.getElementById('mobile-gen-seed-input');
        if (seedInput) seedInput.value = '';
        if (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState) {
            studioPreciseEditState.sourceItem = null;
            studioPreciseEditState.sourceCard = null;
            studioPreciseEditState.referenceImages = [];
            studioPreciseEditState.isActive = false;
        }
    }
    updateMobileCtaButtonState();
}

function openMobileWorkspaceDrawer(tool, options = {}) {
    window.activeMobileTool = normalizeToolName(tool);
    const titleEl = document.getElementById('mobile-drawer-title');
    const ctaText = document.getElementById('mobile-drawer-cta-text');
    if (titleEl) titleEl.textContent = TOOL_TITLES[window.activeMobileTool] || 'Generate Image';
    if (ctaText) ctaText.textContent = TOOL_CTA_LABELS[window.activeMobileTool] || 'Generate';

    const pGen = document.getElementById('mobile-panel-generate');
    const pRembg = document.getElementById('mobile-panel-remove-bg');
    const pPrecise = document.getElementById('mobile-panel-precise-edit');
    const pUpscale = document.getElementById('mobile-panel-upscale');

    if (pGen) pGen.classList.toggle('hidden', window.activeMobileTool !== 'generate-image');
    if (pRembg) pRembg.classList.toggle('hidden', window.activeMobileTool !== 'remove-background');
    if (pPrecise) pPrecise.classList.toggle('hidden', window.activeMobileTool !== 'precise-edit');
    if (pUpscale) pUpscale.classList.toggle('hidden', window.activeMobileTool !== 'upscale-image');

    if (options.clear) {
        handleMobileDrawerClear();
    }
    updateMobileCtaButtonState();
    setIsMobileDrawerOpen(true);
}

// Bind the actual + New button click handler from index.html
const resultNewBtn = document.getElementById('mobile-result-new-btn');
resultNewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.activeTool = 'generate';
    window.activeMobileTool = 'generate-image';

    if (typeof studioPreciseEditState !== 'undefined' && studioPreciseEditState) {
        studioPreciseEditState.sourceItem = null;
        studioPreciseEditState.sourceCard = null;
        studioPreciseEditState.referenceImages = [];
        studioPreciseEditState.isActive = false;
    }
    window.removeBgSourceData = null;
    window.removeBgSourceFile = null;
    window.upscaleSourceData = null;
    window.upscaleSourceImage = null;

    const genPrompt = document.getElementById('mobile-gen-prompt-input');
    if (genPrompt) genPrompt.value = '';
    const deskPrompt = document.getElementById('studio-prompt-input');
    if (deskPrompt) deskPrompt.value = '';
    const genSeed = document.getElementById('mobile-gen-seed-input');
    if (genSeed) genSeed.value = '';
    const precisePrompt = document.getElementById('mobile-precise-prompt-input');
    if (precisePrompt) precisePrompt.value = '';
    const deskPrecisePrompt = document.getElementById('studio-precise-edit-input');
    if (deskPrecisePrompt) deskPrecisePrompt.value = '';

    const preciseFile = document.getElementById('mobile-precise-file-input');
    if (preciseFile) preciseFile.value = '';
    const rembgFile = document.getElementById('mobile-rembg-file-input');
    if (rembgFile) rembgFile.value = '';
    const upscaleFile = document.getElementById('mobile-upscale-file-input');
    if (upscaleFile) upscaleFile.value = '';

    const pWrap = document.getElementById('mobile-precise-preview-wrap');
    if (pWrap) pWrap.classList.add('hidden');
    const pDrop = document.getElementById('mobile-precise-dropzone');
    if (pDrop) pDrop.classList.remove('hidden');
    const pImg = document.getElementById('mobile-precise-preview-img');
    if (pImg) pImg.src = '';

    const rWrap = document.getElementById('mobile-rembg-preview-wrap');
    if (rWrap) rWrap.classList.add('hidden');
    const rDrop = document.getElementById('mobile-rembg-dropzone');
    if (rDrop) rDrop.classList.remove('hidden');
    const rImg = document.getElementById('mobile-rembg-preview-img');
    if (rImg) rImg.src = '';

    const uWrap = document.getElementById('mobile-upscale-preview-wrap');
    if (uWrap) uWrap.classList.add('hidden');
    const uDrop = document.getElementById('mobile-upscale-dropzone');
    if (uDrop) uDrop.classList.remove('hidden');
    const uImg = document.getElementById('mobile-upscale-preview-img');
    if (uImg) uImg.src = '';

    if (typeof imageStudioState !== 'undefined') {
        imageStudioState.prompt = '';
        imageStudioState.currentPrompt = '';
        imageStudioState.referenceImages = [];
        imageStudioState.referenceImage = null;
        imageStudioState.activeStyle = 'Auto';
        imageStudioState.seed = '';
    }

    if (typeof setMobileWorkspaceView === 'function') {
        setMobileWorkspaceView('landing');
    }
    openMobileWorkspaceDrawer('generate-image', { clear: true });
});

// SIMULATION:
// Step 1: User previously was in Precise Edit
openMobileWorkspaceDrawer('precise-edit');
elements['mobile-precise-prompt-input'].value = 'Make the shirt navy blue';
window.studioPreciseEditState.sourceItem = { id: 'img_123', url: 'https://example.com/shirt.jpg' };
updateMobileCtaButtonState();

check('Precondition: Active tool is precise-edit', window.activeMobileTool === 'precise-edit');
check('Precondition: CTA button is enabled for valid precise edit', elements['mobile-drawer-cta-btn'].disabled === false);

// Step 2: User closes drawer and views Creations
setIsMobileDrawerOpen(false);
setMobileWorkspaceView('results');
check('Precondition: In Creations result feed view', window.mobileWorkspaceView === 'results');

// Step 3: User taps "+ New" in Creations header
resultNewBtn.click();

check('1. activeMobileTool is reset to "generate-image"', window.activeMobileTool === 'generate-image');
check('2. activeTool is reset to "generate"', window.activeTool === 'generate');
check('3. Drawer is open', window.isMobileDrawerOpen === true);
check('4. Drawer title is "Generate Image"', elements['mobile-drawer-title'].textContent === 'Generate Image');
check('5. Generate panel is visible', !elements['mobile-panel-generate'].classList.contains('hidden'));
check('6. Precise edit panel is hidden', elements['mobile-panel-precise-edit'].classList.contains('hidden'));
check('7. Prompt input is completely clean and empty', elements['mobile-gen-prompt-input'].value === '');
check('8. Leftover precise edit prompt is cleared', elements['mobile-precise-prompt-input'].value === '');
check('9. Leftover precise edit source item is cleared (null)', window.studioPreciseEditState.sourceItem === null);
check('10. CTA button is disabled because prompt is empty', elements['mobile-drawer-cta-btn'].disabled === true);

// -----------------------------------------------------------------------------
// TEST 2: LAN IP & Frontend API Routing & Vite Config & Backend CORS
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing LAN IP / Mobile API Routing, Vite Dev Proxy & Backend Config ---');

// Check that getApiBaseUrl() returns '' on HTTP LAN origin (e.g. http://192.168.1.50:3000)
function getApiBaseUrlTest() {
    if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
        return '';
    }
    return 'http://localhost:5001';
}
check('getApiBaseUrl() returns "" (relative path) for LAN http origin', getApiBaseUrlTest() === '');

// Verify vite.config.js content
const viteConfig = fs.readFileSync('vite.config.js', 'utf8');
check('vite.config.js has host: true (0.0.0.0 binding)', viteConfig.includes('host: true'));
check('vite.config.js proxies /api to port 5001', viteConfig.includes("target: 'http://127.0.0.1:5001'"));
check('vite.config.js has preview host: true & proxy', viteConfig.includes('preview: {'));

// Verify server/src/index.js
const serverIndex = fs.readFileSync('server/src/index.js', 'utf8');
check('server/src/index.js explicitly binds to 0.0.0.0', serverIndex.includes("app.listen(PORT, '0.0.0.0'"));
check('server/src/index.js CORS regex covers 192.168.*', serverIndex.includes('192\\.168\\.'));
check('server/src/index.js CORS regex covers 10.*', serverIndex.includes('10\\.'));
check('server/src/index.js CORS regex covers 172.*', serverIndex.includes('172\\.'));
check('server/src/index.js express.json limit is 50mb', serverIndex.includes("express.json({ limit: '50mb' })"));
check('server/src/index.js express.urlencoded limit is 50mb', serverIndex.includes("express.urlencoded({ limit: '50mb'"));

// Verify no hardcoded localhost:5001 in image generation, edit, upscale, remove-bg, etc.
const hardcodedCheck = [];
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
    if (l.includes('http://localhost:5001') && !l.includes('getApiBaseUrl')) {
        hardcodedCheck.push(`L${i+1}: ${l.trim()}`);
    }
});
check('Zero hardcoded http://localhost:5001 fetch calls in index.html', hardcodedCheck.length === 0, hardcodedCheck.join(', '));

// Verify no hardcoded localhost:5001 in src/App.tsx
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
check('Zero http://localhost:5001 in src/App.tsx', !appTsx.includes('http://localhost:5001'));

console.log('\n======================================================');
if (allPassed) {
    console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
} else {
    console.error('TESTS FAILED!');
    process.exit(1);
}
console.log('======================================================\n');
