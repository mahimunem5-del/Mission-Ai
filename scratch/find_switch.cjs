const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [];
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('switchWorkspace(') || l.includes('switchWorkspace =')) {
    matches.push(`${idx + 1}: ${l.trim().slice(0, 100)}`);
  }
});
console.log('switchWorkspace matches:');
console.log(matches.join('\n'));
