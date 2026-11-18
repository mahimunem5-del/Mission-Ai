const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('const headerContentHtml = isRemoveBg ?');
console.log(html.substring(s, s + 1800));
