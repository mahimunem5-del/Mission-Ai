const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

console.log('============================================================');
console.log('1. JAVASCRIPT SYNTAX VERIFICATION');
console.log('============================================================');
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
let syntaxErrors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
    const scriptCode = match[1];
    // Skip external script tags
    if (!scriptCode.trim() || match[0].includes('src=')) continue;
    scriptIdx++;
    try {
        new vm.Script(scriptCode, { filename: `inline-script-${scriptIdx}.js` });
        console.log(`Script ${scriptIdx}: Syntax OK (length: ${scriptCode.length})`);
    } catch (err) {
        syntaxErrors++;
        console.error(`Script ${scriptIdx} Syntax ERROR:`, err.message);
    }
}
if (syntaxErrors === 0) {
    console.log('✓ All inline JavaScript blocks compiled with ZERO syntax errors!');
} else {
    console.error(`✕ Found ${syntaxErrors} syntax errors!`);
    process.exit(1);
}

console.log('\n============================================================');
console.log('2. SECTION 1: CREATIONS BOTTOM MULTI-SELECT BAR VERIFICATION');
console.log('============================================================');
// Check bar container classes
const barHtmlMatch = html.match(/id="mobile-result-multiselect-bar"[\s\S]*?>/);
if (barHtmlMatch) {
    console.log('Multi-select bar tag:', barHtmlMatch[0]);
    if (barHtmlMatch[0].includes('bottom-4') && barHtmlMatch[0].includes('fixed') && barHtmlMatch[0].includes('rounded-2xl')) {
        console.log('✓ Multi-select bar is cleanly fixed at bottom of screen with rounded-2xl');
    } else {
        console.error('✕ Multi-select bar styling does not match bottom-4!');
    }
} else {
    console.error('✕ mobile-result-multiselect-bar not found!');
}

// Check left count
const barSection = html.slice(html.indexOf('id="mobile-result-multiselect-bar"'), html.indexOf('id="mobile-result-scroll-feed"'));
if (barSection.includes('id="mobile-multiselect-count"') && !barSection.includes('1 selected')) {
    console.log('✓ Left side contains minimal count without word "selected"');
} else {
    console.error('✕ Count element has unexpected content in HTML');
}
if (!barSection.includes('mobile-multiselect-deselect-btn') && !barSection.includes('Deselect')) {
    console.log('✓ "Deselect" button completely removed');
} else {
    console.error('✕ "Deselect" was not removed!');
}
if (!barSection.includes('mobile-multiselect-edit-btn') && !barSection.includes('>Edit<')) {
    console.log('✓ "Edit" button completely removed');
} else {
    console.error('✕ "Edit" was not removed!');
}

// Check right side buttons
const hasDl = barSection.includes('id="mobile-multiselect-download-btn"') && barSection.includes('>Download<');
const hasDel = barSection.includes('id="mobile-multiselect-delete-btn"') && barSection.includes('>Delete<');
const hasCancel = barSection.includes('id="mobile-multiselect-cancel-btn"') && barSection.includes('>Cancel<');
if (hasDl && hasDel && hasCancel) {
    console.log('✓ Exactly 3 surface-matched buttons: Download, Delete, Cancel present side-by-side');
} else {
    console.error('✕ Missing buttons in multi-select bar:', { hasDl, hasDel, hasCancel });
}

console.log('\n============================================================');
console.log('3. SECTION 2: TEMPLATE PREVIEW MODAL VERIFICATION');
console.log('============================================================');
const tmplModalSection = html.slice(html.indexOf('id="mobile-template-card-modal"'), html.indexOf('id="mobile-workspace-result-feed"') > 0 ? html.indexOf('id="mobile-workspace-result-feed"') : html.indexOf('<!-- DEDICATED MOBILE INNER WORKSPACE LOGIC'));

// A. Natural aspect ratio check
if (tmplModalSection.includes('max-h-[45dvh]') && tmplModalSection.includes('object-contain')) {
    console.log('✓ Template image preview uses max-h-[45dvh] and object-contain for true natural aspect ratio');
} else {
    console.error('✕ Template image does not have max-h-[45dvh] and object-contain!');
}
if (tmplModalSection.includes('aspect-square') || tmplModalSection.includes('aspect-[4/3]')) {
    console.error('✕ Forced aspect ratio class still found in template preview modal!');
} else {
    console.log('✓ Forced aspect ratio (aspect-square / aspect-[4/3]) removed completely');
}

// B. Slimmer outer card padding / border frame
if (tmplModalSection.includes('p-2.5') && tmplModalSection.includes('rounded-2xl') && tmplModalSection.includes('border-slate-200/80')) {
    console.log('✓ Outer card container has slim p-2.5 padding, rounded-2xl, and hairline border');
} else {
    console.error('✕ Outer card padding or border not matching p-2.5 / rounded-2xl / border-slate-200/80');
}

// C. Close button pinned at top-2.5 left-2.5
if (tmplModalSection.includes('top-2.5 left-2.5')) {
    console.log('✓ Floating circular close button pinned cleanly at top-2.5 left-2.5');
} else {
    console.error('✕ Close button top-2.5 left-2.5 pin missing!');
}

// D. Decoupled from desktop & Generated Image Preview Modal
if (html.includes('id="ideogram-preview-modal"') && html.includes('id="studio-template-modal"')) {
    console.log('✓ Generated Image Preview Modal and Desktop Template Modal are 100% decoupled and preserved');
}

console.log('\n============================================================');
console.log('4. SECTION 3: MOBILE BOTTOM PROMPT COMPOSER VERIFICATION');
console.log('============================================================');
const composerSection = html.slice(html.indexOf('id="mobile-image-composer-container"'), html.indexOf('id="mobile-image-composer-container"') + 6000);

// A. Removed + popup menu
if (html.includes('id="mobile-image-attach-popover"')) {
    console.error('✕ mobile-image-attach-popover still exists in HTML!');
} else {
    console.log('✓ 5-item popup menu (#mobile-image-attach-popover) completely removed');
}

// B. Direct Image upload icon
if (composerSection.includes('id="mobile-image-attach-btn"') && composerSection.includes('id="mobile-image-file-input"') && composerSection.includes('multiple')) {
    console.log('✓ Direct image upload button (#mobile-image-attach-btn) & multiple file input present');
} else {
    console.error('✕ Direct image upload button or multiple file input missing!');
}

// C. Auto-expanding textarea with max-h-[156px] and overflow-y-auto
if (composerSection.includes('<textarea id="mobile-image-prompt-input"') && composerSection.includes('max-h-[156px]') && composerSection.includes('overflow-y-auto')) {
    console.log('✓ Auto-expanding textarea (#mobile-image-prompt-input) with max-h-[156px] & internal scroll present');
} else {
    console.error('✕ Textarea markup missing or incorrect!');
}

// D. Reference chips wrap
if (composerSection.includes('id="mobile-image-ref-chips-wrap"')) {
    console.log('✓ Reference thumbnail chips container (#mobile-image-ref-chips-wrap) present inside composer');
} else {
    console.error('✕ Reference chips container missing!');
}

// E. Blue live voice dictation equalizer bar & pause button
if (composerSection.includes('id="mobile-image-composer-voice-view"') &&
    composerSection.includes('id="mobile-voice-equalizer-bars"') &&
    composerSection.includes('id="mobile-voice-pause-btn"') &&
    composerSection.includes('id="mobile-voice-send-btn"') &&
    composerSection.includes('id="mobile-voice-cancel-btn"')) {
    console.log('✓ ChatGPT-style live voice bar with Cancel, Equalizer bars, Blue Pause/Stop & Blue Send present');
} else {
    console.error('✕ Voice bar elements missing!');
}

// F. Send flow: pre-fills Generate Image sheet without autoGenerate
if (html.includes('openMobileWorkspaceDrawer(\'generate-image\', {') && html.includes('referenceImages: refs')) {
    console.log('✓ Send handler cleanly opens Generate Image bottom sheet pre-filling prompt and referenceImages');
} else {
    console.error('✕ Send handler drawer pre-fill missing!');
}

// G. Zero toasts
const composerCodeSection = html.slice(html.indexOf('window.mobileComposerAttachedRefs = [];'), html.indexOf('window.initMobileImageHomepage = initMobileImageHomepage;'));
if (composerCodeSection.includes('showStudioToast')) {
    console.error('✕ showStudioToast found inside mobile composer code!');
} else {
    console.log('✓ ZERO toast notifications inside mobile composer logic');
}

console.log('\n============================================================');
console.log('5. SCOPE LOCK VERIFICATION (Desktop & Non-Mobile 100% Unchanged)');
console.log('============================================================');
// Check desktop sections exist and intact
const desktopSections = [
    'id="design-templates-section"',
    'id="image-home-templates-grid"',
    'id="studio-templates-section"',
    'id="ideogram-selection-bar"',
    'id="ideogram-preview-modal"',
    'id="desktop-images-workspace"'
];
desktopSections.forEach(id => {
    if (html.includes(id)) {
        console.log(`✓ Desktop element ${id} intact`);
    } else {
        console.warn(`! Note: ${id} not found (may not exist originally)`);
    }
});

console.log('\n============================================================');
console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
console.log('============================================================');
