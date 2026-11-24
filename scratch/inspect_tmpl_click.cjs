const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 21480; i < 21535; i++) {
  console.log((i + 1) + ': ' + lines[i]);
}
