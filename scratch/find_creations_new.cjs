const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

// Search for '+ New' or '+ new' or Creations header
const matches = [];
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('+ New') || line.includes('+ new') || (line.toLowerCase().includes('creations') && line.includes('header'))) {
    matches.push({ line: idx + 1, text: line.trim() });
  }
});

console.log('Matches:', matches);
