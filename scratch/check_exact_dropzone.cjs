const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('id="ideogram-ref-dropzone"');
console.log(html.substring(s, s + 600));
