const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');
const lines = dump.split('\n');

for (let i = 0; i < 70; i++) {
  console.log(lines[i]);
}
