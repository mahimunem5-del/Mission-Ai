const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('id="studio-lightbox-prompt-caption"');
console.log(html.substring(s - 100, s + 400));
