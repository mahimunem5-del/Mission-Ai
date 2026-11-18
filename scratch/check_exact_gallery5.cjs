const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('` : isPreciseEdit ? `');
console.log(html.substring(s + 800, s + 2000));
