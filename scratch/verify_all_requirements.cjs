const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✓ PASS: ${message}`);
    } else {
        failedTests++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

console.log('=== VERIFYING UPGRADED MOBILE INNER WORKSPACE & RESULT FEED ===\n');

// -------------------------------------------------------------
// SECTION 0: STRICT NON-DESTRUCTIVE SCOPE LOCK & CSS ISOLATION
// -------------------------------------------------------------
console.log('--- Section 0: Strict Scope Lock & Media Queries ---');
assert(
    html.includes('#mobile-model-drawer') &&
    html.includes('#mobile-workspace-drawer') &&
    html.includes('#mobile-workspace-result-feed'),
    'All mobile workspace containers present in HTML'
);

const desktopMediaQueryRegex = /@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*?#mobile-model-drawer[\s\S]*?display:\s*none\s*!important/i;
assert(
    desktopMediaQueryRegex.test(html),
    'Desktop (>= 768px) media query hides #mobile-model-drawer with display: none !important'
);

assert(
    html.includes('#mobile-workspace-drawer,\n            #mobile-model-drawer,\n            #mobile-workspace-result-feed'),
    'Desktop CSS selector cleanly includes #mobile-model-drawer alongside #mobile-workspace-drawer and #mobile-workspace-result-feed'
);

// -------------------------------------------------------------
// SECTION 1: SWIPE-TO-DISMISS GESTURE PHYSICS
// -------------------------------------------------------------
console.log('\n--- Section 1: Universal Swipe-to-Dismiss Physics ---');
assert(
    html.includes('function attachSwipeToDismiss({ backdropEl, sheetEl, dragHandleEl, scrollBodyEl, onClose })'),
    'attachSwipeToDismiss function defined with full pointer/touch options'
);
assert(
    html.includes('sheetEl.style.transform = `translateY(${deltaY}px)`;'),
    'Smooth real-time downward translation during active drag'
);
assert(
    html.includes('backdropEl.style.opacity = String(Math.max(0.15, 1 - progress * 0.85));'),
    'Proportional backdrop opacity fading during downward drag'
);
assert(
    html.includes('shouldDismiss = isDragging && (deltaY > 100 || (deltaY > 40 && velocity > 0.35))'),
    'Dismiss threshold: deltaY > 100px or downward flick velocity > 0.35 px/ms'
);
assert(
    html.includes("sheetEl.style.transition = 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)'"),
    'Spring-back physics using cubic-bezier(0.22, 1, 0.36, 1)'
);
assert(
    html.includes('const atTop = !scrollBodyEl || scrollBodyEl.scrollTop <= 0;'),
    'Inner scroll container only allows drag when scrollTop <= 0'
);
assert(
    html.includes('id="mobile-workspace-drag-handle"') && html.includes('id="mobile-model-drag-handle"'),
    'Both workspace sheet and model sheet have dedicated top drag handle bars'
);
assert(
    html.includes('w-9 h-1 rounded-full bg-slate-300 mx-auto mb-2.5 cursor-grab active:cursor-grabbing'),
    'Native-app-grade top grabber pills present on both sheets'
);

// -------------------------------------------------------------
// SECTION 2: NESTED "SELECT MODEL" BOTTOM SHEET DRAWER
// -------------------------------------------------------------
console.log('\n--- Section 2: Nested Select Model Bottom Sheet Drawer ---');
assert(
    html.includes('id="mobile-model-drawer"') && html.includes('class="hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px]'),
    'Dedicated nested drawer #mobile-model-drawer with z-[60] and dimmed backdrop'
);
assert(
    html.includes('id="mobile-model-sheet"') && html.includes('rounded-t-[28px]'),
    'Floating white sheet with rounded-t-[28px] surface'
);
assert(
    html.includes('id="mobile-model-close-btn"') && html.includes('w-9 h-9 rounded-full bg-[#FFFFFF]'),
    'Borderless header left circular close button with ✕ icon'
);
assert(
    html.includes('<h3 class="text-[16px] font-semibold text-slate-900 tracking-tight text-center">Select model</h3>'),
    'Centered Select model header title'
);
assert(
    html.includes('id="mobile-model-search-input"') && html.includes('placeholder="Search models..."'),
    'Search input with placeholder "Search models..."'
);
assert(
    html.includes('id="mobile-model-filter-pills"'),
    'Horizontal scrollable provider filter pills container'
);
assert(
    html.includes('id="mobile-model-auto-row"') && html.includes('bg-slate-100/80 rounded-xl px-3.5 py-3'),
    'Highlighted Auto row card at top of model list'
);
assert(
    html.includes('function renderMobileModelList()') && html.includes('function renderMobileModelFilterPills()'),
    'Model list and filter pills dynamically rendered from models catalog'
);
assert(
    html.includes('id="mobile-gen-model-btn"') && html.includes('id="mobile-gen-model-icon"') && html.includes('id="mobile-gen-model-label"'),
    'Generate Image drawer model trigger button displays both provider icon and model label'
);

// -------------------------------------------------------------
// SECTION 3: IDEOGRAM-STYLE MINIMAL POLISH FOR 4 DRAWERS
// -------------------------------------------------------------
console.log('\n--- Section 3: Ideogram-Style Minimal Polish for 4 Drawers ---');
// Verify NO Clear all button in workspace sheet
const wsDrawerStart = html.indexOf('id="mobile-workspace-drawer"');
const wsDrawerEnd = html.indexOf('id="mobile-model-drawer"');
const wsDrawerHtml = html.substring(wsDrawerStart, wsDrawerEnd).replace(/<!--[\s\S]*?-->/g, '');
assert(
    !wsDrawerHtml.includes('Clear all') && !wsDrawerHtml.includes('clear-all'),
    'Clear all button completely removed from workspace drawer header'
);
assert(
    !wsDrawerHtml.includes('border-b border-slate-100'),
    'Borderless header: horizontal border-b divider line removed beneath title'
);
assert(
    html.includes('id="mobile-drawer-close-btn"') && html.includes('w-9 h-9 rounded-full bg-[#FFFFFF]') && html.includes('polyline points="12 19 5 12 12 5"'),
    'Left circular back button with clean full left arrow (←)'
);
assert(
    html.includes('function renderMobileStylePills()'),
    'renderMobileStylePills function exists'
);
assert(
    html.includes("btn.className = isActive\n                    ? 'px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 font-semibold text-[13.5px] transition-colors cursor-pointer select-none active:scale-95'\n                    : 'px-3 py-1.5 rounded-full bg-transparent hover:bg-slate-100/60 text-slate-600 font-medium text-[13.5px] transition-colors cursor-pointer select-none active:scale-95'"),
    'Minimal Plain Style Presets: unselected transparent on #FFFFFF, selected soft subtle tinted pill bg-slate-100, NEVER black (#111827)'
);
assert(
    html.includes('id="mobile-gen-prompt-input"') && html.includes('bg-[#FFFFFF] rounded-2xl border border-slate-200/80'),
    'Surface-matched Prompt textarea: pure #FFFFFF background with subtle 1px border'
);

// -------------------------------------------------------------
// SECTION 4: ZERO-JUMP ATOMIC SKELETON-TO-IMAGE REPLACEMENT
// -------------------------------------------------------------
console.log('\n--- Section 4: Zero-Jump Atomic Skeleton-to-Image Replacement ---');
assert(
    html.includes('window.mobilePreGenFirstItemId'),
    'Records pre-generation top item ID for atomic resolution'
);
assert(
    html.includes('if (topItem && topItemId !== window.mobilePreGenFirstItemId) {\n                    window.isMobileProcessing = false;\n                }'),
    'Atomic transition: clears processing immediately when new item arrives, preventing layout shift'
);
assert(
    html.includes('w-[82%] max-w-[290px] aspect-square rounded-2xl bg-slate-100 border border-slate-200/60 overflow-hidden relative animate-pulse shadow-2xs'),
    'In-place generation placeholder has identical compact frame dimensions (w-[82%] max-w-[290px]) and shimmer'
);

// -------------------------------------------------------------
// SECTION 5: MINIMAL & PREMIUM MOBILE RESULT FEED
// -------------------------------------------------------------
console.log('\n--- Section 5: International-Standard Minimal Result Feed ---');
assert(
    html.includes('id="mobile-workspace-result-feed"') && html.includes('bg-[#FFFFFF]'),
    'Dedicated mobile result feed on pure #FFFFFF surface'
);
assert(
    html.includes('id="mobile-result-back-btn"') && html.includes('w-9 h-9 rounded-full bg-[#FFFFFF]'),
    'Borderless top bar circular left arrow (←) button'
);
assert(
    html.includes('id="mobile-result-new-btn"') && html.includes('h-9 px-3.5 rounded-full bg-[#FFFFFF]'),
    'Borderless top bar surface-integrated + New button'
);

const feedIdx = html.indexOf('id="mobile-workspace-result-feed"');
const feedEnd = html.indexOf('<!-- B. Multi-Select Floating Contextual Bar', feedIdx);
const feedTopBar = html.substring(feedIdx, feedEnd);
assert(
    !feedTopBar.includes('< Back') && !feedTopBar.includes('border-b') && !feedTopBar.includes('id="mobile-result-tool-badge"'),
    'Borderless top bar: NO < Back label, NO tool pill badge, NO border-b line'
);
assert(
    html.includes('id="mobile-result-multiselect-bar"'),
    'Multi-select contextual action bar present'
);
assert(
    html.includes('id="mobile-multiselect-count"') &&
    html.includes('id="mobile-multiselect-deselect-btn"') &&
    html.includes('id="mobile-multiselect-download-btn"') &&
    html.includes('id="mobile-multiselect-delete-btn"') &&
    html.includes('id="mobile-multiselect-edit-btn"'),
    'Multi-select bar has count, Deselect, Download, Delete, and conditional Edit button'
);
assert(
    html.includes('mobile-item-check-btn w-4 h-4 rounded-[5px] border'),
    'Result item square selection checkbox button (w-4 h-4 rounded-[5px])'
);
assert(
    html.includes('mobile-action-copy-prompt-btn inline-flex items-center gap-1 ml-2 text-[12.5px] font-medium text-slate-400 hover:text-slate-800 active:scale-95 transition-all cursor-pointer') &&
    html.includes('✓ Copied'),
    'Prompt row with inline minimal Copy prompt toggling to ✓ Copied for 2 seconds'
);
assert(
    html.includes('mobile-output-frame mt-2.5 w-[82%] max-w-[290px] rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50'),
    'Compact generated image frame (w-[82%] max-w-[290px])'
);
assert(
    html.includes('mobile-action-edit-btn px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100/70 active:bg-slate-100 text-[13px] font-medium text-slate-700 inline-flex items-center gap-1.5 transition-colors') &&
    html.includes('mobile-action-upscale-btn px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100/70 active:bg-slate-100 text-[13px] font-medium text-slate-700 inline-flex items-center gap-1.5 transition-colors') &&
    html.includes('mobile-action-download-btn px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100/70 active:bg-slate-100 text-[13px] font-medium text-slate-700 inline-flex items-center gap-1.5 transition-colors'),
    'Surface-matched soft minimal Edit, Upscale, and Download text buttons (NO heavy grey pills)'
);
assert(
    html.includes('id="mobile-result-edit-prompt-btn"') && html.includes('id="mobile-result-regenerate-btn"'),
    'Fixed bottom bar with Edit Prompt and Regenerate buttons'
);

// Zero toasts check in mobile inner workspace script
const mobileScriptStart = html.indexOf('DEDICATED MOBILE INNER WORKSPACE (< 768px, md:hidden)');
const mobileScriptEnd = html.indexOf('Secret Template Admin Studio');
const mobileScript = html.substring(mobileScriptStart, mobileScriptEnd);
assert(
    !mobileScript.includes('showToast(') && !mobileScript.includes('toast('),
    'ZERO toast notifications anywhere in mobile inner workspace'
);

console.log(`\n======================================================`);
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log(`======================================================\n`);

if (failedTests > 0) {
    process.exit(1);
}
