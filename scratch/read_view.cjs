const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(40635, 40666).map((l, i) => `${40636 + i}: ${l}`).join('\n'));
