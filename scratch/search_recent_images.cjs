const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = content.indexOf('STUDIO_RECENT_IMAGES', idx)) !== -1) {
  const line = content.slice(0, idx).split('\n').length;
  console.log(`Line ${line}: ` + content.slice(idx, idx + 80).replace(/\r?\n/g, ' '));
  idx += 20;
}
