const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('+ Add', idx)) !== -1) {
  const line = html.substring(0, idx).split('\n').length;
  console.log(`+ Add at line ${line}:`);
  console.log(html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 100)));
  idx += 5;
}
