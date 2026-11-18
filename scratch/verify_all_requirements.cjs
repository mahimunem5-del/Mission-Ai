const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

let allPassed = true;
function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
    } else {
        console.error(`[FAIL] ${message}`);
        allPassed = false;
    }
}

console.log('=== VERIFYING IMAGE STUDIO HERO PROMPT BOX & DROPDOWNS ===\n');

// 1. Ratio button in Hero box
const ratioBtnMatch = html.match(/id="image-home-ratio-btn"[^>]*>([\s\S]*?)<\/button>/);
assert(ratioBtnMatch !== null, 'image-home-ratio-btn exists');
if (ratioBtnMatch) {
    const ratioBtnContent = ratioBtnMatch[1];
    const hasChevron = ratioBtnContent.includes('m6 9 6 6 6-6') || ratioBtnContent.includes('chevron');
    assert(!hasChevron, 'image-home-ratio-btn has NO dropdown chevron');
    assert(html.includes('id="image-home-ratio-label">1:1</span>') || html.includes('id="image-home-ratio-label" class="font-medium">1:1</span>'), 'image-home-ratio-label defaults to 1:1');
    assert(ratioBtnMatch[0].includes('border-neutral-200/80') || ratioBtnMatch[0].includes('border-neutral-200'), 'image-home-ratio-btn has subtle bordered styling');
}

// 2. Count button in Hero box
const countBtnMatch = html.match(/id="image-home-count-btn"[^>]*>([\s\S]*?)<\/button>/);
assert(countBtnMatch !== null, 'image-home-count-btn exists');
if (countBtnMatch) {
    const countBtnContent = countBtnMatch[1];
    const hasChevron = countBtnContent.includes('m6 9 6 6 6-6') || countBtnContent.includes('chevron');
    assert(!hasChevron, 'image-home-count-btn has NO dropdown chevron');
    assert(html.includes('id="image-home-count-label">1</span>'), 'image-home-count-label defaults to 1');
    assert(countBtnMatch[0].includes('border-neutral-200/80') || countBtnMatch[0].includes('border-neutral-200'), 'image-home-count-btn has subtle bordered styling');
}

// 3. Model button in Hero box
const modelBtnMatch = html.match(/id="image-home-model-btn"[^>]*>([\s\S]*?)<\/button>/);
assert(modelBtnMatch !== null, 'image-home-model-btn exists');
if (modelBtnMatch) {
    const modelBtnContent = modelBtnMatch[1];
    const hasChevron = modelBtnContent.includes('m6 9 6 6 6-6');
    assert(hasChevron, 'image-home-model-btn HAS dropdown chevron');
    assert(html.includes('id="image-home-model-label">Auto</span>'), 'image-home-model-label defaults to Auto');
    // Check it does NOT have border
    const classMatch = modelBtnMatch[0].match(/class="([^"]*)"/);
    const hasBorder = classMatch && classMatch[1].split(' ').some(c => c === 'border' || c.startsWith('border-'));
    assert(!hasBorder, 'image-home-model-btn is plain and borderless');
}

// 4. Layout positioning: Ratio and Count on left side, Model and Send on right side
const row3Start = html.indexOf('<!-- Row 3: Bottom Bar');
const row3End = html.indexOf('<!-- Creative Workflows Bento Grid Section -->');
const row3Section = html.slice(row3Start, row3End);

const ratioPos = row3Section.indexOf('id="image-home-ratio-wrapper"');
const countPos = row3Section.indexOf('id="image-home-count-wrapper"');
const modelPos = row3Section.indexOf('id="image-home-model-wrapper"');
const submitPos = row3Section.indexOf('id="image-home-submit-btn"');

assert(ratioPos !== -1 && countPos !== -1 && modelPos !== -1 && submitPos !== -1, 'All 4 controls present in Row 3');
assert(ratioPos < countPos, 'Ratio is before Count on the left');
assert(countPos < modelPos, 'Count is before Model');
assert(modelPos < submitPos, 'Model is directly left of Send button on the right');

// 5. Popover widths
assert(html.includes('id="image-home-ratio-popover"') && html.includes('min-w-[104px]'), 'image-home-ratio-popover has min-w-[104px]');
assert(html.includes('id="image-home-count-popover"') && html.includes('min-w-[76px]'), 'image-home-count-popover has min-w-[76px]');
assert(html.includes('id="image-home-model-popover"') && html.includes('min-w-[180px]') && html.includes('right-0'), 'image-home-model-popover has min-w-[180px] right-0');

// 6. Functional wiring: variables and handlers
assert(html.includes('let imageHomeSelectedCount = 1;'), 'imageHomeSelectedCount variable initialized to 1');
assert(html.includes('function syncHomeCountDisplay'), 'syncHomeCountDisplay function defined');
assert(html.includes('count: activeCount,') && html.includes('imageCount: activeCount,'), 'submitHomePrompt passes count and imageCount');
assert(html.includes('if (options.count || options.imageCount)'), 'setImageStudioMode handles count/imageCount');
assert(html.includes('function syncStudioRatioDropdown'), 'syncStudioRatioDropdown function defined');

// 7. Verify dynamic ratio sync in studio
assert(html.includes('syncStudioRatioDropdown(options.aspectRatio)'), 'setImageStudioMode calls syncStudioRatioDropdown');
assert(html.includes('syncStudioRatioDropdown(ratio)'), 'studio ratio option click calls syncStudioRatioDropdown');

// 8. Verify clean labels and model names
assert(!html.includes('1:1 (Square)'), 'Parenthetical (Square) removed');
assert(!html.includes('16:9 (Landscape)'), 'Parenthetical (Landscape) removed');
assert(!html.includes('9:16 (Mobile)'), 'Parenthetical (Mobile) removed');
assert(!html.includes('Nano Banana Pro (Gemini 3 Pro Image)'), 'Long model name cleaned to Nano Banana Pro');
assert(!html.includes('Nano Banana 2 (Gemini 3.1 Flash Image)'), 'Long model name cleaned to Nano Banana 2');

console.log(`\nALL VERIFICATION CHECKS: ${allPassed ? 'PASSED' : 'FAILED'}`);
if (!allPassed) process.exit(1);
