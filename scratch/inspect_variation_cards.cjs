const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 25450-25650 ===');
for (let i = 25450; i < 25650; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
