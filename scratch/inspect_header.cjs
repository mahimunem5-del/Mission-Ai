const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Let's inspect ideogram-header-generate and ideogram-header-edit
const hStart = html.indexOf('<aside id="ideogram-left-panel"');
const hEnd = html.indexOf('<!-- Left Panel Footer', hStart) !== -1 ? html.indexOf('<!-- Left Panel Footer', hStart) : html.indexOf('</aside>', hStart);
console.log('Left panel slice length:', hEnd - hStart);

// Let's check header generate area
console.log('=== HEADER GENERATE ===');
console.log(html.substring(html.indexOf('<div id="ideogram-header-generate"'), html.indexOf('<div id="ideogram-generate-controls"')));

