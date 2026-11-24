const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [];
let idx = 0;
while ((idx = html.indexOf('pointer-events-none', idx)) !== -1) {
    const start = Math.max(0, idx - 60);
    const end = Math.min(html.length, idx + 100);
    matches.push(html.substring(start, end).replace(/\s+/g, ' '));
    idx += 19;
}
console.log('pointer-events-none matches inside index.html:', matches.slice(0, 10));
