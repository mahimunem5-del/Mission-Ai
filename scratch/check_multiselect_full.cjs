const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = 2394186 - 700;
console.log(html.substring(idx, idx + 1400));
