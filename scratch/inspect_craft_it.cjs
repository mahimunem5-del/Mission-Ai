const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('Craft it.');
console.log('--- Context around Craft it. ---');
console.log(html.substring(idx - 1500, idx + 500));
