const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const lines = content.split('\n');
console.log(`=== Lines 22840 to 22900 ===`);
for (let i = 22840 - 1; i < 22900 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
