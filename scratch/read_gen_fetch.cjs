const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(28930, 29000).map((l, i) => `${28931 + i}: ${l}`).join('\n'));
