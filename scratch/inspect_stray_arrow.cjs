const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxComp = html.indexOf('id="mobile-image-composer-container"');
const endComp = html.indexOf('<!-- Atmospheric Studio Backdrop', idxComp);
const composerSection = html.substring(idxComp, endComp);

console.log('=== COMPOSER FULL SECTION ===');
console.log(composerSection);
