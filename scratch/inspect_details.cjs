const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function printRange(start, end, label) {
  console.log('=== ' + label + ' (' + start + ' - ' + end + ') ===');
  for (let i = Math.max(0, start - 1); i < Math.min(lines.length, end); i++) {
    console.log((i + 1) + ': ' + lines[i]);
  }
}

printRange(40610, 40665, 'MultiSelect Bar Logic');
printRange(41130, 41170, 'MultiSelect Bar Event Listeners');
printRange(21525, 21790, 'Mobile Composer Bar JS Logic');
