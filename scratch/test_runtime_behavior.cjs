const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

// Parse DOM with JSDOM, but don't run external resources
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost:3000/'
});

const { window } = dom;
const { document } = window;

let allPassed = true;
function check(name, condition, details = '') {
    if (condition) {
        console.log(`  [PASS] ${name}`);
    } else {
        console.error(`  [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
        allPassed = false;
    }
}

console.log('================================================================');
console.log('TESTING RUNTIME DYNAMIC BEHAVIOR IN SIMULATED DOM');
console.log('================================================================');

// 1. Initial State of Hero Aspect Ratio and Model Selector
const ratioBtn = document.getElementById('image-home-ratio-btn');
const ratioLabel = document.getElementById('image-home-ratio-label');
const ratioIcon = document.getElementById('image-home-ratio-icon');

const modelBtn = document.getElementById('image-home-model-btn');
const modelLabel = document.getElementById('image-home-model-label');
const modelIcon = document.getElementById('image-home-model-icon');

check('Hero ratio label starts at 1:1', ratioLabel && ratioLabel.textContent === '1:1', ratioLabel?.textContent);
check('Hero ratio icon contains wireframe square', ratioIcon && ratioIcon.innerHTML.includes('studio-ratio-wireframe'));
check('Hero model label starts at Auto', modelLabel && modelLabel.textContent === 'Auto', modelLabel?.textContent);
check('Hero model icon starts hidden', modelIcon && modelIcon.classList.contains('hidden'));

// 2. Select 9:16 ratio
const opt916 = document.querySelector('#image-home-ratio-popover [data-ratio="9:16"]');
if (opt916) {
    opt916.click();
    check('Clicking 9:16 updates ratio label to 9:16', ratioLabel.textContent === '9:16', ratioLabel.textContent);
    check('Clicking 9:16 updates ratio icon to 9:16 wireframe (w-[9px] h-[16px])', ratioIcon.innerHTML.includes('w-[9px] h-[16px]'));
} else {
    check('Option 9:16 found in popover', false);
}

// 3. Select 16:9 ratio
const opt169 = document.querySelector('#image-home-ratio-popover [data-ratio="16:9"]');
if (opt169) {
    opt169.click();
    check('Clicking 16:9 updates ratio label to 16:9', ratioLabel.textContent === '16:9', ratioLabel.textContent);
    check('Clicking 16:9 updates ratio icon to 16:9 wireframe (w-[16px] h-[9px])', ratioIcon.innerHTML.includes('w-[16px] h-[9px]'));
}

// 4. Select 1:1 ratio
const opt11 = document.querySelector('#image-home-ratio-popover [data-ratio="1:1"]');
if (opt11) {
    opt11.click();
    check('Clicking 1:1 updates ratio label back to 1:1', ratioLabel.textContent === '1:1', ratioLabel.textContent);
    check('Clicking 1:1 restores 1:1 wireframe square', ratioIcon.innerHTML.includes('w-3.5 h-3.5 border-1.5'));
}

// 5. Select FLUX.2 Pro model
const optFlux = document.querySelector('#image-home-model-popover [data-model="black-forest-labs/flux.2-pro"]');
if (optFlux) {
    optFlux.click();
    check('Clicking FLUX.2 Pro updates model label to "FLUX.2 Pro"', modelLabel.textContent === 'FLUX.2 Pro', modelLabel.textContent);
    check('Model icon is now visible', !modelIcon.classList.contains('hidden'));
    check('Model icon contains SVG', modelIcon.innerHTML.includes('<svg'));
} else {
    check('Option FLUX.2 Pro found in popover', false);
}

// 6. Select Nano Banana Pro model
const optBanana = document.querySelector('#image-home-model-popover [data-model="google/gemini-3-pro-image"]');
if (optBanana) {
    optBanana.click();
    check('Clicking Nano Banana Pro updates model label to "Nano Banana Pro"', modelLabel.textContent === 'Nano Banana Pro', modelLabel.textContent);
    check('Model icon is visible', !modelIcon.classList.contains('hidden'));
}

// 7. Select Auto model
const optAuto = document.querySelector('#image-home-model-popover [data-model="auto"]');
if (optAuto) {
    optAuto.click();
    check('Clicking Auto resets model label to "Auto"', modelLabel.textContent === 'Auto', modelLabel.textContent);
    check('Model icon is hidden when Auto', modelIcon.classList.contains('hidden'));
}

console.log('================================================================');
if (allPassed) {
    console.log('ALL RUNTIME DYNAMIC BEHAVIOR TESTS PASSED (100%)!');
} else {
    console.error('SOME RUNTIME TESTS FAILED!');
}
console.log('================================================================');
process.exit(allPassed ? 0 : 1);
