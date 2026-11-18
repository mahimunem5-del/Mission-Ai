const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 25235-25395 ===');
for (let i = 25235; i < 25395; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
