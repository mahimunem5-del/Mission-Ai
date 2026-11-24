const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

// Let's find occurrences of selections in Creations, or mobile-creations
const terms = [
  'mobile-creations',
  'Creations',
  'mobileCreations',
  'creations-view',
  'mobile-header-creations',
  'selected',
  'ideogram-selection-bar'
];

terms.forEach(term => {
  let idx = 0;
  let count = 0;
  console.log('=== Matches for ' + term + ' ===');
  while ((idx = content.indexOf(term, idx)) !== -1 && count < 10) {
    count++;
    const line = content.slice(0, idx).split('\n').length;
    console.log('Line ' + line + ': ' + content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 80)).replace(/\r?\n/g, ' '));
    idx += term.length;
  }
});
