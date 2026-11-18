const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('ideogram-asset-groups-feed', idx)) !== -1) {
  const line = html.substring(0, idx).split('\n').length;
  console.log(`Line ${line}:`);
  console.log(html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 300)));
  console.log('----------------------------------------------------');
  idx += 26;
}
