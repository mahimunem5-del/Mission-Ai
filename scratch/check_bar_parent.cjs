const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('id="mobile-result-multiselect-bar"');
console.log(html.substring(Math.max(0, idx - 400), idx + 200));
