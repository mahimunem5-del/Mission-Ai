const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('<div id="ideogram-generate-controls"');
const e = dump.indexOf('<div id="ideogram-vector-illustration-controls"');
const gen = dump.substring(s, e);

const lines = gen.split('\n');
console.log('Total lines in ideogram-generate-controls:', lines.length);

// Find all labels, buttons, inputs
lines.forEach((l, i) => {
  if (l.includes('<label') || l.includes('<button') || l.includes('<textarea') || l.includes('<input') || l.includes('id="studio-') || l.includes('id="ideogram-')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
