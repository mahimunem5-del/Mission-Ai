const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [...html.matchAll(/#mobile-workspace-drawer/g)];
console.log('Matches for #mobile-workspace-drawer:');
matches.forEach(m => {
  console.log('Pos', m.index, ':\n', html.substring(Math.max(0, m.index - 80), Math.min(html.length, m.index + 120)).replace(/\n/g, ' '));
});
