const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

console.log('====================================================');
console.log('VERIFICATION OF 3 MOBILE WORKSPACE FIXES');
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
// TEST 1: FIX #1 — 4 Mobile Workspace Cards
// ----------------------------------------------------
console.log('\n--- FIX #1: Mobile Workspace Cards Wiring & Drawer Trigger ---');

assert(
    html.includes('id="mobile-card-generate"') &&
    html.includes('id="mobile-card-remove-bg"') &&
    html.includes('id="mobile-card-precise-edit"') &&
    html.includes('id="mobile-card-upscale"'),
    'All 4 mobile cards have designated unique IDs'
);

assert(
    html.includes("openMobileWorkspaceDrawer('generate')") &&
    html.includes("openMobileWorkspaceDrawer('remove-bg')") &&
    html.includes("openMobileWorkspaceDrawer('edit')") &&
    html.includes("openMobileWorkspaceDrawer('upscale')"),
    'All 4 mobile cards call openMobileWorkspaceDrawer with appropriate tool name'
);

assert(
    html.includes("normalizeToolName") &&
    html.includes("tool === 'generate'") &&
    html.includes("tool === 'remove-bg'") &&
    html.includes("tool === 'edit'") &&
    html.includes("tool === 'upscale'"),
    'normalizeToolName maps aliases ("generate", "remove-bg", "edit", "upscale") to internal IDs'
);

// ----------------------------------------------------
// TEST 2: FIX #2 — Modal and Drawer State Isolation
// ----------------------------------------------------
console.log('\n--- FIX #2: Modal and Drawer State Isolation ---');

const modalIdx = html.indexOf('id="template-white-preview-modal"');
const drawerIdx = html.indexOf('id="mobile-workspace-drawer"');
const between = html.slice(modalIdx, drawerIdx);
const openDivs = (between.match(/<div\b/gi) || []).length;
const closeDivs = (between.match(/<\/div>/gi) || []).length;

assert(
    openDivs === closeDivs,
    `template-white-preview-modal is strictly closed before mobile-workspace-drawer begins (open=${openDivs}, close=${closeDivs})`
);

assert(
    html.includes('window.setSelectedTemplate = setSelectedTemplate') &&
    html.includes('window.selectedTemplate = null'),
    'window.setSelectedTemplate and window.selectedTemplate are properly exposed'
);

const openModalFn = html.slice(html.indexOf('function openTemplateWhitePreviewModal'), html.indexOf('function closeTemplateWhitePreviewModal'));
assert(
    openModalFn.includes('setIsMobileDrawerOpen(false)'),
    'openTemplateWhitePreviewModal explicitly ensures setIsMobileDrawerOpen(false) so no drawer appears over modal'
);

assert(
    openModalFn.includes('ctaBtn.onclick = (e) => {') &&
    openModalFn.includes('e.stopPropagation()') &&
    openModalFn.includes('closeTemplateWhitePreviewModal()') &&
    openModalFn.includes("openMobileWorkspaceDrawer(targetTool"),
    'Modal CTA button ("Try with Photo") cleanly closes modal, stops propagation, and opens ONLY the corresponding bottom sheet drawer'
);

// ----------------------------------------------------
// TEST 3: FIX #3 — Broken Template Images & Graceful Fallback
// ----------------------------------------------------
console.log('\n--- FIX #3: Template Images & Fallback Verification ---');

const expectedTemplateFiles = [
    'clay-character.jpg',
    'cyber-avatar.jpg',
    'editorial-portrait.jpg',
    'geometric-logo.jpg',
    'luxury-perfume.jpg',
    'nordic-scenery.jpg'
];

expectedTemplateFiles.forEach(file => {
    assert(
        fs.existsSync(`templates/${file}`),
        `Template image exists at templates/${file}`
    );
    assert(
        fs.existsSync(`public/templates/${file}`),
        `Template image exists at public/templates/${file}`
    );
});

assert(
    html.includes('id="tmpl-modal-fallback"'),
    '#tmpl-modal-fallback graceful placeholder element exists in template preview modal'
);

assert(
    openModalFn.includes('modalFallback') &&
    openModalFn.includes('modalImg.onerror = function ()') &&
    openModalFn.includes('/public'),
    'modalImg has onerror handler with /public fallback and graceful fallback display'
);

const renderMobileTmplFn = html.slice(html.indexOf('function renderMobileImageHomeTemplates'), html.indexOf('window.renderMobileImageHomeTemplates'));
assert(
    renderMobileTmplFn.includes("onerror=") &&
    renderMobileTmplFn.includes('/public'),
    'renderMobileImageHomeTemplates has graceful /public onerror fallback'
);

// ----------------------------------------------------
// TEST 4: Behavioral Simulation in VM
// ----------------------------------------------------
console.log('\n--- Behavioral Simulation in VM ---');

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
        this.dataset = {};
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
}

const elements = {};
function getOrCreate(id, tag = 'div', cls = '') {
    if (!elements[id]) {
        elements[id] = new MockElement(tag, id, cls);
    }
    return elements[id];
}

// Elements needed
getOrCreate('mobile-card-generate', 'button');
getOrCreate('mobile-card-remove-bg', 'button');
getOrCreate('mobile-card-precise-edit', 'button');
getOrCreate('mobile-card-upscale', 'button');
getOrCreate('mobile-workspace-drawer', 'div', 'hidden');
getOrCreate('mobile-workspace-sheet', 'div');
getOrCreate('mobile-drawer-title', 'h2');
getOrCreate('mobile-drawer-cta-text', 'span');
getOrCreate('mobile-drawer-cta-btn', 'button');
getOrCreate('mobile-panel-generate', 'div');
getOrCreate('mobile-panel-remove-bg', 'div', 'hidden');
getOrCreate('mobile-panel-precise-edit', 'div', 'hidden');
getOrCreate('mobile-panel-upscale', 'div', 'hidden');
getOrCreate('mobile-gen-prompt-input', 'textarea');
getOrCreate('mobile-precise-prompt-input', 'textarea');
getOrCreate('template-white-preview-modal', 'div', 'hidden');
getOrCreate('tmpl-modal-img', 'img');
getOrCreate('tmpl-modal-fallback', 'div', 'hidden');
getOrCreate('tmpl-modal-fallback-title', 'span');
getOrCreate('tmpl-modal-prompt-text', 'p');
getOrCreate('tmpl-modal-title', 'h3');
getOrCreate('tmpl-modal-cta-btn', 'button');
getOrCreate('tmpl-modal-cta-text', 'span');
getOrCreate('tmpl-modal-download-btn', 'button');
getOrCreate('tmpl-modal-copy-prompt-btn', 'button');

// Extract script block 5
const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let script5Code = '';
while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1].includes('isMobileDrawerOpen = false') && match[1].includes('openMobileWorkspaceDrawer')) {
        script5Code = match[1];
        break;
    }
}

const mockWindow = {
    innerWidth: 375, // mobile
    innerHeight: 812,
    document: {
        getElementById: (id) => elements[id] || null,
        createElement: (tag) => new MockElement(tag),
        addEventListener: () => {},
        body: new MockElement('body'),
        readyState: 'complete'
    },
    setTimeout: (fn) => fn(),
    imageStudioState: { prompt: '' },
    studioPreciseEditState: { sourceItem: { url: 'old.png' } },
    console: console
};
mockWindow.window = mockWindow;

// Run modal logic and script 5
const ctx = vm.createContext(mockWindow);

// Run modal logic declarations
const modalDeclarations = html.slice(html.indexOf('// White-Theme Template Preview Modal Logic'), html.indexOf('function renderImageHomeTemplates'));
vm.runInContext(modalDeclarations, ctx);
vm.runInContext(script5Code, ctx);

ctx.initDedicatedMobileWorkspace();

// TEST 4.1: Card 1 Click opens Generate Image drawer
elements['mobile-card-generate'].click();
assert(
    !elements['mobile-workspace-drawer'].classList.contains('hidden'),
    'Card 1 (Generate) click opens drawer (removes hidden)'
);
assert(
    elements['mobile-drawer-title'].textContent === 'Generate Image',
    'Drawer title is "Generate Image"'
);

// TEST 4.2: Card 2 Click opens Remove Background drawer
elements['mobile-card-remove-bg'].click();
assert(
    elements['mobile-drawer-title'].textContent === 'Remove Background',
    'Card 2 (Remove Background) click updates drawer title to "Remove Background"'
);

// TEST 4.3: Card 3 Click resets sourceItem and opens Precise Edit drawer
elements['mobile-card-precise-edit'].click();
assert(
    elements['mobile-drawer-title'].textContent === 'Precise Edit',
    'Card 3 (Precise Edit) click updates drawer title to "Precise Edit"'
);
assert(
    mockWindow.studioPreciseEditState.sourceItem === null,
    'Card 3 click resets studioPreciseEditState.sourceItem to null'
);

// TEST 4.4: Card 4 Click opens Upscale Image drawer
elements['mobile-card-upscale'].click();
assert(
    elements['mobile-drawer-title'].textContent === 'Upscale Image',
    'Card 4 (Upscale) click updates drawer title to "Upscale Image"'
);

// TEST 4.5: Opening Template Preview closes drawer
const testTemplate = {
    id: 'test-tmpl-1',
    title: 'Cyberpunk Avatar',
    imageUrl: '/templates/cyber-avatar.jpg',
    targetWorkflow: 'precise-edit',
    prompt: 'A cyberpunk avatar in neon rim light',
    aspectRatio: '3:4',
    stylePreset: 'Anime'
};

ctx.setSelectedTemplate(testTemplate);
assert(
    !elements['template-white-preview-modal'].classList.contains('hidden'),
    'setSelectedTemplate opens template preview modal'
);
assert(
    elements['mobile-workspace-drawer'].classList.contains('hidden'),
    'Opening template modal explicitly closes mobile bottom sheet drawer'
);

// TEST 4.6: "Try with Photo" inside template modal opens Precise Edit drawer with pre-filled prompt
elements['tmpl-modal-cta-btn'].click();
assert(
    elements['template-white-preview-modal'].classList.contains('hidden'),
    '"Try with Photo" click immediately closes template preview modal'
);
assert(
    !elements['mobile-workspace-drawer'].classList.contains('hidden'),
    '"Try with Photo" click immediately opens bottom sheet drawer'
);
assert(
    elements['mobile-drawer-title'].textContent === 'Precise Edit',
    'Drawer opened by "Try with Photo" is "Precise Edit"'
);
assert(
    elements['mobile-precise-prompt-input'].value === 'A cyberpunk avatar in neon rim light',
    'Prompt is pre-filled into mobile-precise-prompt-input'
);

// TEST 4.7: Opening card while modal is open closes modal
ctx.setSelectedTemplate(testTemplate);
elements['mobile-card-generate'].click();
assert(
    elements['template-white-preview-modal'].classList.contains('hidden'),
    'Clicking workspace card ensures any open template preview modal is closed'
);
assert(
    !elements['mobile-workspace-drawer'].classList.contains('hidden'),
    'Drawer is open after card click'
);

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) process.exit(1);
