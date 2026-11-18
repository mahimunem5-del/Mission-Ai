const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

class MockElement {
    constructor(tag, id = '', className = '') {
        this.tagName = tag.toUpperCase();
        this.id = id;
        this.className = className;
        this.dataset = {};
        this.children = [];
        this.listeners = {};
        this.style = {
            setProperty: (prop, val) => { this.style[prop] = val; },
            removeProperty: (prop) => { delete this.style[prop]; }
        };
        this.innerHTML = '';
        this.textContent = '';
        this.value = '';
        className.split(' ').filter(Boolean).forEach(c => this.classList.add(c));
    }

    closest(sel) {
        return this;
    }

    focus() {}
    blur() {}
    remove() {}

    getBoundingClientRect() {
        return { x: 0, y: 0, top: 0, bottom: 0, left: 0, right: 0, width: 100, height: 100 };
    }

    getAttribute(name) {
        return this[name] || (name.startsWith('data-') ? this.dataset[name.slice(5)] : null) || null;
    }

    setAttribute(name, val) {
        this[name] = val;
    }

    removeAttribute(name) {
        delete this[name];
    }

    prepend(...nodes) {
        this.children.unshift(...nodes);
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    querySelector(selector) {
        if (selector.startsWith('.')) {
            const cls = selector.slice(1);
            return this.children.find(c => c.classList && c.classList.contains(cls)) || null;
        }
        if (selector.startsWith('#')) {
            const id = selector.slice(1);
            return this.children.find(c => c.id === id) || null;
        }
        return this.children[0] || null;
    }

    querySelectorAll(selector) {
        const results = [];
        const find = (el) => {
            for (const child of el.children) {
                if (selector.startsWith('.') && child.classList && child.classList.contains(selector.slice(1))) {
                    results.push(child);
                } else if (selector.startsWith('#') && child.id === selector.slice(1)) {
                    results.push(child);
                } else if (child.tagName === selector.toUpperCase()) {
                    results.push(child);
                }
                find(child);
            }
        };
        find(this);
        return results;
    }

    addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }

    dispatchEvent(evt) {
        const type = typeof evt === 'string' ? evt : evt.type;
        if (this.listeners[type]) {
            this.listeners[type].forEach(fn => fn.call(this, evt));
        }
    }

    click() {
        this.dispatchEvent({ type: 'click', stopPropagation: () => {}, preventDefault: () => {} });
    }

    get classList() {
        const self = this;
        return {
            contains: (cls) => (self.className || '').split(' ').includes(cls),
            add: (...classes) => {
                const cur = (self.className || '').split(' ').filter(Boolean);
                classes.forEach(c => { if (!cur.includes(c)) cur.push(c); });
                self.className = cur.join(' ');
            },
            remove: (...classes) => {
                const cur = (self.className || '').split(' ').filter(Boolean);
                self.className = cur.filter(c => !classes.includes(c)).join(' ');
            },
            toggle: (cls, force) => {
                const has = self.classList.contains(cls);
                const shouldHave = force !== undefined ? force : !has;
                if (shouldHave) self.classList.add(cls);
                else self.classList.remove(cls);
            }
        };
    }
}

// Build mock document elements for Hero box and Studio dropdowns
const homePrompt = new MockElement('textarea', 'image-home-prompt-input');
const homeSubmit = new MockElement('button', 'image-home-submit-btn');

const ratioBtn = new MockElement('button', 'image-home-ratio-btn');
const ratioPop = new MockElement('div', 'image-home-ratio-popover');
const ratioLabel = new MockElement('span', 'image-home-ratio-label');
const ratioIcon = new MockElement('span', 'image-home-ratio-icon');

['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', 'auto'].forEach(r => {
    const opt = new MockElement('button', '', 'image-home-ratio-option');
    opt.dataset.ratio = r;
    opt.dataset.label = r;
    const chk = new MockElement('svg', '', 'image-home-ratio-check');
    if (r !== '1:1') chk.classList.add('hidden');
    opt.appendChild(chk);
    ratioPop.appendChild(opt);
});

const countBtn = new MockElement('button', 'image-home-count-btn');
const countPop = new MockElement('div', 'image-home-count-popover');
const countLabel = new MockElement('span', 'image-home-count-label');

['1', '2', '3', '4'].forEach(c => {
    const opt = new MockElement('button', '', 'image-home-count-option');
    opt.dataset.count = c;
    const chk = new MockElement('svg', '', 'image-home-count-check');
    if (c !== '1') chk.classList.add('hidden');
    opt.appendChild(chk);
    countPop.appendChild(opt);
});

const modelBtn = new MockElement('button', 'image-home-model-btn');
const modelPop = new MockElement('div', 'image-home-model-popover');
const modelLabel = new MockElement('span', 'image-home-model-label');
const modelIcon = new MockElement('span', 'image-home-model-icon');
modelIcon.classList.add('hidden');

[
    { id: 'auto', name: 'Auto' },
    { id: 'black-forest-labs/flux.2-pro', name: 'FLUX.2 Pro' },
    { id: 'google/gemini-3-pro-image', name: 'Nano Banana Pro' }
].forEach(m => {
    const opt = new MockElement('button', '', 'image-home-model-option');
    opt.dataset.model = m.id;
    opt.dataset.name = m.name;
    const chk = new MockElement('svg', '', 'image-home-model-check');
    if (m.id !== 'auto') chk.classList.add('hidden');
    opt.appendChild(chk);
    modelPop.appendChild(opt);
});

// Studio Ratio Dropdown in Workspace
const studioRatioBtn = new MockElement('button', 'studio-ratio-btn');
const studioRatioDrop = new MockElement('div', 'studio-ratio-dropdown');
const studioRatioLabel = new MockElement('span', 'studio-ratio-label');
const studioRatioIcon = new MockElement('span', 'studio-ratio-icon');
const studioCountLabel = new MockElement('span', 'studio-count-label');
const studioCountBtn = new MockElement('button', 'studio-count-btn');
const studioCountDrop = new MockElement('div', 'studio-count-dropdown');

['auto', '1:1', '2:3', '3:4', '9:16', '3:2', '4:3', '16:9'].forEach(r => {
    const opt = new MockElement('button', '', 'studio-ratio-option ' + (r === '1:1' ? 'bg-gray-100 font-medium' : 'hover:bg-slate-100'));
    opt.dataset.ratio = r;
    opt.dataset.label = r;
    const chk = new MockElement('svg', '', 'studio-ratio-check');
    if (r !== '1:1') chk.classList.add('hidden');
    const labelSpan = new MockElement('span', '', 'truncate' + (r === '1:1' ? ' font-semibold' : ''));
    labelSpan.textContent = r;
    opt.appendChild(labelSpan);
    opt.appendChild(chk);
    studioRatioDrop.appendChild(opt);
});

['1', '2', '3', '4'].forEach(c => {
    const opt = new MockElement('button', '', 'studio-count-option ' + (c === '1' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'));
    opt.dataset.count = c;
    const chk = new MockElement('svg', '', 'studio-count-check');
    if (c !== '1') chk.classList.add('hidden');
    opt.appendChild(chk);
    studioCountDrop.appendChild(opt);
});

const elementsMap = {
    'image-home-prompt-input': homePrompt,
    'image-home-submit-btn': homeSubmit,
    'image-home-ratio-btn': ratioBtn,
    'image-home-ratio-popover': ratioPop,
    'image-home-ratio-label': ratioLabel,
    'image-home-ratio-icon': ratioIcon,
    'image-home-count-btn': countBtn,
    'image-home-count-popover': countPop,
    'image-home-count-label': countLabel,
    'image-home-model-btn': modelBtn,
    'image-home-model-popover': modelPop,
    'image-home-model-label': modelLabel,
    'image-home-model-icon': modelIcon,
    'studio-ratio-btn': studioRatioBtn,
    'studio-ratio-dropdown': studioRatioDrop,
    'studio-ratio-label': studioRatioLabel,
    'studio-ratio-icon': studioRatioIcon,
    'studio-count-btn': studioCountBtn,
    'studio-count-dropdown': studioCountDrop,
    'studio-count-label': studioCountLabel,
    'image-home-view': new MockElement('div', 'image-home-view'),
    'image-studio-workspace': new MockElement('div', 'image-studio-workspace'),
    'hero-section': new MockElement('div', 'hero-section'),
    'image-home-recent-grid': new MockElement('div', 'image-home-recent-grid'),
    'image-home-recent-count': new MockElement('span', 'image-home-recent-count')
};

const mockDoc = {
    getElementById: (id) => elementsMap[id] || new MockElement('div', id),
    querySelector: (sel) => {
        if (sel.startsWith('#')) return elementsMap[sel.slice(1)] || null;
        return new MockElement('div');
    },
    querySelectorAll: (sel) => {
        if (sel === '.studio-precise-weight-option') return [];
        if (sel === '.studio-precise-count-option') return [];
        return [];
    },
    addEventListener: () => {},
    createElement: (tag) => new MockElement(tag),
    body: new MockElement('body'),
    documentElement: new MockElement('html')
};

const mockWin = {
    location: { pathname: '/', search: '', hash: '', replaceState: () => {}, pushState: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {}
};

// Extract Script #4
const scriptRegex = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
let m;
let s4 = '';
let count = 0;
while ((m = scriptRegex.exec(html)) !== null) {
    count++;
    if (count === 4) s4 = m[1];
}

console.log('Script #4 size:', s4.length, 'bytes');

const context = vm.createContext({
    window: mockWin,
    document: mockDoc,
    console: console,
    lucide: { createIcons: () => {} },
    localStorage: mockWin.localStorage,
    sessionStorage: mockWin.sessionStorage,
    location: mockWin.location,
    URL: global.URL,
    URLSearchParams: global.URLSearchParams,
    Event: class Event { constructor(t) { this.type = t; } },
    CustomEvent: class CustomEvent { constructor(t) { this.type = t; } },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {}
});

// Run script #4
vm.runInContext(s4, context);
console.log('Script #4 executed successfully without any runtime error!');

let allPassed = true;
function check(name, condition, details = '') {
    if (condition) console.log(`  [PASS] ${name}`);
    else { console.error(`  [FAIL] ${name} ${details}`); allPassed = false; }
}

// Call initImageHomeView
if (typeof context.initImageHomeView === 'function') {
    context.initImageHomeView();
    console.log('initImageHomeView() executed successfully!');
}

check('Initial Hero ratio label is 1:1', ratioLabel.textContent === '1:1', ratioLabel.textContent);
check('Initial Hero ratio icon has 1:1 wireframe', ratioIcon.innerHTML.includes('studio-ratio-wireframe'));
check('Initial Hero count label is 1', countLabel.textContent === '1', countLabel.textContent);
check('Initial Hero model label is Auto', modelLabel.textContent === 'Auto', modelLabel.textContent);

// 1. Test selecting 9:16 in Hero Box
const opt916 = ratioPop.children.find(c => c.dataset.ratio === '9:16');
if (opt916) {
    opt916.click();
    check('Selecting 9:16 dynamically updates Hero ratio label to 9:16', ratioLabel.textContent === '9:16', ratioLabel.textContent);
    check('Selecting 9:16 dynamically updates Hero ratio icon to 9:16 wireframe', ratioIcon.innerHTML.includes('w-[9px] h-[16px]'));
}

// 2. Test selecting variation count 3 in Hero Box
const optCount3 = countPop.children.find(c => c.dataset.count === '3');
if (optCount3) {
    optCount3.click();
    check('Selecting 3 dynamically updates Hero count label to 3', countLabel.textContent === '3', countLabel.textContent);
}

// 3. Test selecting FLUX.2 Pro in Hero Box
const optFlux = modelPop.children.find(c => c.dataset.model === 'black-forest-labs/flux.2-pro');
if (optFlux) {
    optFlux.click();
    check('Selecting FLUX.2 Pro dynamically updates Hero model label to FLUX.2 Pro', modelLabel.textContent === 'FLUX.2 Pro', modelLabel.textContent);
    check('Hero model icon becomes visible', !modelIcon.classList.contains('hidden'));
    check('Hero model icon contains SVG', modelIcon.innerHTML.includes('<svg'));
}

// 4. Test submitHomePrompt passing ratio, model, and variations count to setImageStudioMode
let studioModeOptions = null;
const origSetImageStudioMode = context.setImageStudioMode;
context.setImageStudioMode = (mode, opts) => {
    studioModeOptions = opts;
    origSetImageStudioMode(mode, opts);
};

homePrompt.value = 'a cyberpunk city at sunset';
homeSubmit.disabled = false;
homeSubmit.click();

check('submitHomePrompt passes active aspectRatio (9:16)', studioModeOptions && studioModeOptions.aspectRatio === '9:16');
check('submitHomePrompt passes active model (black-forest-labs/flux.2-pro)', studioModeOptions && studioModeOptions.model === 'black-forest-labs/flux.2-pro');
check('submitHomePrompt passes active count (3)', studioModeOptions && studioModeOptions.count === 3 && studioModeOptions.imageCount === 3);

// Verify imageStudioState received count and aspectRatio
const state = vm.runInContext('imageStudioState', context);
check('imageStudioState receives imageCount 3', state.imageCount === 3);
check('imageStudioState receives aspectRatio 9:16', state.aspectRatio === '9:16');

// 5. Test studio ratio dropdown sync (Fix for static dark highlight bug on 1:1)
const studioOpt11 = studioRatioDrop.children.find(c => c.dataset.ratio === '1:1');
const studioOpt169 = studioRatioDrop.children.find(c => c.dataset.ratio === '16:9');

// Select 16:9 in studio dropdown
studioOpt169.click();

check('Selecting 16:9 in studio sets 16:9 as active class (bg-gray-100)', studioOpt169.classList.contains('bg-gray-100'));
check('Selecting 16:9 removes active class from 1:1 (no bg-gray-100)', !studioOpt11.classList.contains('bg-gray-100'));
check('16:9 checkmark is visible', !studioOpt169.querySelector('.studio-ratio-check').classList.contains('hidden'));
check('1:1 checkmark is hidden', studioOpt11.querySelector('.studio-ratio-check').classList.contains('hidden'));

console.log('================================================================');
if (allPassed) {
    console.log('ALL SIMULATED RUNTIME EVENT & WIRING TESTS PASSED (100%)!');
} else {
    console.error('SOME SIMULATED TESTS FAILED!');
}
console.log('================================================================');
process.exit(allPassed ? 0 : 1);
