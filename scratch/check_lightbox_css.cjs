const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('#mobile-composer-ref-lightbox');
console.log(html.substring(Math.max(0, idx - 100), idx + 200));
