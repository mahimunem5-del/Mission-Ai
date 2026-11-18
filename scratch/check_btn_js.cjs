const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const btnIds = [
  'btn-do-remove-bg',
  'studio-apply-precise-edit-btn',
  'upscaleSubmitBtn'
];

btnIds.forEach(id => {
  let idx = 0;
  console.log(`=== Matches for ${id} ===`);
  while ((idx = html.indexOf(id, idx)) !== -1) {
    const line = html.substring(0, idx).split('\n').length;
    console.log(`Line ${line}:`);
    console.log(html.substring(Math.max(0, idx - 40), Math.min(html.length, idx + 160)).replace(/\n/g, ' '));
    idx += id.length;
  }
});
