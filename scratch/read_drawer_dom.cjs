const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log(lines.slice(39685, 39715).map((l, i) => `${39686 + i}: ${l}`).join('\n'));
