const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const lines = content.split('\n');
console.log(`=== Lines 31500 to 31535 ===`);
for (let i = 31500 - 1; i < 31535 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
