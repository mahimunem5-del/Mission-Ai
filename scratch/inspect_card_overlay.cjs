const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 25515-25575 ===');
for (let i = 25515; i < 25575; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
