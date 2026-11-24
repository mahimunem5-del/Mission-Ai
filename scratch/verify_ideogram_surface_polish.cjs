const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
        console.log(`  ✓ PASS: ${testName}`);
        passedTests++;
    } else {
        console.error(`  ✗ FAIL: ${testName}: ${details}`);
        failedTests++;
    }
}

console.log('================================================================');
console.log('VERIFYING IDEOGRAM-STYLE SURFACE MATCHING POLISH (< 768px)');
console.log('================================================================\n');

const marker = '<!-- ============================================================ -->\n    <!-- DEDICATED MOBILE INNER WORKSPACE';
const endMarker = '<!-- Secret Template Admin Studio';

const mobileBlock = html.substring(html.indexOf(marker), html.indexOf(endMarker));

// -------------------------------------------------------------
// REQUIREMENT 1: BORDERLESS MINIMAL ADVANCED SETTINGS & SEED RANDOMIZER
// -------------------------------------------------------------
console.log('--- Requirement 1: Borderless Minimal Advanced Settings & Seed Randomizer ---');

assert(
    !mobileBlock.includes('border border-slate-200/80 rounded-xl overflow-hidden bg-white') &&
    !mobileBlock.includes('border-t border-slate-100 bg-slate-50/40'),
    'Outer boxy border and separate grey shading removed from Advanced Settings'
);

assert(
    mobileBlock.includes('id="mobile-gen-adv-toggle"') &&
    mobileBlock.includes('text-[14px] font-medium text-slate-800'),
    'Advanced Settings header rendered as a clean borderless row with text-[14px] font-medium text-slate-800'
);

assert(
    mobileBlock.includes('id="mobile-gen-seed-input"') &&
    mobileBlock.includes('bg-[#FFFFFF] border border-slate-200/80 focus:border-slate-300 rounded-xl h-10 px-3 text-[13.5px] text-slate-900 placeholder:text-slate-400'),
    'Seed input matches #FFFFFF sheet background with subtle 1px border'
);

assert(
    mobileBlock.includes('id="mobile-gen-seed-rand-btn"') &&
    mobileBlock.includes('w-9 h-9 rounded-lg bg-transparent hover:bg-slate-100/70 active:scale-95 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer') &&
    mobileBlock.includes('aria-label="Randomize seed"'),
    'Icon-only randomize button has aria-label="Randomize seed" and clean transparent borderless styling'
);

const advIdx = mobileBlock.indexOf('id="mobile-gen-seed-rand-btn"');
const randBtnSnippet = mobileBlock.substring(advIdx, advIdx + 450);
assert(
    !randBtnSnippet.includes('>Rand<') && !randBtnSnippet.includes('<span>Rand</span>') && !randBtnSnippet.includes('Rand</'),
    'Boxy "Rand" text label completely removed from randomize button'
);

// -------------------------------------------------------------
// REQUIREMENT 2: IDEOGRAM-STYLE REFINEMENT OF "SELECT MODEL" BOTTOM SHEET
// -------------------------------------------------------------
console.log('\n--- Requirement 2: Ideogram-Style Refinement of "Select Model" Sheet ---');

// A. Search input
assert(
    mobileBlock.includes('id="mobile-model-search-input"') &&
    mobileBlock.includes('bg-[#FFFFFF] border border-slate-200/80 focus:border-slate-300 rounded-xl h-10 pl-9 pr-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors'),
    'Search input matches #FFFFFF surface with subtle 1px border (no grey bg-slate-100 fill)'
);

// B. Filter pills
assert(
    mobileBlock.includes('px-3 py-1 rounded-lg bg-[#FFFFFF] border border-slate-200/70 text-slate-600 font-medium text-[12.5px] shrink-0 hover:bg-slate-50 transition-colors cursor-pointer select-none active:scale-95') &&
    mobileBlock.includes('px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-900 font-semibold text-[12.5px] shrink-0 transition-colors cursor-pointer select-none active:scale-95'),
    'Provider filter pills: unselected #FFFFFF with border-slate-200/70, active soft tint bg-slate-100 (NEVER solid black)'
);

// C. Scroll padding & Clean Auto row & model rows
assert(
    mobileBlock.includes('id="mobile-model-scroll-body" class="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-4 space-y-3 ideogram-custom-scroll bg-[#FFFFFF]"'),
    'Scrollable model container has pt-1 pb-4 padding preventing top-edge clipping'
);

assert(
    mobileBlock.includes('id="mobile-model-auto-row"') &&
    mobileBlock.includes('<span class="w-5 h-5 shrink-0 flex items-center justify-center text-slate-700">') &&
    !mobileBlock.includes('w-7 h-7 rounded-lg bg-white shadow-2xs'),
    'Auto row icon is unboxed (w-5 h-5 text-slate-700 directly on row surface, no white square box)'
);

const autoIdx = mobileBlock.indexOf('id="mobile-model-auto-row"');
const autoSnippet = mobileBlock.substring(autoIdx, autoIdx + 700);
assert(
    !autoSnippet.includes('mobile-model-auto-check') &&
    !autoSnippet.includes('text-blue-600'),
    'Auto row has NO checkmark indicator (soft fill selection only)'
);

assert(
    mobileBlock.includes("row.className = 'w-full rounded-xl cursor-pointer active:scale-[0.99] transition-all select-none flex items-center justify-between ' + (isSelected ? 'bg-slate-100/80 px-3.5 py-3' : 'bg-transparent hover:bg-slate-50/80 px-3.5 py-2.5');"),
    'Selected model rows use soft subtle tinted fill (bg-slate-100/80) with NO outer borders and NO tick marks'
);

// -------------------------------------------------------------
// REQUIREMENT 3: UNIFIED #FFFFFF BACKGROUND-MATCHED NAVIGATION BUTTONS
// -------------------------------------------------------------
console.log('\n--- Requirement 3: Unified #FFFFFF Background-Matched Navigation Buttons ---');

const unifiedSurfaceClass = 'bg-[#FFFFFF] border border-slate-200/70 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:bg-slate-50';

// 1. Workspace drawer back button
assert(
    mobileBlock.includes('id="mobile-drawer-close-btn"') &&
    mobileBlock.includes(`class="w-9 h-9 rounded-full ${unifiedSurfaceClass} flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer"`),
    'Location 1: Workspace drawer back button has unified elevated #FFFFFF surface style'
);

// 2. Model selector close button
assert(
    mobileBlock.includes('id="mobile-model-close-btn"') &&
    mobileBlock.includes(`class="w-9 h-9 rounded-full ${unifiedSurfaceClass} flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer"`),
    'Location 2: Model selector close button has unified elevated #FFFFFF surface style'
);

// 3. Result feed back button
assert(
    mobileBlock.includes('id="mobile-result-back-btn"') &&
    mobileBlock.includes(`class="w-9 h-9 rounded-full ${unifiedSurfaceClass} flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer"`),
    'Location 3: Result feed back button has unified elevated #FFFFFF surface style'
);

// 4. Result feed + New button
assert(
    mobileBlock.includes('id="mobile-result-new-btn"') &&
    mobileBlock.includes(`class="h-9 px-3.5 rounded-full ${unifiedSurfaceClass} text-[13.5px] font-medium text-slate-800 inline-flex items-center gap-1 active:scale-95 transition-all cursor-pointer"`),
    'Location 4: Result feed + New button has unified elevated #FFFFFF surface style'
);

// -------------------------------------------------------------
// REQUIREMENT 4: STRICT NON-DESTRUCTIVE SCOPE LOCK
// -------------------------------------------------------------
console.log('\n--- Requirement 4: Scope Lock & Desktop Isolation ---');

assert(
    html.includes('@media (min-width: 768px)') &&
    html.includes('#mobile-model-drawer') &&
    html.includes('#mobile-workspace-drawer') &&
    html.includes('display: none !important'),
    'Desktop (>= 768px) media query strictly hides all mobile drawers with display: none !important'
);

assert(
    !mobileBlock.includes('showToast(') && !mobileBlock.includes('toast('),
    'Zero toast popups anywhere in mobile inner workspace'
);

console.log(`\n================================================================`);
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log(`================================================================\n`);

if (failedTests > 0) process.exit(1);
