const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = 2457331 - 200;
console.log(html.substring(idx, idx + 1500));
