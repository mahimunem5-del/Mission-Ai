const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 23300-23400 ===');
for (let i = 23300; i < 23400; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
