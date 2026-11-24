const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const marker = '<!-- Secret Template Admin Studio';
const scriptEnd = html.indexOf(marker);
const scriptPart = html.substring(scriptEnd - 1500, scriptEnd);
console.log(scriptPart);
