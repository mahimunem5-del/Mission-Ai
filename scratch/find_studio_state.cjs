const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (l.includes('const imageStudioState') || l.includes('let imageStudioState') || l.includes('var imageStudioState')) {
    console.log(`${idx + 1}: ${l.trim()}`);
  }
});
