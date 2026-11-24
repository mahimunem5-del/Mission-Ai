const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function openMobileComposerRefLightbox');
console.log('--- JS Function ---');
console.log(html.substring(idx, idx + 800));

const htmlIdx = html.indexOf('id="mobile-composer-ref-lightbox"');
console.log('\n--- HTML Markup ---');
console.log(html.substring(htmlIdx - 100, htmlIdx + 1200));
