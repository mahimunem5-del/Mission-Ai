const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('function updateMobileMultiSelectBar()');
console.log(html.substring(idx - 50, idx + 200));
