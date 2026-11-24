const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(40605, 40640).map((l, i) => `${40606 + i}: ${l}`).join('\n'));
