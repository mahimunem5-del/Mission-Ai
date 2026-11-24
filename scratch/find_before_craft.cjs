const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idxCraft = html.indexOf('Craft it.');
console.log(html.substring(idxCraft - 2500, idxCraft));
