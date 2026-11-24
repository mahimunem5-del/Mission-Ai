const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('--- 4850 to 4880 ---');
console.log(lines.slice(4849, 4880).map((l, i) => `${4850 + i}: ${l}`).join('\n'));

console.log('--- 24500 to 24535 ---');
console.log(lines.slice(24499, 24535).map((l, i) => `${24500 + i}: ${l}`).join('\n'));
