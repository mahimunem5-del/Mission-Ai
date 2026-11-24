const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('>Creations</h2>');
console.log(html.substring(Math.max(0, idx - 1200), idx - 500));
