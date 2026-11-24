const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

console.log('================================================================');
console.log('VERIFYING FLOATING POPOVERS, UPLOAD BOXES, & SOFT SCALE SELECTORS');
console.log('================================================================\n');

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

function hasClasses(snippet, classes) {
    return classes.every(cls => snippet.includes(cls));
}

// --------------------------------------------------------------------------
// 1. Generate Image: Variations Label & Floating Popovers
// --------------------------------------------------------------------------
console.log('--- Requirement 1: Variations Label & Floating Popovers (Generate Image) ---');

// 1a. Variations label
const variationsLabelMatch = /<div class="relative">\s*<label class="text-\[12px\] font-semibold text-slate-800 block mb-1">Variations<\/label>\s*<button type="button" id="mobile-gen-count-btn"/;
assert(variationsLabelMatch.test(indexHtml), 'Label "Count" is renamed to "Variations" above mobile-gen-count-btn');

// 1b. Popover backdrop
assert(indexHtml.includes('id="mobile-popover-backdrop"') && indexHtml.includes('fixed inset-0 z-[75] bg-transparent'), 'Transparent outside-click popover backdrop exists with z-[75]');

// 1c. Upward floating classes on Aspect Ratio dropdown
const ratioDropSnippet = indexHtml.substring(indexHtml.indexOf('id="mobile-gen-ratio-dropdown"'), indexHtml.indexOf('id="mobile-gen-ratio-dropdown"') + 400);
const ratioDropMatch = hasClasses(ratioDropSnippet, [
    'bottom-[calc(100%+6px)]',
    'z-[80]',
    'bg-[#FFFFFF]',
    'border-slate-200/80',
    'rounded-2xl',
    'shadow-[0_8px_28px_rgba(15,23,42,0.12)]',
    'py-1.5',
    'overflow-hidden'
]);
assert(ratioDropMatch, 'Aspect Ratio dropdown floats upward with bottom-[calc(100%+6px)], z-[80], and #FFFFFF surface styling');

// 1d. Upward floating classes on Variations dropdown
const countDropSnippet = indexHtml.substring(indexHtml.indexOf('id="mobile-gen-count-dropdown"'), indexHtml.indexOf('id="mobile-gen-count-dropdown"') + 400);
const countDropMatch = hasClasses(countDropSnippet, [
    'bottom-[calc(100%+6px)]',
    'z-[80]',
    'bg-[#FFFFFF]',
    'border-slate-200/80',
    'rounded-2xl',
    'shadow-[0_8px_28px_rgba(15,23,42,0.12)]',
    'py-1.5',
    'overflow-hidden'
]);
assert(countDropMatch, 'Variations dropdown floats upward with bottom-[calc(100%+6px)] and z-[80]');

// 1e. Soft selection styling in JS
assert(indexHtml.includes('bg-slate-100/80 text-slate-900 font-semibold mx-1.5 rounded-xl px-2.5'), 'Soft subtle tinted highlight (bg-slate-100/80) used for selected popover items');
assert(indexHtml.includes('px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50'), 'Clean #FFFFFF hover style (px-3.5 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50) used for unselected items');

// 1f. Exact option labels preserved (no extra text)
assert(!indexHtml.includes('1:1 (Square)'), 'Exact ratio labels preserved without extra (Square) text');
assert(!indexHtml.includes('2:3 (Portrait)'), 'Exact ratio labels preserved without extra (Portrait) text');

// --------------------------------------------------------------------------
// 2. Remove Background Drawer: Minimal Surface-Matched Upload Box
// --------------------------------------------------------------------------
console.log('\n--- Requirement 2: Minimal Upload Box (Remove Background) ---');

// 2a. Container styling
const remBgSnippet = indexHtml.substring(indexHtml.indexOf('id="mobile-remove-bg-dropzone"'), indexHtml.indexOf('id="mobile-remove-bg-dropzone"') + 400);
const remBgDashedMatch = hasClasses(remBgSnippet, ['rounded-2xl', 'border', 'border-dashed', 'border-slate-200/80', 'bg-[#FFFFFF]']);
assert(remBgDashedMatch, 'Remove Background upload box styled with bg-[#FFFFFF] border border-dashed border-slate-200/80 rounded-2xl');

// 2b. Clean prompt text and + Add button
assert(indexHtml.includes('Choose a photo to remove background'), 'Contains clean centered prompt text "Choose a photo to remove background"');
const remBgAddBtn = indexHtml.includes('mt-3 px-4 py-1.5 rounded-xl bg-[#FFFFFF] border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-[13px] font-medium text-slate-800 inline-flex items-center gap-1.5');
assert(remBgAddBtn, 'Contains minimal surface-matched "+ Add" button with elevated #FFFFFF styling');

// 2c. No top circular icon or file-size subtitle in dropzone
const remBgSlice = indexHtml.substring(indexHtml.indexOf('id="mobile-remove-bg-dropzone"'), indexHtml.indexOf('id="mobile-rembg-preview-wrap"'));
assert(!remBgSlice.includes('PNG, JPG, or WEBP up to 20MB'), 'File-size subtitle removed from Remove Background dropzone');
assert(!remBgSlice.includes('rounded-full bg-white shadow-2xs'), 'Circular top upload icon removed from Remove Background dropzone');

// --------------------------------------------------------------------------
// 3. Precise Edit Drawer: Surface-Matched Source Box & Multi-Slot Reference Grid
// --------------------------------------------------------------------------
console.log('\n--- Requirement 3: Surface-Matched Box & Multi-Slot Grid (Precise Edit) ---');

// 3a. Precise Edit source box
const preciseDropSnippet = indexHtml.substring(indexHtml.indexOf('id="mobile-precise-dropzone"'), indexHtml.indexOf('id="mobile-precise-dropzone"') + 400);
const preciseDashedMatch = hasClasses(preciseDropSnippet, ['rounded-2xl', 'border', 'border-dashed', 'border-slate-200/80', 'bg-[#FFFFFF]']);
assert(preciseDashedMatch, 'Precise Edit Source box styled with bg-[#FFFFFF] border border-dashed border-slate-200/80 rounded-2xl');
assert(indexHtml.includes('Upload image to edit'), 'Source image box keeps "Upload image to edit"');

// 3b. 5-slot grid for reference images
const preciseRefSlotsMatch = indexHtml.includes('id="mobile-precise-ref-slots"') &&
    indexHtml.includes('grid grid-cols-5 gap-2 w-full');
assert(preciseRefSlotsMatch, 'Reference images container is a 5-column grid (grid grid-cols-5 gap-2 w-full)');

// 3c. Floating popovers for Quality & Variations in Precise Edit
const qualityDropSnippet = indexHtml.substring(indexHtml.indexOf('id="mobile-precise-quality-dropdown"'), indexHtml.indexOf('id="mobile-precise-quality-dropdown"') + 400);
const qualityDropMatch = hasClasses(qualityDropSnippet, ['bottom-[calc(100%+6px)]', 'z-[80]', 'bg-[#FFFFFF]', 'border-slate-200/80', 'rounded-2xl']);
assert(qualityDropMatch, 'Quality dropdown in Precise Edit floats upward with bottom-[calc(100%+6px)] and z-[80]');

const preciseVarDropSnippet = indexHtml.substring(indexHtml.indexOf('id="mobile-precise-var-dropdown"'), indexHtml.indexOf('id="mobile-precise-var-dropdown"') + 400);
const preciseVarDropMatch = hasClasses(preciseVarDropSnippet, ['bottom-[calc(100%+6px)]', 'z-[80]', 'bg-[#FFFFFF]', 'border-slate-200/80', 'rounded-2xl']);
assert(preciseVarDropMatch, 'Variations dropdown in Precise Edit floats upward with bottom-[calc(100%+6px)] and z-[80]');

// --------------------------------------------------------------------------
// 4. Upscale Image Drawer: Minimal Upload Box & Soft Scale Selector
// --------------------------------------------------------------------------
console.log('\n--- Requirement 4: Minimal Upload Box & Soft Scale Selector (Upscale Image) ---');

// 4a. Minimal upload box
const upscaleDropSnippet = indexHtml.substring(indexHtml.indexOf('id="mobile-upscale-dropzone"'), indexHtml.indexOf('id="mobile-upscale-dropzone"') + 400);
const upscaleDashedMatch = hasClasses(upscaleDropSnippet, ['rounded-2xl', 'border', 'border-dashed', 'border-slate-200/80', 'bg-[#FFFFFF]']);
assert(upscaleDashedMatch, 'Upscale Image upload box styled with bg-[#FFFFFF] border border-dashed border-slate-200/80 rounded-2xl');
assert(indexHtml.includes('Choose a photo to upscale'), 'Contains clean centered prompt text "Choose a photo to upscale"');

const upscaleSlice = indexHtml.substring(indexHtml.indexOf('id="mobile-upscale-dropzone"'), indexHtml.indexOf('id="mobile-upscale-preview-wrap"'));
assert(!upscaleSlice.includes('PNG, JPG, or WEBP up to 20MB'), 'File-size subtitle removed from Upscale Image dropzone');
assert(!upscaleSlice.includes('rounded-full bg-white shadow-2xs'), 'Circular top upload icon removed from Upscale Image dropzone');

// 4b. Scale label & 2x / 4x buttons
assert(indexHtml.includes('<label class="text-[12px] font-semibold text-slate-800 block">Scale</label>'), 'Label is renamed from "Upscale factor" to "Scale"');
assert(!indexHtml.includes('2x (Fast)'), 'Option simplified to "2x" (removed "(Fast)")');
assert(!indexHtml.includes('4x (Ultra HD)'), 'Option simplified to "4x" (removed "(Ultra HD)")');

// 4c. Soft tinted active pill (NO solid black)
assert(indexHtml.includes('bg-slate-100/90 border border-slate-200/80 text-slate-900 font-semibold'), 'Active scale pill uses soft tinted styling (bg-slate-100/90 border border-slate-200/80 text-slate-900 font-semibold)');
const upscaleBtnSlice = indexHtml.substring(indexHtml.indexOf('id="mobile-upscale-2x-btn"'), indexHtml.indexOf('id="mobile-upscale-2x-btn"') + 500);
assert(!upscaleBtnSlice.includes('bg-slate-900 text-white') && !upscaleBtnSlice.includes('bg-black'), 'Solid black fill (#111827 / bg-slate-900) completely removed from active scale button');

// --------------------------------------------------------------------------
// 5. Desktop UI Locked & Zero Toasts
// --------------------------------------------------------------------------
console.log('\n--- Requirement 5: Desktop Isolation & Zero Toasts ---');
assert(indexHtml.includes('@media (min-width: 768px)') && indexHtml.includes('#mobile-workspace-drawer') && indexHtml.includes('display: none !important'), 'Desktop media query strictly hides mobile workspace drawers');
assert(!indexHtml.includes('toast(') && !indexHtml.includes('showToast('), 'Zero toast popup calls in mobile workspace flow');

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
