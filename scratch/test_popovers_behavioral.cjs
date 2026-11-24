const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('BEHAVIORAL SIMULATION IN VM: POPOVERS, SCALE PILLS, & CONTROLS');
console.log('================================================================\n');

class MockElement {
    constructor(tagName, id = '', className = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.className = className;
        this.classList = {
            _classes: new Set(className.split(/\s+/).filter(Boolean)),
            add: (...cls) => {
                cls.forEach(c => this.classList._classes.add(c));
                this.className = Array.from(this.classList._classes).join(' ');
            },
            remove: (...cls) => {
                cls.forEach(c => this.classList._classes.delete(c));
                this.className = Array.from(this.classList._classes).join(' ');
            },
            toggle: (c, force) => {
                if (force === undefined) {
                    if (this.classList._classes.has(c)) this.classList._classes.delete(c);
                    else this.classList._classes.add(c);
                } else if (force) {
                    this.classList._classes.add(c);
                } else {
                    this.classList._classes.delete(c);
                }
                this.className = Array.from(this.classList._classes).join(' ');
            },
            contains: (c) => this.classList._classes.has(c)
        };
        this.style = {};
        this.children = [];
        this.parentNode = null;
        this.listeners = {};
        this._innerHTML = '';
        this.value = '';
    }

    get innerHTML() {
        return this._innerHTML;
    }

    set innerHTML(val) {
        this._innerHTML = val;
        this.children = [];
    }

    get textContent() {
        return this._textContent !== undefined ? this._textContent : this._innerHTML.replace(/<[^>]+>/g, '');
    }

    set textContent(val) {
        this._textContent = val;
    }

    addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }

    removeEventListener(event, fn) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }

    click() {
        if (this.listeners['click']) {
            this.listeners['click'].forEach(fn => fn({
                stopPropagation: () => {},
                preventDefault: () => {},
                target: this
            }));
        }
        if (this.onclick) {
            this.onclick({
                stopPropagation: () => {},
                preventDefault: () => {},
                target: this
            });
        }
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    querySelectorAll(selector) {
        const res = [];
        function walk(node) {
            for (const c of node.children) {
                if (selector === 'button' && c.tagName === 'BUTTON') res.push(c);
                walk(c);
            }
        }
        walk(this);
        return res;
    }

    querySelector(selector) {
        const all = this.querySelectorAll(selector);
        return all.length > 0 ? all[0] : null;
    }
}

const elements = new Map();

function getOrCreate(id, tag = 'div', cls = '') {
    if (!elements.has(id)) {
        elements.set(id, new MockElement(tag, id, cls));
    }
    return elements.get(id);
}

// Pre-create elements
const elIds = [
    'mobile-workspace-drawer',
    'mobile-workspace-sheet',
    'mobile-popover-backdrop',
    'mobile-drawer-title',
    'mobile-drawer-close-btn',
    'mobile-drawer-scroll-body',
    'mobile-panel-generate',
    'mobile-panel-remove-bg',
    'mobile-panel-precise-edit',
    'mobile-panel-upscale',
    'mobile-gen-ratio-btn',
    'mobile-gen-ratio-dropdown',
    'mobile-gen-ratio-label',
    'mobile-gen-ratio-icon',
    'mobile-gen-count-btn',
    'mobile-gen-count-dropdown',
    'mobile-gen-count-label',
    'mobile-remove-bg-dropzone',
    'mobile-rembg-dropzone',
    'mobile-rembg-file-input',
    'mobile-rembg-preview-wrap',
    'mobile-precise-dropzone',
    'mobile-precise-file-input',
    'mobile-precise-preview-wrap',
    'mobile-precise-ref-slots',
    'mobile-precise-ref-file-input',
    'mobile-precise-quality-btn',
    'mobile-precise-quality-dropdown',
    'mobile-precise-quality-label',
    'mobile-precise-var-btn',
    'mobile-precise-var-dropdown',
    'mobile-precise-var-label',
    'mobile-upscale-dropzone',
    'mobile-upscale-file-input',
    'mobile-upscale-preview-wrap',
    'mobile-upscale-2x-btn',
    'mobile-upscale-4x-btn'
];

elIds.forEach(id => {
    let tag = 'div';
    let cls = '';
    if (id.endsWith('-btn')) tag = 'button';
    if (id.endsWith('-input')) tag = 'input';
    if (id.includes('dropdown') || id.includes('backdrop') || id.includes('drawer')) cls = 'hidden';
    getOrCreate(id, tag, cls);
});

const mockDoc = {
    readyState: 'complete',
    getElementById: (id) => elements.get(id) || null,
    createElement: (tag) => new MockElement(tag),
    addEventListener: (evt, fn) => {},
    removeEventListener: (evt, fn) => {}
};

const stateObj = {
    prompt: '',
    aspectRatio: '1:1',
    imageCount: 1,
    model: 'auto'
};
const preciseStateObj = {
    quality: 'High',
    variationCount: 1,
    editWeight: 'High'
};

const sandbox = {
    document: mockDoc,
    imageStudioState: stateObj,
    studioPreciseEditState: preciseStateObj,
    window: {
        activeMobileTool: 'generate-image',
        imageStudioState: stateObj,
        studioPreciseEditState: preciseStateObj,
        upscaleScaleFactor: 2
    },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (id) => clearTimeout(id),
    console: console
};
sandbox.window.document = mockDoc;
sandbox.window.window = sandbox.window;

// Extract dedicated mobile inner workspace script from index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
const scriptStartIdx = indexHtml.indexOf('window.isMobileDrawerOpen = false;');
const scriptTagIdx = indexHtml.lastIndexOf('<script', scriptStartIdx);
const scriptCloseIdx = indexHtml.indexOf('</script>', scriptStartIdx);

if (scriptTagIdx === -1 || scriptCloseIdx === -1) {
    console.error('Could not find mobile inner workspace script in index.html');
    process.exit(1);
}

const scriptSource = indexHtml.substring(scriptTagIdx + 8, scriptCloseIdx);
const context = vm.createContext(sandbox);
vm.runInContext(scriptSource, context);

// Initialize mobile workspace
sandbox.window.initDedicatedMobileWorkspace();

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ✗ FAIL: ${message}`);
        failed++;
    }
}

// 1. Test Generate Image Aspect Ratio Popover
console.log('--- Test 1: Generate Image Aspect Ratio Popover ---');
const ratioBtn = elements.get('mobile-gen-ratio-btn');
const ratioDrop = elements.get('mobile-gen-ratio-dropdown');
const backdrop = elements.get('mobile-popover-backdrop');

assert(ratioDrop.classList.contains('hidden'), 'Ratio dropdown initially hidden');
assert(backdrop.classList.contains('hidden'), 'Backdrop initially hidden');

ratioBtn.click();
assert(!ratioDrop.classList.contains('hidden'), 'Ratio dropdown opened on click');
assert(!backdrop.classList.contains('hidden'), 'Backdrop opened on click');

const ratioOptions = ratioDrop.children;
assert(ratioOptions.length === 8, `8 aspect ratio options rendered (got ${ratioOptions.length})`);
assert(ratioOptions[0].className.includes('bg-slate-100/80') && ratioOptions[0].className.includes('text-slate-900'), 'Selected ratio (1:1) has soft subtle tinted highlight');

// Select 2:3
ratioOptions[1].click();
assert(sandbox.imageStudioState.aspectRatio === '2:3', 'imageStudioState.aspectRatio updated to 2:3');
assert(elements.get('mobile-gen-ratio-label').textContent === '2:3', 'mobile-gen-ratio-label updated to 2:3');
assert(ratioDrop.classList.contains('hidden'), 'Ratio dropdown closed after selection');
assert(backdrop.classList.contains('hidden'), 'Backdrop hidden after selection');

// 2. Test Variations Popover in Generate Image
console.log('\n--- Test 2: Variations Popover in Generate Image ---');
const countBtn = elements.get('mobile-gen-count-btn');
const countDrop = elements.get('mobile-gen-count-dropdown');

countBtn.click();
assert(!countDrop.classList.contains('hidden'), 'Variations dropdown opened on click');
assert(!backdrop.classList.contains('hidden'), 'Backdrop opened on click');

const countOptions = countDrop.children;
assert(countOptions.length === 4, `4 variation count options rendered (got ${countOptions.length})`);

// Select variation 4
countOptions[3].click();
assert(sandbox.imageStudioState.imageCount === 4, 'imageStudioState.imageCount updated to 4');
assert(elements.get('mobile-gen-count-label').textContent === '4', 'mobile-gen-count-label updated to 4');
assert(countDrop.classList.contains('hidden'), 'Variations dropdown closed after selection');

// 3. Test Outside-Click Backdrop Dismissal
console.log('\n--- Test 3: Outside-Click Backdrop Dismissal ---');
ratioBtn.click();
assert(!ratioDrop.classList.contains('hidden'), 'Ratio dropdown reopened');
assert(!backdrop.classList.contains('hidden'), 'Backdrop reopened');

backdrop.click();
assert(ratioDrop.classList.contains('hidden'), 'Clicking backdrop closes Ratio dropdown');
assert(backdrop.classList.contains('hidden'), 'Clicking backdrop hides backdrop');

// 4. Test Precise Edit Quality & Variations Popovers
console.log('\n--- Test 4: Precise Edit Quality & Variations Popovers ---');
sandbox.window.openMobileWorkspaceDrawer('edit');
const qualityBtn = elements.get('mobile-precise-quality-btn');
const qualityDrop = elements.get('mobile-precise-quality-dropdown');

qualityBtn.click();
assert(!qualityDrop.classList.contains('hidden'), 'Precise Edit Quality dropdown opened');
const qualityOpts = qualityDrop.children;
assert(qualityOpts.length === 3, '3 quality options (Low, Medium, High) rendered');

qualityOpts[0].click(); // Select Low
assert(sandbox.studioPreciseEditState.quality === 'Low', 'studioPreciseEditState.quality updated to Low');
assert(elements.get('mobile-precise-quality-label').textContent === 'Low', 'Quality label updated to Low');
assert(qualityDrop.classList.contains('hidden'), 'Quality dropdown closed after selection');

const varBtn = elements.get('mobile-precise-var-btn');
const varDrop = elements.get('mobile-precise-var-dropdown');
varBtn.click();
assert(!varDrop.classList.contains('hidden'), 'Precise Edit Variations dropdown opened');
const varOpts = varDrop.children;
assert(varOpts.length === 4, '4 variation options rendered in Precise Edit');
varOpts[1].click(); // Select 2
assert(sandbox.studioPreciseEditState.variationCount === 2, 'studioPreciseEditState.variationCount updated to 2');
assert(elements.get('mobile-precise-var-label').textContent === '2', 'Variations label updated to 2');
assert(varDrop.classList.contains('hidden'), 'Variations dropdown closed after selection');

// 5. Test Upscale Image Scale Factor (2x / 4x)
console.log('\n--- Test 5: Upscale Image Scale Factor (2x / 4x) ---');
sandbox.window.openMobileWorkspaceDrawer('upscale');
const btn2x = elements.get('mobile-upscale-2x-btn');
const btn4x = elements.get('mobile-upscale-4x-btn');

btn4x.click();
assert(sandbox.window.upscaleScaleFactor === 4, 'upscaleScaleFactor updated to 4');
assert(btn4x.className.includes('bg-slate-100/90') && btn4x.className.includes('text-slate-900 font-semibold'), '4x active pill has soft tinted styling');
assert(btn2x.className.includes('bg-[#FFFFFF]') && btn2x.className.includes('text-slate-600'), '2x unselected pill has clean #FFFFFF surface');

btn2x.click();
assert(sandbox.window.upscaleScaleFactor === 2, 'upscaleScaleFactor updated to 2');
assert(btn2x.className.includes('bg-slate-100/90') && btn2x.className.includes('text-slate-900 font-semibold'), '2x active pill has soft tinted styling');
assert(btn4x.className.includes('bg-[#FFFFFF]') && btn4x.className.includes('text-slate-600'), '4x unselected pill has clean #FFFFFF surface');

// 6. Test Dropzone File Input Wiring
console.log('\n--- Test 6: Dropzone File Input Wiring ---');
let fileClicked = false;
elements.get('mobile-rembg-file-input').click = () => { fileClicked = true; };
elements.get('mobile-remove-bg-dropzone').click();
assert(fileClicked, 'Remove Background dropzone click triggers file input click');

console.log('\n================================================================');
console.log(`BEHAVIORAL SIMULATION: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
