const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace all occurrences of Nano Banana Pro (Gemini 3 Pro Image) with Nano Banana Pro
html = html.replaceAll('Nano Banana Pro (Gemini 3 Pro Image)', 'Nano Banana Pro');
html = html.replaceAll('Nano Banana 2 (Gemini 3.1 Flash Image)', 'Nano Banana 2');

// In studio-ratio-dropdown, replace all parentheticals
// Let's find studio-ratio-dropdown specifically
const rIdx = html.indexOf('id="studio-ratio-dropdown"');
const reIdx = html.indexOf('id="studio-count-btn"');
if (rIdx !== -1 && reIdx !== -1) {
    let rBlock = html.substring(rIdx, reIdx);
    rBlock = rBlock.replaceAll(' (AI decides)', '');
    rBlock = rBlock.replaceAll(' (Square)', '');
    rBlock = rBlock.replaceAll(' (Portrait)', '');
    rBlock = rBlock.replaceAll(' (Mobile)', '');
    rBlock = rBlock.replaceAll(' (Landscape)', '');
    rBlock = rBlock.replaceAll(' (Widescreen)', '');
    html = html.substring(0, rIdx) + rBlock + html.substring(reIdx);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed replacements in index.html');
