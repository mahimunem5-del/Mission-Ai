const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (l.includes('studioPreciseEditState') || (l.toLowerCase().includes('mask') && l.includes('precise'))) {
    console.log(`${idx + 1}: ${l.trim().slice(0, 100)}`);
  }
});
