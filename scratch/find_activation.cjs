const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [];
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('image-home-active') || l.includes('image-home-view') || l.includes('setMobileWorkspaceView')) {
    matches.push(`${idx + 1}: ${l.trim().slice(0, 100)}`);
  }
});
console.log('Matches:');
console.log(matches.slice(0, 30).join('\n'));
