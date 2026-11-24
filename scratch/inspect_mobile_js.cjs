const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 39614; i < 39850; i++) {
  console.log((i + 1) + ': ' + lines[i]);
}
