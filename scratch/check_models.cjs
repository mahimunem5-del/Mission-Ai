const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const s = html.indexOf('<div id="image-home-model-popover"');
const e = html.indexOf('<!-- Bottom-Right Circular Send Button -->');
const section = html.slice(s, e);
const matches = [...section.matchAll(/data-model="([^"]+)"/g)].map(x => x[1]);
console.log('Matches:', matches);
