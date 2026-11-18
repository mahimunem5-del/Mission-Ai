const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 6920; i < 6960; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
