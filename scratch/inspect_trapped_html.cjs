const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startTarget = '<div>${bodyHtml}</div>';
const startIdx = html.indexOf(startTarget);

const endTarget = 'const blob = new Blob';
const endIdx = html.indexOf(endTarget);

console.log('startIdx:', startIdx);
console.log('endIdx:', endIdx);

const trappedHtml = html.slice(startIdx + startTarget.length, endIdx);
console.log('Length of trapped HTML:', trappedHtml.length);
console.log('--- Trapped HTML preview (first 500 chars) ---');
console.log(trappedHtml.slice(0, 500));
console.log('--- Trapped HTML end preview (last 500 chars) ---');
console.log(trappedHtml.slice(-500));
