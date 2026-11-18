const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('id="ideogram-ref-slots-container"');
console.log(html.substring(s - 500, s));
