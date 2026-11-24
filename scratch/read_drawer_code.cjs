const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== Lines 40675-40760 ===');
console.log(lines.slice(40674, 40760).map((l, i) => `${40675 + i}: ${l}`).join('\n'));

console.log('=== Lines 40760-40850 ===');
console.log(lines.slice(40759, 40850).map((l, i) => `${40760 + i}: ${l}`).join('\n'));

console.log('=== Lines 41770-41880 ===');
console.log(lines.slice(41769, 41880).map((l, i) => `${41770 + i}: ${l}`).join('\n'));
