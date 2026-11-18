const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Let's check lines 25240-25400 and placeholder cards around 23340, 23660, 24680
console.log('=== FINDING RIGHT CANVAS FEED HEADERS ===');

function printRange(s, e) {
  const lines = html.substring(s, e).split('\n');
  lines.forEach((l, idx) => console.log(l));
}

let idx = 0;
while ((idx = html.indexOf('group-prompt-title', idx)) !== -1) {
  const line = html.substring(0, idx).split('\n').length;
  console.log(`group-prompt-title at line ${line}`);
  idx += 18;
}
