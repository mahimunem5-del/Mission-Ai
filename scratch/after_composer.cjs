const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxComposer = html.indexOf('id="mobile-image-composer-container"');
const closingComposer = html.indexOf('</div>', idxComposer + 500); // find the end of mobile composer container
console.log('After composer:');
console.log(html.substring(closingComposer, closingComposer + 2000));
