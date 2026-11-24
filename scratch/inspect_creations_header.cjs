const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('--- Lines 40070 to 40140 ---');
console.log(lines.slice(40070, 40140).map((l, i) => `${40071 + i}: ${l}`).join('\n'));

console.log('--- Lines 41750 to 41850 ---');
console.log(lines.slice(41750, 41850).map((l, i) => `${41751 + i}: ${l}`).join('\n'));
