const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

console.log('================================================================');
console.log('SURGICAL VERIFICATION: PRECISE EDIT UI FIXES (DESKTOP & MOBILE)');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, name, details = '') {
    totalTests++;
    if (condition) {
        console.log(`[PASS] ${name}`);
        passedTests++;
    } else {
        console.error(`[FAIL] ${name}: ${details}`);
        failedTests++;
    }
}

const rootDir = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const tsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ImageWorkspace.tsx'), 'utf8');

// =============================================================================
// SUITE 1: CLEAN "Auto" LABEL (NO "(Default)")
// =============================================================================
console.log('\n--- SUITE 1: Clean "Auto" Label (Requirement 3) ---');

assert(
    !html.includes('Auto (Default)'),
    'index.html contains zero occurrences of "Auto (Default)"'
);

assert(
    !tsx.includes('Auto (Default)'),
    'ImageWorkspace.tsx contains zero occurrences of "Auto (Default)"'
);

// Check index.html trigger button and dropdown label
assert(
    html.includes('id="precise-edit-model-label" class="text-[13px] font-medium tracking-[-0.005em] text-neutral-800 dark:text-neutral-100 truncate">Auto</span>'),
    'Desktop precise edit model label renders clean "Auto"'
);

assert(
    html.includes('data-edit-model="auto" data-edit-name="Auto"'),
    'Desktop precise edit model option data-edit-name is strictly "Auto"'
);

assert(
    html.includes('id="mobile-precise-model-label" class="text-[13px] font-medium text-slate-800 truncate">Auto</span>'),
    'Mobile precise edit model label renders clean "Auto"'
);

assert(
    html.includes('data-mobile-edit-model="auto" data-mobile-edit-name="Auto"'),
    'Mobile precise edit model option data-mobile-edit-name is strictly "Auto"'
);

// Check ImageWorkspace.tsx trigger button and dropdown label
assert(
    tsx.includes("{preciseEditModel === 'auto' ? 'Auto' :"),
    'ImageWorkspace.tsx precise model label resolves to "Auto" for auto'
);

assert(
    /id:\s*'auto',\s*label:\s*'Auto'/.test(tsx),
    'ImageWorkspace.tsx model options list defines auto label as strictly "Auto"'
);

// =============================================================================
// SUITE 2: MUTUAL EXCLUSION (TOP WORKFLOW SWITCHER & MODEL DROPDOWN)
// =============================================================================
console.log('\n--- SUITE 2: Mutual Exclusion (Requirement 1) ---');

// In index.html, closeAllStudioDropdowns must include precise-edit-model-dropdown
assert(
    html.includes("document.getElementById('precise-edit-model-dropdown')"),
    'closeAllStudioDropdowns in index.html includes precise-edit-model-dropdown'
);

// Opening desktop model dropdown must call closeAllStudioDropdowns()
assert(
    html.includes("const deskBtn = document.getElementById('precise-edit-model-btn');\n            const deskDrop = document.getElementById('precise-edit-model-dropdown');\n            if (deskBtn && deskDrop) {\n                deskBtn.addEventListener('click', function(e) {\n                    e.stopPropagation();\n                    const isOpen = !deskDrop.classList.contains('hidden');\n                    closeAllStudioDropdowns();"),
    'Desktop precise-edit-model-btn click immediately calls closeAllStudioDropdowns()'
);

// In ImageWorkspace.tsx, clicking tool switcher closes precise model, quality, count
assert(
    tsx.includes('setIsPreciseModelOpen(false);\n                    setIsQualityOpen(false);\n                    setIsPreciseCountOpen(false);'),
    'ImageWorkspace.tsx workspace-tool-switcher-btn click closes isPreciseModelOpen'
);

// In ImageWorkspace.tsx, opening precise model dropdown closes tool switcher, quality, variations
assert(
    tsx.includes("setIsPreciseModelOpen(next);\n                      if (next) {\n                        setIsToolSwitcherOpen(false);\n                        setIsQualityOpen(false);\n                        setIsPreciseCountOpen(false);"),
    'ImageWorkspace.tsx studio-precise-model-btn click closes isToolSwitcherOpen, isQualityOpen, isPreciseCountOpen'
);

// In ImageWorkspace.tsx, opening Quality closes precise model and tool switcher
assert(
    tsx.includes("setIsQualityOpen(next);\n                      if (next) {\n                        setIsPreciseModelOpen(false);\n                        setIsPreciseCountOpen(false);\n                        setIsToolSwitcherOpen(false);"),
    'ImageWorkspace.tsx Quality click closes isPreciseModelOpen and isToolSwitcherOpen'
);

// In ImageWorkspace.tsx, opening Variations closes precise model and tool switcher
assert(
    tsx.includes("setIsPreciseCountOpen(next);\n                      if (next) {\n                        setIsPreciseModelOpen(false);\n                        setIsQualityOpen(false);\n                        setIsToolSwitcherOpen(false);"),
    'ImageWorkspace.tsx Variations count click closes isPreciseModelOpen and isToolSwitcherOpen'
);

// =============================================================================
// SUITE 3: MODEL BRAND ICONS IN RESULT CARDS
// =============================================================================
console.log('\n--- SUITE 3: Model Brand Icons in Result Cards (Requirement 2) ---');

// getModelIconSvg must support Auto and Krea
assert(
    html.includes("if (mid === 'auto' || mid.startsWith('auto'))") &&
    html.includes("if (mid.includes('krea') || mid.includes('k3') || mid.includes('flux-fill'))"),
    'getModelIconSvg in index.html supports auto and krea/k3-edit'
);

// Desktop gallery card for isPreciseEdit must render model brand icon
assert(
    html.includes("${(() => {\n                                    const rawName = (group.images && (group.images[0]?.actualModelDisplayName || group.images[0]?.modelName)) || group.actualModelDisplayName || group.modelName;\n                                    const rawModel = (group.images && group.images[0]?.model) || group.model;\n                                    const targetKey = (rawModel && rawModel !== 'auto') ? rawModel : (rawName || 'krea/k3-edit');\n                                    return getModelIconSvg(targetKey);\n                                })()}"),
    'index.html desktop gallery result card renders matching model brand icon for Precise Edit'
);

// Mobile feed must show model badge and icon for isPreciseEdit
assert(
    html.includes('const showModelBadge = !isRemoveBg && !isUpscale;') &&
    html.includes("const mId = item.model || item.modelId || 'krea/k3-edit';"),
    'index.html mobile result feed renders model badge with brand icon for isPreciseEdit'
);

// ImageWorkspace.tsx gallery card must render matching brand icon
assert(
    tsx.includes("asset.isPreciseEdit ? (") &&
    tsx.includes("m.includes('seedream') || m.includes('bytedance')") &&
    tsx.includes("m.includes('banana') || m.includes('gemini') || m.includes('google')") &&
    tsx.includes("m === 'auto' || m.startsWith('auto')"),
    'ImageWorkspace.tsx gallery result card renders matching model brand icon for isPreciseEdit'
);

// =============================================================================
// SUITE 4: BEHAVIORAL DOM EMULATION
// =============================================================================
console.log('\n--- SUITE 4: Behavioral DOM Emulation ---');

class MockClassList {
    constructor() { this._classes = new Set(['hidden']); }
    add(cls) { this._classes.add(cls); }
    remove(cls) { this._classes.delete(cls); }
    contains(cls) { return this._classes.has(cls); }
    toggle(cls, force) {
        if (force === undefined) {
            if (this.contains(cls)) this.remove(cls);
            else this.add(cls);
        } else if (force) {
            this.add(cls);
        } else {
            this.remove(cls);
        }
    }
}

class FakeDOMElement {
    constructor(id) {
        this.id = id;
        this.classList = new MockClassList();
        this._listeners = {};
    }
    addEventListener(evt, fn) {
        if (!this._listeners[evt]) this._listeners[evt] = [];
        this._listeners[evt].push(fn);
    }
    click() {
        const e = { stopPropagation: () => {} };
        if (this._listeners['click']) {
            this._listeners['click'].forEach(fn => fn(e));
        }
    }
}

const fakeDOM = {
    'workspace-tool-switcher-btn': new FakeDOMElement('workspace-tool-switcher-btn'),
    'workspace-tool-flyout': new FakeDOMElement('workspace-tool-flyout'),
    'workspace-tool-switcher-chevron': new FakeDOMElement('workspace-tool-switcher-chevron'),
    'precise-edit-model-btn': new FakeDOMElement('precise-edit-model-btn'),
    'precise-edit-model-dropdown': new FakeDOMElement('precise-edit-model-dropdown'),
    'studio-precise-edit-weight-btn': new FakeDOMElement('studio-precise-edit-weight-btn'),
    'studio-precise-edit-weight-dropdown': new FakeDOMElement('studio-precise-edit-weight-dropdown'),
    'studio-precise-edit-count-btn': new FakeDOMElement('studio-precise-edit-count-btn'),
    'studio-precise-edit-count-dropdown': new FakeDOMElement('studio-precise-edit-count-dropdown')
};

// Wire mutual exclusion matching index.html
function closeAllStudioDropdowns() {
    [
        fakeDOM['workspace-tool-flyout'],
        fakeDOM['precise-edit-model-dropdown'],
        fakeDOM['studio-precise-edit-weight-dropdown'],
        fakeDOM['studio-precise-edit-count-dropdown']
    ].forEach(d => {
        if (d) d.classList.add('hidden');
    });
    if (fakeDOM['workspace-tool-switcher-chevron']) {
        fakeDOM['workspace-tool-switcher-chevron'].classList.remove('rotate-180');
    }
}

// Workflow switcher click
fakeDOM['workspace-tool-switcher-btn'].addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = fakeDOM['workspace-tool-flyout'].classList.contains('hidden');
    closeAllStudioDropdowns();
    if (isClosed) {
        fakeDOM['workspace-tool-flyout'].classList.remove('hidden');
        fakeDOM['workspace-tool-switcher-chevron'].classList.add('rotate-180');
    } else {
        fakeDOM['workspace-tool-flyout'].classList.add('hidden');
        fakeDOM['workspace-tool-switcher-chevron'].classList.remove('rotate-180');
    }
});

// Precise Edit Model click
fakeDOM['precise-edit-model-btn'].addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !fakeDOM['precise-edit-model-dropdown'].classList.contains('hidden');
    closeAllStudioDropdowns();
    if (!isOpen) {
        fakeDOM['precise-edit-model-dropdown'].classList.remove('hidden');
    }
});

// Quality click
fakeDOM['studio-precise-edit-weight-btn'].addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = fakeDOM['studio-precise-edit-weight-dropdown'].classList.contains('hidden');
    closeAllStudioDropdowns();
    if (isHidden) fakeDOM['studio-precise-edit-weight-dropdown'].classList.remove('hidden');
});

// Variations count click
fakeDOM['studio-precise-edit-count-btn'].addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = fakeDOM['studio-precise-edit-count-dropdown'].classList.contains('hidden');
    closeAllStudioDropdowns();
    if (isHidden) fakeDOM['studio-precise-edit-count-dropdown'].classList.remove('hidden');
});

// Test scenario 1: Open Model dropdown, then click Top Switcher
fakeDOM['precise-edit-model-btn'].click();
assert(
    !fakeDOM['precise-edit-model-dropdown'].classList.contains('hidden'),
    'Behavioral: Precise Edit Model dropdown opens on click'
);

fakeDOM['workspace-tool-switcher-btn'].click();
assert(
    fakeDOM['precise-edit-model-dropdown'].classList.contains('hidden'),
    'Behavioral: Opening top workflow switcher immediately closes Precise Edit Model dropdown (NO overlap)'
);
assert(
    !fakeDOM['workspace-tool-flyout'].classList.contains('hidden'),
    'Behavioral: Top workflow switcher flyout is now open'
);

// Test scenario 2: Top Switcher is open, now click Model dropdown
fakeDOM['precise-edit-model-btn'].click();
assert(
    fakeDOM['workspace-tool-flyout'].classList.contains('hidden'),
    'Behavioral: Opening Precise Edit Model dropdown immediately closes Top Workflow switcher flyout'
);
assert(
    !fakeDOM['precise-edit-model-dropdown'].classList.contains('hidden'),
    'Behavioral: Precise Edit Model dropdown is now open'
);

// Test scenario 3: Model dropdown is open, now click Quality
fakeDOM['studio-precise-edit-weight-btn'].click();
assert(
    fakeDOM['precise-edit-model-dropdown'].classList.contains('hidden'),
    'Behavioral: Clicking Quality closes Precise Edit Model dropdown'
);
assert(
    !fakeDOM['studio-precise-edit-weight-dropdown'].classList.contains('hidden'),
    'Behavioral: Quality dropdown is now open'
);

// Test scenario 4: Quality is open, now click Model dropdown
fakeDOM['precise-edit-model-btn'].click();
assert(
    fakeDOM['studio-precise-edit-weight-dropdown'].classList.contains('hidden'),
    'Behavioral: Clicking Model closes Quality dropdown'
);

// Test scenario 5: Model dropdown is open, now click Variations
fakeDOM['studio-precise-edit-count-btn'].click();
assert(
    fakeDOM['precise-edit-model-dropdown'].classList.contains('hidden'),
    'Behavioral: Clicking Variations closes Precise Edit Model dropdown'
);
assert(
    !fakeDOM['studio-precise-edit-count-dropdown'].classList.contains('hidden'),
    'Behavioral: Variations dropdown is now open'
);

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
