const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('<div>${bodyHtml}</div>');
console.log(html.slice(idx, idx + 2000));
