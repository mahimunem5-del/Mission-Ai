const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('id="ideogram-style-tags"');
console.log(html.substring(s + 3500, s + 4500));
