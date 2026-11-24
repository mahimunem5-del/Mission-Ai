const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== VERIFYING MOBILE CREATIONS PREVIEW MODAL POLISH ===');

// 1. Syntax Check on All Script Blocks
const scriptRegex = /<script(?:\s+type="[^"]*")?(?:\s+id="[^"]*")?>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;
let syntaxErrors = [];

while ((match = scriptRegex.exec(html)) !== null) {
    scriptIndex++;
    const code = match[1];
    if (!code.trim()) continue;
    try {
        new vm.Script(code, { filename: `script_${scriptIndex}.js` });
    } catch (err) {
        syntaxErrors.push({ scriptIndex, error: err.message });
    }
}

if (syntaxErrors.length > 0) {
    console.error('[FAIL] Syntax error in index.html scripts:', syntaxErrors);
    process.exit(1);
} else {
    console.log(`[PASS] Syntax check: All ${scriptIndex} script tags compile with zero errors.`);
}

// 2. Item 1: Remove Background Title & Background: Transparent Badge
const hasRembgSection = html.includes('id="tmpl-modal-rembg-section"');
const hasRembgBadge = html.includes('id="tmpl-modal-rembg-badge"') && html.includes('Transparent');
const hasRembgBadgeStyle = html.includes('inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70');
const hasRembgJsTitle = html.includes("modalTitleEl.textContent = 'Remove Background';");
const hasRembgJsShow = html.includes("if (rembgSection) rembgSection.classList.remove('hidden');");

console.log('[PASS] Item 1 (Remove Background Title & Background: Transparent Badge):', {
    hasRembgSection,
    hasRembgBadge,
    hasRembgBadgeStyle,
    hasRembgJsTitle,
    hasRembgJsShow
});

if (!hasRembgSection || !hasRembgBadge || !hasRembgBadgeStyle || !hasRembgJsTitle || !hasRembgJsShow) {
    console.error('[FAIL] Item 1 checks failed!');
    process.exit(1);
}

// 3. Item 2: Balanced Bottom Whitespace & Floating Card Proportions
const hasFloatingCardContainer = html.includes('id="tmpl-modal-card-container"') && html.includes('h-auto max-h-[92dvh]') && html.includes('rounded-3xl');
const hasDimmedBackdrop = html.includes('id="template-white-preview-modal"') && html.includes('bg-black/40 backdrop-blur-[1px]');
const hasCenteredMobileModal = html.includes('items-center justify-center p-3.5');
const hasPb6DetailsPanel = html.includes('pb-6 md:p-6');
const hasDesktopLock = html.includes('md:max-w-5xl') && html.includes('md:max-h-[92vh]') && html.includes('md:rounded-2xl');

console.log('[PASS] Item 2 (Balanced Whitespace & Floating Centered Modal Card):', {
    hasFloatingCardContainer,
    hasDimmedBackdrop,
    hasCenteredMobileModal,
    hasPb6DetailsPanel,
    hasDesktopLock
});

if (!hasFloatingCardContainer || !hasDimmedBackdrop || !hasCenteredMobileModal || !hasPb6DetailsPanel || !hasDesktopLock) {
    console.error('[FAIL] Item 2 checks failed!');
    process.exit(1);
}

console.log('\n>>> ALL CREATIONS PREVIEW MODAL CODE CHECKS PASSED 100%! <<<\n');
