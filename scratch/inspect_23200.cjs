const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 23200; i < 23245; i++) {
  console.log((i + 1) + ': ' + lines[i]);
}
