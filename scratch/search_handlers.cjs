const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const terms = [
  'mobile-result-multiselect-bar',
  'mobileSelectedImageIds',
  'mobile-multiselect-count',
  'mobile-multiselect-delete-btn',
  'mobile-multiselect-download-btn',
  'mobile-multiselect-deselect-btn',
  'mobile-image-prompt-input',
  'mobile-image-submit-btn',
  'mobile-image-attach-btn',
  'mobile-image-mic-btn'
];

terms.forEach(term => {
  let idx = 0;
  let count = 0;
  console.log('=== Matches for ' + term + ' ===');
  while ((idx = content.indexOf(term, idx)) !== -1 && count < 8) {
    count++;
    const line = content.slice(0, idx).split('\n').length;
    console.log('Line ' + line + ': ' + content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 80)).replace(/\r?\n/g, ' '));
    idx += term.length;
  }
});
