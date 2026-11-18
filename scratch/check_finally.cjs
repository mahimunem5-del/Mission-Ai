const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('finally {');
let idx = s;
while (idx !== -1) {
  const line = html.substring(0, idx).split('\n').length;
  if (line > 23400 && line < 23600) {
    console.log(`finally at line ${line}:`);
    console.log(html.substring(idx, idx + 800));
  }
  idx = html.indexOf('finally {', idx + 10);
}
