const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function printRange(start, end, label) {
  console.log('=== ' + label + ' (' + start + ' - ' + end + ') ===');
  for (let i = Math.max(0, start - 1); i < Math.min(lines.length, end); i++) {
    console.log((i + 1) + ': ' + lines[i]);
  }
}

printRange(7220, 7280, 'Section 1: Creations Multi-select');
printRange(39580, 39720, 'Section 2: Mobile Template Modal around 39600');
printRange(23190, 23300, 'Template Preview JS around 23200');
