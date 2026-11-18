const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 24655; i < 24685; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
