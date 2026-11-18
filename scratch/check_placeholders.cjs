const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const placeholders = [
  'remove-bg-in-progress-card',
  'upscale-in-progress-card',
  'precise-edit-in-progress-card',
  'ideogram-in-progress-card'
];

placeholders.forEach(id => {
  let idx = 0;
  while ((idx = html.indexOf(id, idx)) !== -1) {
    const line = html.substring(0, idx).split('\n').length;
    console.log(`=== ${id} at line ${line} ===`);
    console.log(html.substring(idx - 50, Math.min(html.length, idx + 400)));
    idx += id.length;
  }
});
