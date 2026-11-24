const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(40760, 40840).map((l, i) => `${40761 + i}: ${l}`).join('\n'));
