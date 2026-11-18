const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 26240-26320 ===');
for (let i = 26240; i < 26320; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
