const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(41700, 41740).map((l, i) => `${41701 + i}: ${l}`).join('\n'));
