const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const s = html.indexOf('function handleRemoveBgFile');
console.log(html.substring(s + 2000, s + 3200));
