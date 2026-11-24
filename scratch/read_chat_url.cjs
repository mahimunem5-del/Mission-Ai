const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(20025, 20050).map((l, i) => `${20026 + i}: ${l}`).join('\n'));
