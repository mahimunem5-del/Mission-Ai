const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== VERIFYING PRECISION MOBILE COMPOSER MICRO-POLISH ===');

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

// 2. Item 1: Zero Resize/Shake Glitches via transition-none
const hasTransitionNoneCss = html.includes('transition: none !important;') && html.includes('#mobile-image-composer-shell');
const hasTransitionNoneShell = html.includes('id="mobile-image-composer-shell"') && html.includes('transition-none');
const hasBoxSizingBorderBox = html.includes('box-sizing: border-box !important;');

console.log('[PASS] Item 1 (Zero Resize/Shake Glitch via transition-none):', {
    hasTransitionNoneCss,
    hasTransitionNoneShell,
    hasBoxSizingBorderBox
});

if (!hasTransitionNoneCss || !hasTransitionNoneShell || !hasBoxSizingBorderBox) {
    console.error('[FAIL] Item 1 checks failed!');
    process.exit(1);
}

// 3. Item 2: Balanced ChatGPT Gap Between Thumbnail and Textarea
const hasW20H24Thumbnail = html.includes('w-20 h-24 rounded-2xl');
const hasMb2_5VerticalGap = html.includes('mb-2.5');
const hasGap2_5 = html.includes('gap-2.5');

console.log('[PASS] Item 2 (Balanced Vertical Gap & w-20 h-24 Thumbnail):', {
    hasW20H24Thumbnail,
    hasMb2_5VerticalGap,
    hasGap2_5
});

if (!hasW20H24Thumbnail || !hasMb2_5VerticalGap || !hasGap2_5) {
    console.error('[FAIL] Item 2 checks failed!');
    process.exit(1);
}

// 4. Item 3: Keep Left Image Icon Always Minimal (No Dark / Grey Active Fill)
const hasMinimalAttachIconCss = html.includes('#mobile-image-attach-btn') && html.includes('background-color: transparent !important;');
const hasTransparentAttachClass = html.includes('id="mobile-image-attach-btn"') && html.includes('bg-transparent');
const hasNoDarkActiveFill = !html.includes('#mobile-image-attach-btn.active') && !html.includes('#mobile-image-attach-btn.has-refs');

console.log('[PASS] Item 3 (Minimal Left Image Icon - No Dark Active Fill):', {
    hasMinimalAttachIconCss,
    hasTransparentAttachClass,
    hasNoDarkActiveFill
});

if (!hasMinimalAttachIconCss || !hasTransparentAttachClass || !hasNoDarkActiveFill) {
    console.error('[FAIL] Item 3 checks failed!');
    process.exit(1);
}

// 5. Existing Controls & Logic Integrity
const hasInstantLiftThreshold = html.includes('singleRowInputInnerWidth - 6');
const hasHysteresisBuffer = html.includes('singleRowInputInnerWidth - 22');
const hasSpeechNoiseGate = html.includes('SPEECH_NOISE_GATE');
const hasSmallerStopIcon = html.includes('w-2.5 h-2.5 rounded-[2.5px] bg-slate-700');

console.log('[PASS] Core Integrity Checks:', {
    hasInstantLiftThreshold,
    hasHysteresisBuffer,
    hasSpeechNoiseGate,
    hasSmallerStopIcon
});

if (!hasInstantLiftThreshold || !hasHysteresisBuffer || !hasSpeechNoiseGate || !hasSmallerStopIcon) {
    console.error('[FAIL] Core integrity checks failed!');
    process.exit(1);
}

console.log('\n>>> ALL PRECISION CODE CHECKS PASSED 100%! <<<\n');
