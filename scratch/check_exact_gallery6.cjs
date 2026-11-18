const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('Precise Edit Image');
console.log(html.substring(s, s + 1500));
