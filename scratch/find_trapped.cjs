const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const needle = 'bodyHtml';
let idx = 0;
while ((idx = html.indexOf(needle, idx)) !== -1) {
    console.log('bodyHtml at:', idx);
    console.log(html.slice(idx - 50, idx + 200));
    console.log('---');
    idx += needle.length;
}
