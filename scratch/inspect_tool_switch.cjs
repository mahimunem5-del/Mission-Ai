const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 23040-23100 ===');
for (let i = 23035; i < 23110; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

console.log('=== LINES 24425-24480 ===');
for (let i = 24420; i < 24490; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
