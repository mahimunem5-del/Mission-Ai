const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(40660, 40680).map((l, i) => `${40661 + i}: ${l}`).join('\n'));
