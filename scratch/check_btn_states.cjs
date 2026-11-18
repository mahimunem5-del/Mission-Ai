const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('=== LINES 24540-24570 (Precise Edit Button State) ===');
for (let i = 24540; i < 24570; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

console.log('=== LINES 23280-23315 (Remove BG Button State) ===');
for (let i = 23280; i < 23315; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
