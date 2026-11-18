const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const idx = content.indexOf('Design Templates');
console.log('Heading:', content.slice(idx - 50, idx + 100));
