const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 25160-25450 ===');
for (let i = 25160; i < 25450; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
