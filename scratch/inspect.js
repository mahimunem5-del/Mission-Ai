const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

console.log('Searching for panels between 5200 and 7500:');
for (let i = 5200; i < 7500; i++) {
  const line = lines[i];
  if (line.includes('id=') && (line.includes('<aside') || line.includes('<div') || line.includes('<main') || line.includes('<section'))) {
    console.log(`${i+1}: ${line.trim()}`);
  }
}
