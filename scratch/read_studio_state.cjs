const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(22550, 22590).map((l, i) => `${22551 + i}: ${l}`).join('\n'));
