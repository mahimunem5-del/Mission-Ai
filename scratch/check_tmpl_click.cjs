const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = 1392488;
console.log(html.substring(idx, idx + 1500));
