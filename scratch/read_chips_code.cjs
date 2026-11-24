const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function renderMobileComposerRefChips()');
console.log(html.substring(idx, idx + 2500));
